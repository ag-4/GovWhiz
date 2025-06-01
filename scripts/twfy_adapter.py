"""
TheyWorkForYou API adapter for MP data with caching
"""
import requests
import logging
from typing import Dict, Optional, List, Any
from datetime import datetime, timedelta
import re
import time
from ratelimit import limits, sleep_and_retry
import json
import os

class TheyWorkForYouAdapter:
    CALLS_PER_SECOND = 1  # Maximum 1 request per second
    CALLS_PER_DAY = 10000  # TheyWorkForYou default limit
    RETRY_ATTEMPTS = 3
    RETRY_DELAY = 1  # seconds
    CACHE_DURATION = timedelta(hours=1)  # Cache for 1 hour

    def __init__(self, api_key: Optional[str] = None, cache_dir: str = ".cache"):
        self.api_key = api_key or "AbcDefGhiJklMnoPqrStuVwxYz"  # Default test key
        self.base_url = "https://www.theyworkforyou.com/api"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'GovWhiz/1.0 (Civic Engagement Platform)'
        })
        self._last_calls = {}  # Track API call timestamps
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)

    def _get_cache_path(self, key: str) -> str:
        """Get the cache file path for a key"""
        return os.path.join(self.cache_dir, f"{key}.json")

    def _get_from_cache(self, key: str) -> Optional[Dict]:
        """Try to get data from cache"""
        cache_path = self._get_cache_path(key)
        try:
            if os.path.exists(cache_path):
                with open(cache_path, 'r') as f:
                    cached = json.load(f)
                if (datetime.fromisoformat(cached['timestamp']) + self.CACHE_DURATION) > datetime.now():
                    return cached['data']
        except Exception as e:
            logging.warning(f"Cache read error for {key}: {e}")
        return None

    def _save_to_cache(self, key: str, data: Any) -> None:
        """Save data to cache"""
        try:
            cache_path = self._get_cache_path(key)
            cached = {
                'timestamp': datetime.now().isoformat(),
                'data': data
            }
            with open(cache_path, 'w') as f:
                json.dump(cached, f)
        except Exception as e:
            logging.warning(f"Cache write error for {key}: {e}")
            
    @sleep_and_retry
    @limits(calls=CALLS_PER_SECOND, period=1)
    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict:
        """Make a rate-limited API request with caching and retries"""
        # Create cache key from endpoint and params
        cache_key = f"{endpoint}_{hash(frozenset(params.items()))}"
        
        # Try cache first
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached
            
        params['key'] = self.api_key
        params['output'] = 'js'  # JSON output
        
        for attempt in range(self.RETRY_ATTEMPTS):
            try:
                response = self.session.get(f"{self.base_url}/{endpoint}", params=params)
                response.raise_for_status()
                data = response.json()
                
                if "error" in data:
                    logging.warning(f"TheyWorkForYou API error for {endpoint}: {data['error']}")
                    if "exceeded" in str(data["error"]).lower():
                        # Rate limit exceeded, wait and retry
                        time.sleep(self.RETRY_DELAY * (attempt + 1))
                        continue
                    else:
                        raise requests.exceptions.RequestException(data["error"])
                
                clean_data = self._validate_data(data)
                self._save_to_cache(cache_key, clean_data)
                return clean_data
                
            except requests.exceptions.RequestException as e:
                if attempt < self.RETRY_ATTEMPTS - 1:
                    time.sleep(self.RETRY_DELAY * (attempt + 1))
                    continue
                logging.error(f"Error fetching data from TheyWorkForYou for {endpoint}: {e}")
                raise
                
        return {}  # Return empty dict if all retries failed
        
    def _validate_data(self, data: Dict) -> Dict:
        """Validate and clean API response data"""
        if isinstance(data, dict):
            return {k: v for k, v in data.items() if v is not None}
        elif isinstance(data, list):
            return [self._validate_data(item) for item in data if item is not None]
        return data
        
    def _clean_postcode(self, postcode: str) -> str:
        """Clean and format postcode"""
        return re.sub(r'\s+', '', postcode.upper())

    def get_all_mps(self) -> List[Dict]:
        """Get list of all current MPs"""
        try:
            # First try getMPs endpoint
            mps = self._make_request("getMPs", {"date": "now"})
            
            if not mps:
                # Fallback to getPerson endpoint
                mps = self._make_request("getPerson", {"id": "0"})  # Gets all people
                mps = [mp for mp in mps if mp.get("current_member", {}).get("house") == 1]
            
            return mps
        except Exception as e:
            logging.error(f"Error fetching MPs from TheyWorkForYou: {e}")
            return []

    def get_mp_details(self, person_id: str) -> Optional[Dict]:
        """Get detailed information about an MP"""
        try:
            # Get basic info
            mp_data = self._make_request("getPerson", {"id": person_id})
            if not mp_data:
                return None

            # Get voting record and additional info
            votes_data = self._make_request("getMP", {"id": person_id})
            
            # Combine and format the data
            return {
                "source": "theyworkforyou",
                "person_id": person_id,
                "name": mp_data.get("full_name"),
                "party": mp_data.get("party"),
                "constituency": mp_data.get("constituency"),
                "email": mp_data.get("email"),
                "website": mp_data.get("website"),
                "twitter": self._extract_twitter(mp_data.get("twitter_username") or ""),
                "facebook": self._extract_facebook(mp_data.get("facebook_page") or ""),
                "voting_record": votes_data.get("voting_record", {}),
                "speeches": votes_data.get("speeches", 0),
                "expenses": votes_data.get("expenses", {}),
                "last_updated": datetime.now().isoformat()
            }
        except Exception as e:
            logging.error(f"Error fetching MP details from TheyWorkForYou for {person_id}: {e}")
            return None

    def get_mp_by_postcode(self, postcode: str) -> Optional[Dict]:
        """Get MP information by postcode"""
        try:
            data = self._make_request("getMP", {"postcode": self._clean_postcode(postcode)})
            if not data or "error" in data:
                return None
            
            return self.get_mp_details(data.get("person_id"))
        except Exception as e:
            logging.error(f"Error fetching MP by postcode from TheyWorkForYou for {postcode}: {e}")
            return None

    def _extract_twitter(self, twitter: str) -> str:
        """Extract Twitter username from various formats"""
        if not twitter:
            return ""
        match = re.search(r'(?:@)?(\w+)/?$', twitter)
        return f"@{match.group(1)}" if match else twitter

    def _extract_facebook(self, facebook: str) -> str:
        """Extract Facebook URL from various formats"""
        if not facebook:
            return ""
        if not facebook.startswith(('http://', 'https://')):
            return f"https://www.facebook.com/{facebook}"
        return facebook
