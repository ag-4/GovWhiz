"""
Enhanced UK MP Information System
Combines TheyWorkForYou and PostcodesIO APIs with local caching
"""
import requests
import json
import time
import re
import os
from urllib.parse import urljoin, quote_plus
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class MPLookupService:
    def __init__(self, db_path="mp_database.json", config_path="config.json"):
        self.db_path = os.path.abspath(db_path)
        self.config_path = config_path
        self.validate_regex = re.compile(r'^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$', re.IGNORECASE)
        self.cache_duration = timedelta(hours=1)
        self.load_config()
        self.load_database()
        
    def load_config(self):
        """Load API configuration"""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                self.twfy_api_key = config.get('twfy_api_key', '')
                self.twfy_api_url = config.get('twfy_api_url', 'https://www.theyworkforyou.com/api/')
                self.postcodes_api_url = config.get('postcodes_api_url', 'https://api.postcodes.io/postcodes/')
        except Exception as e:
            logging.error(f"Error loading config: {e}")
            self.twfy_api_key = os.environ.get('TWFY_API_KEY', '')
            self.twfy_api_url = 'https://www.theyworkforyou.com/api/'
            self.postcodes_api_url = 'https://api.postcodes.io/postcodes/'

    def load_database(self):
        """Load MP database from file or create new one"""
        try:
            if os.path.exists(self.db_path):
                with open(self.db_path, 'r') as f:
                    self.db = json.load(f)
            else:
                self.db = {
                    "version": "2024.1",
                    "last_updated": datetime.now().isoformat(),
                    "constituencies": {},
                    "postcode_map": {},
                    "cache": {}
                }
                self.save_database()
        except Exception as e:
            logging.error(f"Error loading database: {e}")
            self.db = {
                "version": "2024.1",
                "last_updated": datetime.now().isoformat(),
                "constituencies": {},
                "postcode_map": {},
                "cache": {}
            }

    def save_database(self):
        """Save MP database to file"""
        try:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            with open(self.db_path, 'w') as f:
                json.dump(self.db, f, indent=2)
        except Exception as e:
            logging.error(f"Error saving database: {e}")

    def clean_postcode(self, postcode: str) -> str:
        """Clean and format postcode"""
        return re.sub(r'\s+', '', postcode).upper()

    def validate_postcode(self, postcode: str) -> bool:
        """Validate postcode format"""
        return bool(self.validate_regex.match(postcode))    def get_from_cache(self, key: str) -> Tuple[bool, Optional[dict]]:
        """Get data from cache if not expired"""
        cache = self.db.get('cache', {})
        if key in cache:
            data = cache[key]
            if datetime.fromisoformat(data['timestamp']) + self.cache_duration > datetime.now():
                return True, data['data']
        return False, None

    def save_to_cache(self, key: str, data: dict):
        """Save data to cache with timestamp"""
        if 'cache' not in self.db:
            self.db['cache'] = {}
        self.db['cache'][key] = {
            'data': data,
            'timestamp': datetime.now().isoformat()
        }
        self.save_database()

    def validate_mp_data(self, data: dict) -> Tuple[bool, Optional[str]]:
        """Validate MP data structure and required fields
        
        Args:
            data: MP data dictionary from API
            
        Returns:
            Tuple of (is_valid: bool, error_message: Optional[str])
        """
        if not isinstance(data, dict):
            return False, "Invalid MP data format"

        # Check for minimum required fields
        required_fields = {
            'given_name': 'first name',
            'family_name': 'last name',
            'party': 'party affiliation'
        }

        for field, desc in required_fields.items():
            if not data.get(field):
                return False, f"Missing required MP {desc}"

        return True, None

    async def get_constituency_from_postcode(self, postcode: str) -> Tuple[bool, Dict]:
        """Get constituency information from PostcodesIO API"""
        try:
            cache_key = f"postcode_{postcode}"
            cached = self.get_from_cache(cache_key)
            if cached:
                return True, cached

            response = requests.get(f"{self.postcodes_api_url}{quote_plus(postcode)}")
            if response.status_code != 200:
                return False, {"error": "Postcode lookup failed"}

            data = response.json()
            if not data.get('result') or not data['result'].get('parliamentary_constituency'):
                return False, {"error": "No constituency found for this postcode"}

            result = {
                "constituency": data['result']['parliamentary_constituency'],
                "location": {
                    "lat": data['result']['latitude'],
                    "lon": data['result']['longitude']
                }
            }

            self.save_to_cache(cache_key, result)
            return True, result

        except Exception as e:
            logging.error(f"Postcode lookup error: {e}")
            return False, {"error": str(e)}

    async def get_mp_from_constituency(self, constituency: str) -> Tuple[bool, Dict]:
        """Get MP information from TheyWorkForYou API"""
        if not constituency or not isinstance(constituency, str):
            return False, {"error": "Invalid constituency name"}

        # Check cache first
        cache_key = f"constituency_{constituency}"
        cache_exists, cached_result = self.get_from_cache(cache_key)
        if cache_exists and cached_result:
            # Only return True if we have all required fields
            is_valid, error_msg = self.validate_mp_data(cached_result)
            if is_valid:
                return True, cached_result
            logging.error(f"Invalid cached data for constituency {constituency}: {error_msg}")
            # If cache is invalid, continue with API call
            
        params = {
            'key': self.twfy_api_key,
            'constituency': constituency,
            'output': 'js'
        }

        try:
            response = requests.get(
                urljoin(self.twfy_api_url, 'getMPs'),
                params=params,
                timeout=10
            )
        except requests.exceptions.Timeout:
            logging.error(f"Request timed out for constituency {constituency}")
            return False, {"error": "Request timed out"}
        except requests.exceptions.RequestException as e:
            logging.error(f"Network error looking up MP for constituency {constituency}: {e}")
            return False, {"error": f"Network error: {str(e)}"}

        if response.status_code == 429:
            logging.error(f"Rate limit exceeded for constituency {constituency}")
            return False, {"error": "Rate limit exceeded"}
        if response.status_code != 200:
            error_msg = "MP lookup failed"
            if response.status_code == 401:
                error_msg = "Invalid API key"
            elif response.status_code >= 500:
                error_msg = "Server error"
            logging.error(f"{error_msg} (status {response.status_code}) for constituency {constituency}")
            return False, {"error": error_msg}

        try:
            data = response.json()
        except (ValueError, json.JSONDecodeError):
            logging.error(f"Invalid JSON response for constituency {constituency}")
            return False, {"error": "Invalid response from API"}

        # Validate response structure
        if not isinstance(data, list):
            logging.error(f"Invalid response format from API for constituency {constituency}")
            return False, {"error": "Invalid response format from API"}
        if not data:
            logging.error(f"No MP data found for constituency {constituency}")
            return False, {"error": "No valid MP data found for this constituency"}
            
        # Get first MP and validate data
        mp_data = data[0]
        is_valid, error_msg = self.validate_mp_data(mp_data)
        if not is_valid:
            logging.error(f"Invalid MP data for constituency {constituency}: {error_msg}")
            return False, {"error": error_msg}

        # Format MP data
        result = {
            "name": f"{mp_data.get('given_name', '')} {mp_data.get('family_name', '')}".strip(),
            "party": mp_data.get('party', ''),
            "constituency": constituency,
            "email": mp_data.get('email', ''),
            "phone": mp_data.get('office_phone', ''),
            "website": mp_data.get('url', ''),
            "twitter": mp_data.get('twitter_username', ''),
            "image_url": mp_data.get('image', '')
        }

        # Final validation of formatted result
        if not result["name"] or not result["party"]:
            logging.error(f"Missing required fields in formatted MP data for constituency {constituency}")
            return False, {"error": "Missing required MP information"}

        # Cache successful result
        self.save_to_cache(cache_key, result)
        return True, result

    async def find_mp(self, postcode: str) -> Dict:
        """Main method to find MP by postcode"""
        try:
            postcode = self.clean_postcode(postcode)
            if not self.validate_postcode(postcode):
                return {
                    "found": False,
                    "error": "Invalid postcode format"
                }

            # Get constituency from postcode
            constituency_success, constituency_data = await self.get_constituency_from_postcode(postcode)
            if not constituency_success:
                return {
                    "found": False,
                    "error": constituency_data.get("error", "Could not find constituency")
                }

            # Get MP from constituency
            mp_success, mp_data = await self.get_mp_from_constituency(constituency_data["constituency"])
            if not mp_success:
                return {
                    "found": False,
                    "error": mp_data.get("error", "Could not find MP"),
                    "constituency": constituency_data["constituency"]
                }

            return {
                "found": True,
                "mp": mp_data,
                "constituency": constituency_data["constituency"],
                "location": constituency_data.get("location")
            }

        except Exception as e:
            logging.error(f"MP lookup error: {e}")
            return {
                "found": False,
                "error": str(e)
            }

    def clear_cache(self):
        """Clear all cached data"""
        self.db['cache'] = {}
        self.save_database()

    def test_lookup(self, postcode="SW1A 0AA"):
        """Test the MP lookup functionality"""
        print(f"🧪 Testing MP lookup with postcode: {postcode}")
        try:
            result = self.lookup_mp(postcode)
            if result["found"]:
                print("✅ MP lookup successful:")
                print(json.dumps(result, indent=2))
                return True
            else:
                print("❌ MP lookup failed - no results")
                return False
        except Exception as e:
            print(f"❌ MP lookup failed with error: {str(e)}")
            return False

if __name__ == "__main__":
    import sys
    service = MPLookupService()
    if "--test" in sys.argv:
        test_postcode = sys.argv[sys.argv.index("--test") + 1] if len(sys.argv) > sys.argv.index("--test") + 1 else "SW1A 0AA"
        service.test_lookup(test_postcode)
    else:
        print("🔄 Database update functionality - currently using API fallback")
        print("✅ Database will be updated automatically when new postcodes are looked up")
