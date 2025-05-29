#!/usr/bin/env python3
"""
🏛️ FREE MP Lookup System for GovWhiz
Uses 100% free UK Parliament open data and MapIt API
No API keys required!
"""

import requests
import urllib.parse
import json
import re
from datetime import datetime

def validate_postcode(postcode):
    """Validate UK postcode format"""
    pattern = r'^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$'
    return bool(re.match(pattern, postcode.strip().upper()))

def format_postcode(postcode):
    """Format postcode to standard format"""
    cleaned = postcode.replace(' ', '').upper()
    # Insert space before last 3 characters
    return cleaned[:-3] + ' ' + cleaned[-3:]

def get_constituency(postcode):
    """
    Get constituency from postcode using MapIt (FREE)
    Uses MySociety's MapIt service - no API key required
    """
    try:
        formatted_postcode = format_postcode(postcode)
        
        if not validate_postcode(formatted_postcode):
            return {"error": "Invalid postcode format"}
        
        # Remove spaces for API call
        clean_postcode = formatted_postcode.replace(' ', '')
        url = f"https://mapit.mysociety.org/postcode/{clean_postcode}"
        
        print(f"🔍 Looking up constituency for {formatted_postcode}...")
        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            return {"error": f"Invalid postcode or API failed (status: {response.status_code})"}

        data = response.json()
        
        # Look for Westminster Parliamentary Constituency
        for area in data.get('areas', {}).values():
            if area.get('type') == 'WMC':  # Westminster Parliamentary Constituency
                constituency_name = area['name']
                print(f"✅ Found constituency: {constituency_name}")
                return constituency_name
        
        return {"error": "Westminster Parliamentary Constituency not found for this postcode"}
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Network error: {str(e)}"}
    except json.JSONDecodeError:
        return {"error": "Invalid response from MapIt API"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

def get_mp_by_constituency(constituency_name):
    """
    Get MP information by constituency using UK Parliament API (FREE)
    Uses official UK Parliament Members API - no API key required
    """
    try:
        # URL encode the constituency name
        encoded_constituency = urllib.parse.quote(constituency_name)
        url = f"https://members.parliament.uk/api/Members/Search?constituency={encoded_constituency}&house=Commons"
        
        print(f"🔍 Looking up MP for constituency: {constituency_name}...")
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            return {"error": f"Parliament API failed (status: {response.status_code})"}
        
        data = response.json()

        if data.get("totalResults", 0) == 0:
            return {"error": f"No MP found for constituency: {constituency_name}"}

        # Get the first (current) MP
        mp_data = data["items"][0]["value"]
        
        # Extract MP information
        mp_info = {
            "found": True,
            "name": mp_data.get("nameDisplayAs", "Unknown"),
            "party": mp_data.get("latestParty", {}).get("name", "Unknown"),
            "constituency": constituency_name,
            "email": mp_data.get("email", "Not available"),
            "phone": mp_data.get("phone", "Not available"),
            "profile_url": f"https://members.parliament.uk/member/{mp_data.get('id', '')}",
            "member_id": mp_data.get("id", ""),
            "thumbnail_url": mp_data.get("thumbnailUrl", ""),
            "membership_from": mp_data.get("latestHouseMembership", {}).get("membershipFrom", ""),
            "timestamp": datetime.now().isoformat(),
            "data_source": "UK Parliament API (Free)"
        }
        
        print(f"✅ Found MP: {mp_info['name']} ({mp_info['party']})")
        return mp_info
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Network error: {str(e)}"}
    except json.JSONDecodeError:
        return {"error": "Invalid response from Parliament API"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

def lookup_mp(postcode):
    """
    Complete MP lookup: postcode → constituency → MP
    Uses 100% free UK government APIs
    """
    print(f"\n🏛️ FREE MP Lookup for {postcode}")
    print("=" * 50)
    
    # Step 1: Get constituency from postcode
    constituency = get_constituency(postcode)
    
    if isinstance(constituency, dict) and "error" in constituency:
        return {
            "found": False,
            "error": constituency["error"],
            "postcode": postcode,
            "step_failed": "constituency_lookup"
        }
    
    # Step 2: Get MP from constituency
    mp_info = get_mp_by_constituency(constituency)
    
    if isinstance(mp_info, dict) and "error" in mp_info:
        return {
            "found": False,
            "error": mp_info["error"],
            "postcode": postcode,
            "constituency": constituency,
            "step_failed": "mp_lookup"
        }
    
    # Add postcode to result
    mp_info["postcode"] = postcode
    return mp_info

def get_lords_info(limit=10):
    """
    Get information about House of Lords members (FREE)
    Lords are not constituency-based but this provides general info
    """
    try:
        url = f"https://members.parliament.uk/api/Members/Search?house=Lords&take={limit}"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            return {"error": f"Parliament API failed (status: {response.status_code})"}
        
        data = response.json()
        lords = []
        
        for item in data.get("items", []):
            lord_data = item["value"]
            lords.append({
                "name": lord_data.get("nameDisplayAs", "Unknown"),
                "party": lord_data.get("latestParty", {}).get("name", "Unknown"),
                "profile_url": f"https://members.parliament.uk/member/{lord_data.get('id', '')}",
                "member_id": lord_data.get("id", "")
            })
        
        return {
            "found": True,
            "total_results": data.get("totalResults", 0),
            "lords": lords,
            "data_source": "UK Parliament API (Free)"
        }
        
    except Exception as e:
        return {"error": f"Error fetching Lords data: {str(e)}"}

def test_system():
    """Test the free MP lookup system with sample postcodes"""
    test_postcodes = [
        "SW1A 1AA",  # Westminster
        "M1 1AA",    # Manchester
        "B1 1AA",    # Birmingham
        "BS1 1AA",   # Bristol
        "LS1 1AA"    # Leeds
    ]
    
    print("🧪 Testing Free MP Lookup System")
    print("=" * 60)
    
    for postcode in test_postcodes:
        result = lookup_mp(postcode)
        
        if result.get("found"):
            print(f"\n✅ {postcode}:")
            print(f"   MP: {result['name']}")
            print(f"   Party: {result['party']}")
            print(f"   Constituency: {result['constituency']}")
            if result['email'] != "Not available":
                print(f"   Email: {result['email']}")
            print(f"   Profile: {result['profile_url']}")
        else:
            print(f"\n❌ {postcode}: {result.get('error', 'Unknown error')}")
        
        print("-" * 40)

if __name__ == "__main__":
    print("🏛️ GovWhiz FREE MP Lookup System")
    print("Using 100% free UK Parliament open data")
    print("No API keys required!")
    print("=" * 60)
    
    # Interactive mode
    while True:
        postcode = input("\nEnter a UK postcode (or 'test' for demo, 'quit' to exit): ").strip()
        
        if postcode.lower() == 'quit':
            print("👋 Goodbye!")
            break
        elif postcode.lower() == 'test':
            test_system()
            continue
        elif not postcode:
            continue
        
        result = lookup_mp(postcode)
        
        if result.get("found"):
            print(f"\n🎉 SUCCESS!")
            print(f"MP: {result['name']}")
            print(f"Party: {result['party']}")
            print(f"Constituency: {result['constituency']}")
            print(f"Email: {result['email']}")
            print(f"Profile: {result['profile_url']}")
            print(f"Data source: {result['data_source']}")
        else:
            print(f"\n❌ ERROR: {result.get('error', 'Unknown error')}")
            if result.get('constituency'):
                print(f"Constituency found: {result['constituency']}")
            print(f"Failed at: {result.get('step_failed', 'unknown step')}")
