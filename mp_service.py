"""
Enhanced MP lookup service with comprehensive UK coverage using local data.
"""
import os
import json
import requests
import re
from datetime import datetime
from typing import Dict, Optional, List, Tuple

class MPLookupService:
    def __init__(self):
        self.mps_file = "data/cleaned_mps.json"
        self.constituencies_file = "data/constituency_lookup.json"
        self.postcode_cache_file = "data/constituency_cache.json"
        self.mp_database_file = "data/mp_database.json"
        self.api_key = os.getenv('THEYWORKFORYOU_API_KEY', 'your_api_key_here')
        
        # Load data files
        self.mps_data = self._load_json(self.mps_file)
        self.constituency_data = self._load_json(self.constituencies_file)
        self.postcode_cache = self._load_json(self.postcode_cache_file)
        self.mp_database = self._load_json(self.mp_database_file)
        
        if self.postcode_cache is None:
            self.postcode_cache = {}

    def _load_json(self, file_path: str) -> Dict:
        """Load JSON data from file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def _save_postcode_cache(self):
        """Save postcode to constituency mapping cache"""
        os.makedirs(os.path.dirname(self.postcode_cache_file), exist_ok=True)
        with open(self.postcode_cache_file, 'w', encoding='utf-8') as f:
            json.dump(self.postcode_cache, f, indent=2)    def _validate_postcode(self, postcode: str) -> bool:
        """Validate UK postcode format"""
        # UK postcode regex pattern
        pattern = r'^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$'
        return bool(re.match(pattern, postcode.upper().strip()))

    def _get_constituency_from_postcode(self, postcode: str) -> Optional[str]:
        """Get constituency name from postcode using local database and API fallback"""
        postcode = postcode.upper().strip()
        
        # First try the cache
        if postcode in self.postcode_cache:
            return self.postcode_cache[postcode]["constituency"]

        # Load the postcode mapping database
        try:
            with open("data/mp_database.json", 'r', encoding='utf-8') as f:
                mp_db = json.load(f)
                postcode_map = mp_db.get("postcode_map", {})
        except (FileNotFoundError, json.JSONDecodeError):
            postcode_map = {}

        # Extract district from full postcode (e.g., "SW1A 1AA" -> "SW1A")
        district = postcode.split()[0] if ' ' in postcode else postcode[:4].rstrip()
        
        # Check if we have the district in our local database
        if district in postcode_map:
            constituency = postcode_map[district]
            # Cache the result
            self.postcode_cache[postcode] = {
                "constituency": constituency,
                "timestamp": datetime.now().isoformat()
            }
            self._save_postcode_cache()
            return constituency

        # Fallback to API if district not found
        try:
            url = f"https://api.postcodes.io/postcodes/{postcode.replace(' ', '')}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()

            if data["status"] == 200 and "result" in data:
                constituency = data["result"]["parliamentary_constituency"]
                
                # Cache the result
                self.postcode_cache[postcode] = {
                    "constituency": constituency,
                    "timestamp": datetime.now().isoformat()
                }
                self._save_postcode_cache()
                
                return constituency

        except (requests.RequestException, KeyError, json.JSONDecodeError):
            pass

        return None

    def lookup_mp(self, postcode: str) -> Dict:
        """Look up MP by postcode using local data and ONS Postcodes API"""
        # Clean and validate postcode
        postcode = postcode.strip().upper()
        if not self._validate_postcode(postcode):
            return {
                "found": False,
                "error": "Invalid postcode format",
                "postcode": postcode
            }

        # Get constituency from postcode
        constituency = self._get_constituency_from_postcode(postcode)
        if not constituency:
            return {
                "found": False,
                "error": "Could not find constituency for this postcode",
                "postcode": postcode
            }

        # Look up MP data from our local constituency data
        constituency_info = self.constituency_data.get("constituencies", {}).get(constituency)
        if not constituency_info:
            return {
                "found": False,
                "error": "No MP information available for this constituency",
                "postcode": postcode,
                "constituency": constituency
            }

        # Return formatted MP info
        return {
            "found": True,
            "name": constituency_info["name"],
            "party": constituency_info["party"],
            "constituency": constituency,
            "email": constituency_info["email"],
            "phone": constituency_info["phone"],
            "profile_url": constituency_info["profile_url"],
            "postcode": postcode,
            "timestamp": datetime.now().isoformat()
        }

    def get_all_constituencies(self) -> List[str]:
        """Get a list of all constituencies"""
        return list(self.constituency_data.get("constituencies", {}).keys())

    def search_constituencies(self, query: str) -> List[str]:
        """Search constituencies by name"""
        query = query.lower()
        all_constituencies = self.get_all_constituencies()
        return [c for c in all_constituencies if query in c.lower()]

# Create a singleton instance
mp_service = MPLookupService()
