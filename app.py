import re
import json
import requests
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from mp_service import mp_service
from contact_handler import handle_contact_form

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
BASE_URL = "https://www.theyworkforyou.com/api"
API_KEY = "your_api_key_here"  # Replace with your actual API key

def validate_postcode(postcode):
    """Validate UK postcode format with improved validation"""
    if not postcode:
        return False
        
    # Remove all spaces and convert to uppercase
    postcode = postcode.replace(" ", "").upper()
    
    # Basic format validation
    pattern = r'^[A-Z]{1,2}[0-9R][0-9A-Z]?[0-9][A-Z]{2}$'
    if not re.match(pattern, postcode):
        return False
        
    # Additional validation for specific formats
    if len(postcode) < 5 or len(postcode) > 7:
        return False
        
    return True

def format_postcode(postcode):
    """Format postcode to standard format with improved handling"""
    if not postcode:
        return ""
        
    # Remove all spaces and convert to uppercase
    cleaned = postcode.replace(" ", "").upper()
    
    # Insert space before last 3 characters
    if len(cleaned) >= 3:
        return cleaned[:-3] + " " + cleaned[-3:]
    return cleaned

def get_mp_by_postcode(postcode):
    """
    Get MP information by postcode using TheyWorkForYou API with improved error handling
    """
    formatted_postcode = format_postcode(postcode)
    
    if not validate_postcode(formatted_postcode):
        return {
            "error": "Invalid postcode format. Please use a valid UK postcode format (e.g., 'SW1A 1AA')",
            "found": False,
            "postcode": formatted_postcode
        }

    url = f"{BASE_URL}/getMP"
    params = {
        "postcode": formatted_postcode,
        "key": API_KEY,
        "output": "json"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()

        if "error" in data:
            return {
                "error": data["error"], 
                "found": False,
                "postcode": formatted_postcode
            }
        
        # Extract and format MP information with additional validation
        mp_info = {
            "found": True,
            "name": data.get("name", "Unknown"),
            "party": data.get("party", "Unknown"),
            "constituency": data.get("constituency", "Unknown"),
            "email": data.get("email", ""),
            "website": data.get("url", ""),
            "office": data.get("office", ""),
            "phone": data.get("phone", ""),
            "image": data.get("image", ""),
            "postcode": formatted_postcode,
            "person_id": data.get("person_id", ""),
            "member_id": data.get("member_id", ""),
            "timestamp": datetime.now().isoformat()
        }
        
        # Validate required fields
        if not mp_info["name"] or mp_info["name"] == "Unknown":
            return {
                "error": "No MP found for this postcode",
                "found": False,
                "postcode": formatted_postcode
            }
        
        return mp_info
        
    except requests.exceptions.Timeout:
        return {
            "error": "Request timed out. Please try again.",
            "found": False,
            "postcode": formatted_postcode
        }
    except requests.exceptions.RequestException as e:
        return {
            "error": f"Network error: {str(e)}", 
            "found": False,
            "postcode": formatted_postcode
        }
    except json.JSONDecodeError:
        return {
            "error": "Invalid response from API", 
            "found": False,
            "postcode": formatted_postcode
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}", 
            "found": False,
            "postcode": formatted_postcode
        }

def get_mock_mp_data(postcode):
    """Fallback mock data when API is unavailable"""
    mock_mps = {
        'SW1A 1AA': {
            "found": True,
            "name": "Rt Hon Rishi Sunak MP",
            "party": "Conservative",
            "constituency": "Richmond (Yorks)",
            "email": "rishi.sunak.mp@parliament.uk",
            "website": "https://members.parliament.uk/member/4212/contact",
            "phone": "020 7219 5000",
            "postcode": postcode,
            "mock": True,
            "timestamp": datetime.now().isoformat()
        },
        'M1 1AA': {
            "found": True,
            "name": "Lucy Powell MP",
            "party": "Labour",
            "constituency": "Manchester Central",
            "email": "lucy.powell.mp@parliament.uk",
            "website": "https://members.parliament.uk/member/4057/contact",
            "phone": "020 7219 5000",
            "postcode": postcode,
            "mock": True,
            "timestamp": datetime.now().isoformat()
        },
        'B1 1AA': {
            "found": True,
            "name": "Shabana Mahmood MP",
            "party": "Labour",
            "constituency": "Birmingham Ladywood",
            "email": "shabana.mahmood.mp@parliament.uk",
            "website": "https://members.parliament.uk/member/1504/contact",
            "phone": "020 7219 5000",
            "postcode": postcode,
            "mock": True,
            "timestamp": datetime.now().isoformat()
        }
    }

    return mock_mps.get(postcode, {
        "found": False,
        "error": "MP data temporarily unavailable. Please try again later.",
        "postcode": postcode,
        "mock": True
    })

# API Routes
@app.route("/")
def home():
    """Serve the main GovWhiz page"""
    return render_template("index.html")

