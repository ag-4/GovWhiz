from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Cache for MP data to reduce API calls
mp_cache = {}
CACHE_DURATION = 3600  # 1 hour cache

def get_cached_mp(postcode):
    """Get cached MP data if available and not expired"""
    if postcode in mp_cache:
        data = mp_cache[postcode]
        if time.time() - data['timestamp'] < CACHE_DURATION:
            return data['data']
    return None

def set_cached_mp(postcode, data):
    """Cache MP data with timestamp"""
    mp_cache[postcode] = {
        'data': data,
        'timestamp': time.time()
    }

@app.route('/.netlify/functions/handler', methods=['GET'])
def handle_request():
    """Main handler for Netlify functions"""
    if request.path == '/.netlify/functions/handler/health':
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '2.0.0'
        })

    postcode = request.args.get('postcode')
    if not postcode:
        return jsonify({
            'error': 'Missing postcode parameter',
            'found': False
        }), 400

    # Check cache first
    cached_data = get_cached_mp(postcode)
    if cached_data:
        return jsonify(cached_data)

    # Your existing MP lookup logic here
    # For now, return mock data
    mock_data = {
        'found': True,
        'name': 'Test MP',
        'constituency': 'Test Constituency',
        'postcode': postcode,
        'timestamp': datetime.now().isoformat()
    }

    # Cache the result
    set_cached_mp(postcode, mock_data)
    return jsonify(mock_data)

def handler(event, context):
    """AWS Lambda / Netlify Function handler"""
    return app(event, context)
