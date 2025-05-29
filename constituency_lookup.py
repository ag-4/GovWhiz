#!/usr/bin/env python3
"""
🏛️ UK Constituency Lookup System
Real postcode to constituency mapping using MySociety MapIt API
Integrated with MP lookup for comprehensive political information
"""

import requests
import json
import time
import sys
from datetime import datetime

class ConstituencyLookup:
    def __init__(self):
        self.base_url = "https://mapit.mysociety.org"
        self.cache = {}
        self.cache_file = "data/constituency_cache.json"
        self.load_cache()

    def load_cache(self):
        """Load cached constituency data"""
        try:
            with open(self.cache_file, 'r') as f:
                self.cache = json.load(f)
            print(f"📁 Loaded {len(self.cache)} cached constituencies")
        except FileNotFoundError:
            print("📁 No cache file found, starting fresh")
            self.cache = {}

    def save_cache(self):
        """Save constituency data to cache"""
        try:
            import os
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            with open(self.cache_file, 'w') as f:
                json.dump(self.cache, f, indent=2)
            print(f"💾 Saved {len(self.cache)} constituencies to cache")
        except Exception as e:
            print(f"❌ Error saving cache: {e}")

    def get_constituency(self, postcode):
        """Get constituency name from postcode"""
        # Clean postcode
        clean_postcode = postcode.replace(' ', '').upper()

        # Check cache first
        if clean_postcode in self.cache:
            print(f"📋 Using cached data for {postcode}")
            return self.cache[clean_postcode]

        # Make API request
        url = f"{self.base_url}/postcode/{clean_postcode}"

        try:
            print(f"🌐 Looking up constituency for {postcode}...")
            response = requests.get(url, timeout=10)

            if response.status_code != 200:
                error_msg = f"Invalid postcode or API failed (Status: {response.status_code})"
                print(f"❌ {error_msg}")
                return {"error": error_msg}

            data = response.json()

            # Find Westminster Parliamentary Constituency
            for area in data['areas'].values():
                if area['type'] == 'WMC':  # Westminster Parliamentary Constituency
                    constituency_info = {
                        "constituency": area['name'],
                        "id": area['id'],
                        "type": area['type'],
                        "postcode": postcode,
                        "lookup_time": datetime.now().isoformat()
                    }

                    # Cache the result
                    self.cache[clean_postcode] = constituency_info
                    print(f"✅ Found: {area['name']}")
                    return constituency_info

            error_msg = "Constituency not found for this postcode"
            print(f"❌ {error_msg}")
            return {"error": error_msg}

        except requests.exceptions.Timeout:
            error_msg = "Request timed out - please try again"
            print(f"❌ {error_msg}")
            return {"error": error_msg}
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error: {str(e)}"
            print(f"❌ {error_msg}")
            return {"error": error_msg}
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            print(f"❌ {error_msg}")
            return {"error": error_msg}

    def get_multiple_constituencies(self, postcodes):
        """Get constituencies for multiple postcodes"""
        results = {}

        for postcode in postcodes:
            result = self.get_constituency(postcode)
            results[postcode] = result

            # Be nice to the API - small delay between requests
            if not postcode.replace(' ', '').upper() in self.cache:
                time.sleep(0.5)

        return results

    def validate_postcode_format(self, postcode):
        """Basic UK postcode format validation"""
        import re

        # UK postcode regex pattern
        pattern = r'^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$'
        clean_postcode = postcode.replace(' ', '').upper()

        # Add space in correct position for validation
        if len(clean_postcode) >= 5:
            formatted = clean_postcode[:-3] + ' ' + clean_postcode[-3:]
            return bool(re.match(pattern, formatted))

        return False

    def get_constituency_info(self, postcode):
        """Get detailed constituency information"""
        result = self.get_constituency(postcode)

        if "error" in result:
            return result

        # Add additional information
        enhanced_result = result.copy()
        enhanced_result.update({
            "formatted_postcode": postcode.upper(),
            "is_valid_format": self.validate_postcode_format(postcode),
            "api_source": "MySociety MapIt",
            "data_type": "Westminster Parliamentary Constituency"
        })

        return enhanced_result

def test_constituency_lookup():
    """Test the constituency lookup system"""
    print("🧪 Testing Constituency Lookup System")
    print("=" * 50)

    lookup = ConstituencyLookup()

    # Test postcodes
    test_postcodes = [
        "SW1A 1AA",  # Westminster (Prime Minister's residence)
        "W1A 0AX",   # BBC Broadcasting House
        "EC4M 7LS",  # City of London
        "M1 1AA",    # Manchester
        "B1 1AA",    # Birmingham
    ]

    for postcode in test_postcodes:
        print(f"\n🔍 Testing: {postcode}")
        result = lookup.get_constituency_info(postcode)

        if "error" in result:
            print(f"❌ Error: {result['error']}")
        else:
            print(f"✅ Constituency: {result['constituency']}")
            print(f"📍 ID: {result['id']}")
            print(f"📅 Lookup time: {result['lookup_time']}")

    # Save cache
    lookup.save_cache()
    print(f"\n💾 Cache saved with {len(lookup.cache)} entries")

def main():
    """Main function for command line usage"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python constituency_lookup.py <postcode>")
        print("Example: python constituency_lookup.py 'SW1A 1AA'")
        return

    postcode = sys.argv[1]
    lookup = ConstituencyLookup()
    result = lookup.get_constituency_info(postcode)

    print(f"\n🔍 Postcode: {postcode}")
    print("=" * 40)

    if "error" in result:
        print(f"❌ Error: {result['error']}")
    else:
        print(f"✅ Constituency: {result['constituency']}")
        print(f"📍 Constituency ID: {result['id']}")
        print(f"📅 Lookup time: {result['lookup_time']}")
        print(f"🔗 API source: {result['api_source']}")

    # Save cache
    lookup.save_cache()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_constituency_lookup()
    else:
        main()
