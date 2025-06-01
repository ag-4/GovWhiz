import re
import json
import requests
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from mp_service import mp_service
from contact_handler import handle_contact_form
from scripts.automated_mp_updater import AutomatedMPUpdater

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize automated MP updater
mp_updater = AutomatedMPUpdater()

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
    Get MP information by postcode using automated updater with pattern matching support
    """
    formatted_postcode = format_postcode(postcode)
    
    # For partial postcodes (e.g., "SW1" or "E14"), use pattern matching
    if len(formatted_postcode.replace(" ", "")) <= 4:
        results = mp_updater.find_mp_by_pattern(formatted_postcode)
        if results:
            return {
                "found": True,
                "type": "pattern_match",
                "results": results,
                "count": len(results),
                "postcode": formatted_postcode
            }
        return {
            "error": "No MPs found for this postcode pattern",
            "found": False,
            "postcode": formatted_postcode
        }

    # For full postcodes, validate format
    if not validate_postcode(formatted_postcode):
        return {
            "error": "Invalid postcode format. Please use a valid UK postcode format (e.g., 'SW1A 1AA')",
            "found": False,
            "postcode": formatted_postcode
        }

    # Use automated updater for full postcode lookup
    result = mp_updater.process_postcode(formatted_postcode)
    
    if not result["success"]:
        return {
            "error": result["error"],
            "found": False,
            "postcode": formatted_postcode
        }
    
    mp_data = result["mp"]
    
    # Format response in the expected structure
    mp_info = {
        "found": True,
        "name": mp_data["name"],
        "party": mp_data["party"],
        "constituency": mp_data["constituency"],
        "email": mp_data["email"],
        "website": mp_data["website"],
        "phone": mp_data["phone"],
        "image": mp_data["image"],
        "postcode": formatted_postcode,
        "member_id": mp_data["member_id"],
        "social_media": mp_data.get("social_media", {}),
        "address": mp_data.get("address", ""),
        "timestamp": datetime.now().isoformat(),
        "last_updated": mp_data["last_updated"]
    }
    
    # Validate that we have the essential information
    if not mp_info["name"] or not mp_info["constituency"]:
        return {
            "error": "No valid MP information found for this postcode",
            "found": False,
            "postcode": formatted_postcode
        }
    
    return mp_info

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