@app.route("/api/mp")
def mp_lookup():
    """MP lookup API endpoint"""
    postcode = request.args.get("postcode")
    use_mock = request.args.get("mock", "false").lower() == "true"
    
    if not postcode:
        return jsonify({"error": "Missing postcode parameter"}), 400

    try:
        if use_mock or API_KEY == "your_api_key_here":
            # Use mock data if no API key or explicitly requested
            info = get_mock_mp_data(format_postcode(postcode))
        else:
            # Try real API first
            info = get_mp_by_postcode(postcode)
            
            # Fallback to mock if real API fails
            if not info.get("found") and "Network error" in info.get("error", ""):
                info = get_mock_mp_data(format_postcode(postcode))
                info["fallback"] = True
        
        return jsonify(info)
        
    except Exception as e:
        return jsonify({
            "error": f"Server error: {str(e)}",
            "found": False
        }), 500

@app.route("/api/mp/<postcode>")
def mp_lookup_path(postcode):
    """MP lookup with postcode in URL path"""
    try:
        info = get_mp_by_postcode(postcode)
        return jsonify(info)
    except Exception as e:
        return jsonify({
            "error": f"Server error: {str(e)}",
            "found": False
        }), 500

@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_configured": API_KEY != "your_api_key_here"
    })

@app.route("/api/test")
def test_postcodes():
    """Test endpoint with sample postcodes"""
    test_codes = ["SW1A 1AA", "M1 1AA", "B1 1AA", "BS1 1AA"]
    results = {}
    
    for postcode in test_codes:
        results[postcode] = get_mock_mp_data(postcode)
    
    return jsonify({
        "test_postcodes": results,
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/contact", methods=["POST"])
def contact_mp():
    """Handle MP contact form submissions"""
    return handle_contact_form()

@app.route('/api/mp', methods=['GET'])
def mp_lookup_live():
    """Lookup MP by postcode using open data sources (no API key required)"""
    postcode = request.args.get('postcode', '').strip().replace(' ', '').upper()
    if not postcode:
        return jsonify({'error': 'Missing postcode parameter'}), 400

    # Step 1: Get constituency from postcodes.io
    try:
        pc_resp = requests.get(f'https://api.postcodes.io/postcodes/{postcode}')
        pc_data = pc_resp.json()
        if pc_resp.status_code != 200 or 'result' not in pc_data or not pc_data['result']:
            return jsonify({'error': 'Invalid postcode or not found'}), 404
        constituency = pc_data['result'].get('parliamentary_constituency')
        if not constituency:
            return jsonify({'error': 'Constituency not found for this postcode'}), 404
    except Exception as e:
        return jsonify({'error': f'Postcode lookup failed: {str(e)}'}), 500

    # Step 2: Get MP from Parliament Members API
    try:
        # Search for current MPs in this constituency
        url = f'https://members-api.parliament.uk/api/Location/Constituency/Search?searchText={constituency}'
        resp = requests.get(url)
        data = resp.json()
        if not data.get('items'):
            return jsonify({'error': 'No MP found for this constituency'}), 404
        # Get the first matching constituency
        constituency_id = data['items'][0]['value']['id']
        # Get MP for this constituency
        mp_url = f'https://members-api.parliament.uk/api/Location/Constituency/{constituency_id}/Representatives'
        mp_resp = requests.get(mp_url)
        mp_data = mp_resp.json()
        if not mp_data.get('value') or not mp_data['value']:
            return jsonify({'error': 'No MP found for this constituency'}), 404
        mp = mp_data['value'][0]
        # Build comprehensive MP info
        mp_info = {
            'name': mp['nameFull'],
            'party': mp['latestParty']['name'],
            'constituency': constituency,
            'email': mp.get('email'),
            'website': mp.get('url'),
            'image': mp['thumbnailUrl'],
            'member_id': mp['id'],
            'biography': mp.get('biography'),
            'twitter': mp.get('twitter'),
            'facebook': mp.get('facebook'),
            'phone': mp.get('phoneNumber'),
            'current': mp.get('current', True)
        }
        return jsonify({'found': True, 'mp': mp_info})
    except Exception as e:
        return jsonify({'error': f'MP lookup failed: {str(e)}'}), 500

if __name__ == "__main__":
    print("🏛️ Starting GovWhiz MP Lookup API Server")
    print("=" * 50)
    print(f"API Key configured: {API_KEY != 'your_api_key_here'}")
    print("Available endpoints:")
    print("  GET /                    - Main GovWhiz page")
    print("  GET /api/mp?postcode=... - MP lookup")
    print("  GET /api/health          - Health check")
    print("  GET /api/test            - Test with sample data")
    print("  POST /api/contact        - Contact MP form submission")
    print("=" * 50)
    
    app.run(debug=True, host="0.0.0.0", port=5000)
