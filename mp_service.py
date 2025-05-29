"""
Unified MP lookup service that combines functionality from all previous MP lookup implementations.
"""
import os
import json
import requests
from datetime import datetime
from typing import Dict, Optional

class MPLookupService:
    def __init__(self, api_key: str = None, cache_file: str = "data/mp_cache.json"):
        self.api_key = api_key or os.getenv('THEYWORKFORYOU_API_KEY')
        self.cache_file = cache_file
        self.cache = self._load_cache()
        self.base_url = "https://www.theyworkforyou.com/api"

    def _load_cache(self) -> Dict:
        """Load MP data from cache file"""
        try:
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def _save_cache(self):
        """Save MP data to cache file"""
        os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
        with open(self.cache_file, 'w') as f:
            json.dump(self.cache, f, indent=2)

    def lookup_mp(self, postcode: str) -> Dict:
        """
        Look up MP by postcode, using cache if available
        """
        # Clean and format postcode
        postcode = postcode.strip().upper()
        
        # Check cache first
        if postcode in self.cache:
            cached_data = self.cache[postcode]
            # Return cached data if it's less than 24 hours old
            cache_time = datetime.fromisoformat(cached_data['timestamp'])
            if (datetime.now() - cache_time).days < 1:
                return cached_data

        # If no API key, return mock data
        if not self.api_key or self.api_key == "your_api_key_here":
            return self._get_mock_data(postcode)

        # Make API request
        try:
            params = {
                "postcode": postcode,
                "key": self.api_key,
                "output": "json"
            }
            response = requests.get(f"{self.base_url}/getMP", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if "error" in data:
                return {
                    "found": False,
                    "error": data["error"],
                    "postcode": postcode
                }

            # Format and cache the response
            mp_info = {
                "found": True,
                "name": data.get("name", "Unknown"),
                "party": data.get("party", "Unknown"),
                "constituency": data.get("constituency", "Unknown"),
                "email": data.get("email", ""),
                "website": data.get("url", ""),
                "phone": data.get("phone", ""),
                "postcode": postcode,
                "timestamp": datetime.now().isoformat()
            }

            # Update cache
            self.cache[postcode] = mp_info
            self._save_cache()

            return mp_info

        except requests.RequestException as e:
            # Fallback to mock data on error
            return self._get_mock_data(postcode)

    def _get_mock_data(self, postcode: str) -> Dict:
        """Return mock MP data for testing or when API is unavailable"""
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
            # Add more mock data as needed
        }
        return mock_mps.get(postcode, {
            "found": False,
            "error": "MP data temporarily unavailable. Please try again later.",
            "postcode": postcode,
            "mock": True
        })

# Create a singleton instance
mp_service = MPLookupService()
