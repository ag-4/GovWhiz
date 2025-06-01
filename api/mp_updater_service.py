"""
MP Updater Service
Provides API endpoints for the automated MP database updater
"""

from flask import Flask, jsonify, request
import sys
import os
from pathlib import Path

# Add the scripts directory to Python path
scripts_dir = Path(__file__).parent.parent / "scripts"
sys.path.append(str(scripts_dir))

from automated_mp_updater import AutomatedMPUpdater

app = Flask(__name__)
updater = AutomatedMPUpdater()

@app.route('/api/mp/lookup', methods=['GET'])
def lookup_mp():
    """Look up MP by postcode (full or partial)"""
    postcode = request.args.get('postcode', '').strip()
    if not postcode:
        return jsonify({"error": "Postcode is required"}), 400

    # For partial postcodes, use pattern matching
    if len(postcode) <= 4:
        results = updater.find_mp_by_pattern(postcode)
        if results:
            return jsonify({
                "success": True,
                "type": "pattern_match",
                "results": results,
                "count": len(results)
            })
        return jsonify({"error": "No MPs found for this postcode pattern"}), 404

    # For full postcodes, do a complete lookup
    result = updater.process_postcode(postcode)
    if result["success"]:
        return jsonify(result)
    return jsonify({"error": result["error"]}), 404

@app.route('/api/mp/update', methods=['POST'])
def update_mp():
    """Force update MP information for a constituency"""
    constituency = request.json.get('constituency')
    if not constituency:
        return jsonify({"error": "Constituency is required"}), 400

    mp_info = updater.get_mp_details(constituency)
    if mp_info:
        updater.database["constituencies"][constituency] = mp_info
        updater.save_database()
        return jsonify({"success": True, "mp": mp_info})
    return jsonify({"error": "Could not update MP information"}), 500

@app.route('/api/mp/update-all', methods=['POST'])
def update_all():
    """Update all MP information in the database"""
    result = updater.update_all_constituencies()
    return jsonify(result)

@app.route('/api/mp/status', methods=['GET'])
def get_status():
    """Get the current status of the MP database"""
    return jsonify({
        "version": updater.database.get("version"),
        "last_updated": updater.database.get("last_updated"),
        "constituency_count": len(updater.database.get("constituencies", {})),
        "pattern_count": len(updater.database.get("postcode_patterns", {})),
        "update_status": updater.database.get("update_status", {})
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
