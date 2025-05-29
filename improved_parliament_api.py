#!/usr/bin/env python3
"""
🏛️ Improved UK Parliament MP Lookup
Using the working Parliament API approach with proper error handling
"""

import requests
import urllib.parse
import json
import os
import sys
from datetime import datetime

class ImprovedParliamentLookup:
    def __init__(self):
        self.mapit_base_url = "https://mapit.mysociety.org"
        self.parliament_base_url = "https://members.parliament.uk/api"
        self.cache = {}
        self.cache_file = "data/improved_mp_cache.json"
        self.load_cache()
    
    def load_cache(self):
        """Load cached MP data"""
        try:
            with open(self.cache_file, 'r') as f:
                self.cache = json.load(f)
            print(f"📁 Loaded {len(self.cache)} cached MP records")
        except FileNotFoundError:
            print("📁 No cache file found, starting fresh")
            self.cache = {}
    
    def save_cache(self):
        """Save MP data to cache"""
        try:
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            with open(self.cache_file, 'w') as f:
                json.dump(self.cache, f, indent=2)
            print(f"💾 Saved {len(self.cache)} MP records to cache")
        except Exception as e:
            print(f"❌ Error saving cache: {e}")

    def get_constituency_from_postcode(self, postcode):
        """Get constituency name from postcode using MapIt API"""
        clean_postcode = postcode.replace(' ', '').upper()
        
        try:
            print(f"🌐 Looking up constituency for {postcode}...")
            url = f"{self.mapit_base_url}/postcode/{clean_postcode}"
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                return {"error": f"Invalid postcode or API failed (Status: {response.status_code})"}
            
            data = response.json()
            
            # Find Westminster Parliamentary Constituency
            for area in data['areas'].values():
                if area['type'] == 'WMC':
                    print(f"✅ Found constituency: {area['name']}")
                    return {
                        "constituency": area['name'],
                        "id": area['id'],
                        "postcode": postcode.upper(),
                        "success": True
                    }
            
            return {"error": "No Westminster constituency found for this postcode"}
            
        except Exception as e:
            print(f"❌ Constituency lookup error: {e}")
            return {"error": str(e)}

    def get_mp_by_constituency(self, constituency_name):
        """Get MP details using the improved Parliament API approach"""
        cache_key = f"mp_{constituency_name}"
        
        # Check cache first
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            # Check if cache is less than 24 hours old
            cache_time = datetime.fromisoformat(cached_data.get('cached_at', '2000-01-01'))
            if (datetime.now() - cache_time).total_seconds() < 86400:  # 24 hours
                print(f"📋 Using cached MP data for {constituency_name}")
                return cached_data
        
        try:
            print(f"🌐 Looking up MP for {constituency_name}...")
            
            # Use the improved URL encoding approach
            url = f"{self.parliament_base_url}/Members/Search?constituency={urllib.parse.quote(constituency_name)}&house=Commons"
            
            response = requests.get(url, timeout=15)
            
            if response.status_code != 200:
                print(f"❌ Parliament API failed with status: {response.status_code}")
                return {"error": f"Parliament API failed (Status: {response.status_code})"}
            
            data = response.json()
            
            if data.get("totalResults", 0) == 0:
                print(f"❌ No MP found for constituency: {constituency_name}")
                return {"error": "No MP found for this constituency"}
            
            # Get the MP data using the improved structure
            mp_item = data["items"][0]
            
            # Handle both possible response structures
            if "value" in mp_item:
                mp = mp_item["value"]
            else:
                mp = mp_item
            
            # Extract MP information with proper error handling
            mp_info = {
                "success": True,
                "name": mp.get("nameDisplayAs", "Unknown"),
                "party": mp.get("latestParty", {}).get("name", "Unknown"),
                "constituency": mp.get("latestHouseMembership", {}).get("membershipFrom", constituency_name),
                "member_id": mp.get("id", "unknown"),
                "email": mp.get("email", "Not available"),
                "profile": f"https://members.parliament.uk/member/{mp.get('id', 'unknown')}",
                "house": mp.get("latestHouseMembership", {}).get("house", "Commons"),
                "start_date": mp.get("latestHouseMembership", {}).get("membershipStartDate"),
                "thumbnail_url": mp.get("thumbnailUrl"),
                "cached_at": datetime.now().isoformat(),
                "api_source": "UK Parliament Members API (Improved)"
            }
            
            # Add additional contact information
            mp_info.update({
                "phone": "020 7219 3000",  # House of Commons switchboard
                "website": f"https://members.parliament.uk/member/{mp.get('id', 'unknown')}",
                "contact_note": "Contact details may vary. Use Parliament profile for most current information."
            })
            
            # Cache the result
            self.cache[cache_key] = mp_info
            print(f"✅ Found MP: {mp_info['name']} ({mp_info['party']})")
            
            return mp_info
            
        except Exception as e:
            print(f"❌ MP lookup error: {e}")
            return {"error": str(e)}

    def complete_mp_lookup(self, postcode):
        """Complete MP lookup: postcode → constituency → MP details"""
        print(f"🔍 Starting complete MP lookup for {postcode}")
        print("=" * 50)
        
        # Step 1: Get constituency from postcode
        constituency_result = self.get_constituency_from_postcode(postcode)
        
        if not constituency_result.get('success'):
            return {
                "success": False,
                "error": constituency_result.get('error', 'Unknown error'),
                "postcode": postcode,
                "step": "constituency_lookup"
            }
        
        # Step 2: Get MP from constituency
        mp_result = self.get_mp_by_constituency(constituency_result['constituency'])
        
        if not mp_result.get('success'):
            return {
                "success": False,
                "error": mp_result.get('error', 'Unknown error'),
                "postcode": postcode,
                "constituency": constituency_result['constituency'],
                "step": "mp_lookup"
            }
        
        # Step 3: Combine results
        complete_result = {
            "success": True,
            "postcode": constituency_result['postcode'],
            "constituency": constituency_result['constituency'],
            "constituency_id": constituency_result['id'],
            "mp": mp_result,
            "lookup_time": datetime.now().isoformat(),
            "data_sources": ["MySociety MapIt", "UK Parliament Members API (Improved)"]
        }
        
        return complete_result

    def test_multiple_postcodes(self):
        """Test the improved system with multiple postcodes"""
        test_postcodes = [
            "SW1A 1AA",  # Westminster
            "W1A 0AX",   # BBC/Fitzrovia area
            "EC4M 7LS",  # City of London
            "B1 1AA",    # Birmingham
            "M1 1AA",    # Manchester
            "DL10 4DQ",  # Richmond (Yorks) - Rishi Sunak's constituency
        ]
        
        print("🧪 Testing Improved Parliament API Lookup")
        print("=" * 60)
        
        results = []
        
        for postcode in test_postcodes:
            print(f"\n🔍 Testing: {postcode}")
            print("-" * 30)
            
            result = self.complete_mp_lookup(postcode)
            results.append(result)
            
            if result['success']:
                mp = result['mp']
                print(f"✅ Success!")
                print(f"   Constituency: {result['constituency']}")
                print(f"   MP: {mp['name']}")
                print(f"   Party: {mp['party']}")
                print(f"   Email: {mp['email']}")
                print(f"   Profile: {mp['profile']}")
            else:
                print(f"❌ Failed: {result['error']}")
                print(f"   Step: {result['step']}")
            
            # Be nice to the APIs
            import time
            time.sleep(1)
        
        # Save cache
        self.save_cache()
        
        return results

    def export_to_json(self, results, filename="data/improved_mp_results.json"):
        """Export results to JSON file"""
        try:
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            
            export_data = {
                "export_time": datetime.now().isoformat(),
                "total_lookups": len(results),
                "successful_lookups": len([r for r in results if r.get('success')]),
                "data_sources": ["MySociety MapIt", "UK Parliament Members API (Improved)"],
                "results": results
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            print(f"📄 Exported {len(results)} results to {filename}")
            return True
            
        except Exception as e:
            print(f"❌ Error exporting to JSON: {e}")
            return False

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print("Usage: python improved_parliament_api.py <postcode>")
        print("       python improved_parliament_api.py --test")
        print("Example: python improved_parliament_api.py 'SW1A 1AA'")
        return
    
    lookup = ImprovedParliamentLookup()
    
    if sys.argv[1] == "--test":
        results = lookup.test_multiple_postcodes()
        lookup.export_to_json(results)
        return
    
    postcode = sys.argv[1]
    result = lookup.complete_mp_lookup(postcode)
    
    print(f"\n🔍 Complete MP Lookup for: {postcode}")
    print("=" * 50)
    
    if result['success']:
        mp = result['mp']
        print(f"✅ Success!")
        print(f"📍 Postcode: {result['postcode']}")
        print(f"🏛️ Constituency: {result['constituency']} (ID: {result['constituency_id']})")
        print(f"👤 MP: {mp['name']}")
        print(f"🎗️ Party: {mp['party']}")
        print(f"🆔 Member ID: {mp['member_id']}")
        print(f"📧 Email: {mp['email']}")
        print(f"📞 Phone: {mp['phone']}")
        print(f"🌐 Profile: {mp['profile']}")
        print(f"📅 Start Date: {mp.get('start_date', 'Unknown')}")
        print(f"🔗 Data Sources: {', '.join(result['data_sources'])}")
    else:
        print(f"❌ Failed: {result['error']}")
        print(f"📍 Postcode: {result['postcode']}")
        if 'constituency' in result:
            print(f"🏛️ Constituency: {result['constituency']}")
        print(f"⚠️ Failed at: {result['step']}")
    
    # Save cache
    lookup.save_cache()

if __name__ == "__main__":
    main()
