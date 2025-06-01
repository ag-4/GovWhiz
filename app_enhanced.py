"""
Enhanced GovWhiz Application
Integrates MP lookup, news fetching, and contact functionality
"""
from flask import Flask, jsonify, request
from enhanced_contact_handler import contact_handler
from news_service import news_service
from mp_lookup_service import MPLookupService
import logging
from datetime import datetime
import os

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

@app.route('/api/mp-lookup', methods=['GET'])
async def mp_lookup():
    """Handle MP lookup requests"""
    try:
        postcode = request.args.get('postcode')
        if not postcode:
            return jsonify({"success": False, "error": "No postcode provided"}), 400

        # Get MP info
        mp_service = MPLookupService()
        result = await mp_service.lookup_mp(postcode)
        
        if not result['found']:
            return jsonify({"success": False, "error": result['error']}), 404

        # Get news articles
        mp_news = await news_service.fetch_guardian_news(f"{result['mp']['name']} {result['constituency']}")
        bbc_news = await news_service.fetch_bbc_news(f"{result['mp']['name']} {result['constituency']}")

        # Combine results
        result['mp']['news'] = {
            'guardian': mp_news,
            'bbc': bbc_news
        }

        return jsonify({"success": True, "data": result}), 200

    except Exception as e:
        logging.error(f"MP lookup error: {e}")
        return jsonify({
            "success": False,
            "error": "An error occurred while looking up MP information"
        }), 500

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    """Handle contact form submissions"""
    result, status_code = contact_handler.handle_submission()
    return jsonify(result), status_code

@app.route('/api/news/guardian', methods=['GET'])
async def get_guardian_news():
    """Handle Guardian news requests"""
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({"success": False, "error": "No search query provided"}), 400

        articles = await news_service.fetch_guardian_news(query)
        return jsonify({"success": True, "articles": articles}), 200

    except Exception as e:
        logging.error(f"Guardian news error: {e}")
        return jsonify({
            "success": False,
            "error": "An error occurred while fetching news"
        }), 500

@app.route('/api/news/bbc', methods=['GET'])
async def get_bbc_news():
    """Handle BBC news requests"""
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({"success": False, "error": "No search query provided"}), 400

        articles = await news_service.fetch_bbc_news(query)
        return jsonify({"success": True, "articles": articles}), 200

    except Exception as e:
        logging.error(f"BBC news error: {e}")
        return jsonify({
            "success": False,
            "error": "An error occurred while fetching news"
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "success": False,
        "error": "An internal server error occurred"
    }), 500

if __name__ == '__main__':
    # Ensure required directories exist
    os.makedirs('data/news_cache', exist_ok=True)
    os.makedirs('data/mp_cache', exist_ok=True)
    
    # Start server
    app.run(debug=True, port=5000)