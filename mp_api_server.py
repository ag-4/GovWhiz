#!/usr/bin/env python3
"""
Simple Flask API server for MP lookup
Serves the MP lookup functionality as a web API
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mp_lookup_service import MPLookupService

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the MP lookup service
mp_service = MPLookupService()

@app.route('/lookup/<postcode>')
def lookup_mp(postcode):
    """
    API endpoint to lookup MP by postcode
    """
    try:
        result = mp_service.lookup_mp(postcode)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "found": False,
            "error": str(e),
            "postcode": postcode
        }), 500

@app.route('/api/mp-lookup', methods=['POST'])
def api_lookup_mp():
    """
    POST endpoint for MP lookup
    """
    try:
        data = request.get_json()
        postcode = data.get('postcode', '')
        
        if not postcode:
            return jsonify({
                "found": False,
                "error": "Postcode is required"
            }), 400
            
        result = mp_service.lookup_mp(postcode)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "found": False,
            "error": str(e)
        }), 500

@app.route('/health')
def health_check():
    """
    Health check endpoint
    """
    return jsonify({"status": "healthy", "service": "MP Lookup API"})

@app.route('/')
def index():
    """
    Root endpoint with service information
    """
    return jsonify({
        "service": "GovWhiz MP Lookup API",
        "version": "1.0",
        "endpoints": {
            "/lookup/<postcode>": "GET - Lookup MP by postcode",
            "/api/mp-lookup": "POST - Lookup MP (JSON body with 'postcode' field)",
            "/health": "GET - Health check"
        }
    })

if __name__ == '__main__':
    print("🚀 Starting GovWhiz MP Lookup API Server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🔍 Test with: http://localhost:5000/lookup/SW1A0AA")
    app.run(debug=True, host='0.0.0.0', port=5000)
