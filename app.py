from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from mp_service import mp_service

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def validate_postcode(postcode):
    """Validate UK postcode format"""
    pattern = r'^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$'
    return bool(re.match(pattern, postcode.strip().upper()))

def format_postcode(postcode):
    """Format postcode to standard format"""
    cleaned = postcode.replace(' ', '').upper()
    # Insert space before last 3 characters
    return cleaned[:-3] + ' ' + cleaned[-3:]

def get_mp_by_postcode(postcode):
    """
    Get MP information by postcode using TheyWorkForYou API
    """
    formatted_postcode = format_postcode(postcode)
    
    if not validate_postcode(formatted_postcode):
        return {
            "error": "Invalid postcode format. Please use format like 'SW1A 1AA'",
            "found": False
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
        
        # Extract and format MP information
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
        
        return mp_info
        
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

if __name__ == "__main__":
    print("🏛️ Starting GovWhiz MP Lookup API Server")
    print("=" * 50)
    print(f"API Key configured: {API_KEY != 'your_api_key_here'}")
    print("Available endpoints:")
    print("  GET /                    - Main GovWhiz page")
    print("  GET /api/mp?postcode=... - MP lookup")
    print("  GET /api/health          - Health check")
    print("  GET /api/test            - Test with sample data")
    print("=" * 50)
    
    app.run(debug=True, host="0.0.0.0", port=5000)
