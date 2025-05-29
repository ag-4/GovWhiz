#!/usr/bin/env python3
"""
Simple Flask test to verify setup
"""

try:
    from flask import Flask, jsonify
    from flask_cors import CORS
    import requests
    
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/')
    def home():
        return jsonify({
            "message": "🏛️ GovWhiz Flask Backend is running!",
            "status": "success",
            "endpoints": [
                "/api/mp?postcode=SW1A1AA",
                "/api/health",
                "/api/test"
            ]
        })
    
    @app.route('/api/health')
    def health():
        return jsonify({
            "status": "healthy",
            "message": "Flask server is running"
        })
    
    @app.route('/api/mp')
    def mp_lookup():
        postcode = request.args.get('postcode', 'SW1A 1AA')
        return jsonify({
            "found": True,
            "name": "Test MP",
            "party": "Test Party",
            "constituency": "Test Constituency",
            "postcode": postcode,
            "message": "This is test data - Flask backend is working!"
        })
    
    if __name__ == '__main__':
        print("🚀 Starting Flask test server...")
        app.run(debug=True, host='0.0.0.0', port=5000)
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install Flask: pip install flask flask-cors")
except Exception as e:
    print(f"❌ Error: {e}")
