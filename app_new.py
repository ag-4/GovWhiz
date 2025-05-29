from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os
from mp_service import mp_service

app = Flask(__name__, 
    static_folder=os.path.abspath("static"),
    template_folder=os.path.abspath(".")
)
CORS(app)  # Enable CORS for all routes

# API Routes
@app.route("/")
def home():
    """Serve the main GovWhiz page"""
    return render_template("index.html")

@app.route("/static/<path:path>")
def serve_static(path):
    """Serve static files"""
    return send_from_directory("static", path)

@app.route("/api/find_mp", methods=["POST"])
def find_mp():
    """Enhanced MP lookup API endpoint"""
    data = request.get_json()
    postcode = data.get("postcode") if data else None
    
    if not postcode:
        return jsonify({"error": "Missing postcode", "found": False}), 400

    try:
        # Use the unified MP service
        info = mp_service.lookup_mp(postcode)
        return jsonify(info)
    except Exception as e:
        return jsonify({
            "error": "An error occurred while looking up your MP",
            "found": False,
            "details": str(e)
        }), 500

@app.route("/api/constituencies")
def get_constituencies():
    """Get list of constituencies, optionally filtered by search query"""
    query = request.args.get("q", "").strip()
    
    try:
        if query:
            constituencies = mp_service.search_constituencies(query)
        else:
            constituencies = mp_service.get_all_constituencies()
        return jsonify({"constituencies": constituencies})
    except Exception as e:
        return jsonify({
            "error": "An error occurred while fetching constituencies",
            "details": str(e)
        }), 500

@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_configured": mp_service.api_key != "your_api_key_here"
    })

@app.route("/api/test")
def test_postcodes():
    """Test endpoint with sample postcodes"""
    test_codes = ["SW1A 1AA", "M1 1AA", "B1 1AA"]
    results = {}
    
    for postcode in test_codes:
        results[postcode] = mp_service.lookup_mp(postcode)
    
    return jsonify({
        "test_postcodes": results,
        "timestamp": datetime.now().isoformat()
    })

if __name__ == "__main__":
    print("🏛️ Starting GovWhiz MP Lookup API Server")
    print("=" * 50)
    print(f"API Key configured: {mp_service.api_key != 'your_api_key_here'}")
    print("Available endpoints:")
    print("  GET /                    - Main GovWhiz page")
    print("  GET /api/mp?postcode=... - MP lookup")
    print("  GET /api/health          - Health check")
    print("  GET /api/test            - Test with sample data")
    print("=" * 50)
    
    app.run(debug=True, host="0.0.0.0", port=5000)
