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
import os
from datetime import datetime

# Ensure data directory exists
os.makedirs("data", exist_ok=True)
import os

def validate_postcode(postcode):
    """
    Validate UK postcode format with support for common variations
    Accepts formats like:
    - SW1A 1AA
    - M1 1AA 
    - B1  1AA (extra spaces)
    - sw1a1aa (no spaces)
    """
    # Clean postcode - remove excess spaces and convert to uppercase
    postcode = postcode.strip().upper()
    
    # Remove all spaces to check basic pattern first
    nospace = postcode.replace(" ", "")
    
    # More lenient pattern matching outward and inward code
    patterns = [
        # Full format with strict spacing
        r'^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$',
        # Just the outward code for partial matches
        r'^[A-Z]{1,2}[0-9][A-Z0-9]?$'
    ]
    
    return any(bool(re.match(pattern, postcode)) for pattern in patterns)

def format_postcode(postcode):
    """Format postcode to standard format"""
    cleaned = postcode.replace(' ', '').upper()
    # Insert space before last 3 characters
    return cleaned[:-3] + ' ' + cleaned[-3:]

def get_constituency(postcode):
    """
    Get constituency from postcode using local database first, then MapIt API as fallback
    """
    try:
        formatted_postcode = format_postcode(postcode)
        outward_code = formatted_postcode.split(' ')[0]

        # First try local database
        try:
            with open("data/mp_database.json", "r") as f:
                db = json.load(f)
                if "postcode_map" in db and outward_code in db["postcode_map"]:
                    print(f"📋 Found constituency in local database for {outward_code}")
                    return {
                        "found": True,
                        "constituency": db["postcode_map"][outward_code],
                        "postcode": formatted_postcode,
                        "data_source": "Local Database"
                    }
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"⚠️ Local database error: {e}")
        outward_code = formatted_postcode.split(' ')[0]

        # First try local database
        try:
            with open("data/mp_database.json", "r") as f:
                db = json.load(f)
                if "postcode_map" in db and outward_code in db["postcode_map"]:
                    print(f"📋 Found constituency in local database for {outward_code}")
                    return {
                        "found": True,
                        "constituency": db["postcode_map"][outward_code],
                        "postcode": formatted_postcode,
                        "data_source": "Local Database"
                    }
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"⚠️ Local database error: {e}")

        # If not in local database, try MapIt API
        clean_postcode = formatted_postcode.replace(" ", "")
        headers = {
            'User-Agent': 'GovWhiz/1.0 (https://govwhiz.uk; contact@govwhiz.uk)',
            'Accept': 'application/json'
        }
        
        print(f"🌐 Looking up constituency for {formatted_postcode}...")
        response = requests.get(
            f"https://mapit.mysociety.org/postcode/{clean_postcode}",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            for area in data['areas'].values():
                if area['type'] == 'WMC':
                    return {
                        "found": True,
                        "constituency": area['name'],
                        "postcode": formatted_postcode,
                        "data_source": "MapIt API"
                    }
            return {
                "found": False,
                "error": "No parliamentary constituency found",
                "postcode": formatted_postcode,
                "step_failed": "constituency_lookup"
            }
        elif response.status_code == 404:
            return {
                "found": False,
                "error": "Invalid postcode",
                "postcode": formatted_postcode,
                "step_failed": "constituency_lookup"
            }
        else:
            return {
                "found": False,
                "error": f"MapIt API error (Status: {response.status_code})",
                "postcode": formatted_postcode,
                "step_failed": "constituency_lookup"
            }
            
    except requests.exceptions.RequestException as e:
        return {
            "found": False,
            "error": f"Network error: {str(e)}",
            "postcode": postcode,
            "step_failed": "constituency_lookup"
        }
    except Exception as e:
        return {
            "found": False,
            "error": f"Unexpected error: {str(e)}",
            "postcode": postcode,
            "step_failed": "constituency_lookup"
        }

def get_mp_by_constituency(constituency_name):
    """
    Get MP information by constituency using local database first, then UK Parliament API as fallback
    Returns the MP information in a standardized format.
    """
    # Always try local database first
    try:
        with open("data/mp_database.json", "r") as f:
            db = json.load(f)
            if constituency_name in db["constituencies"]:
                mp = db["constituencies"][constituency_name]
                print(f"📋 Found MP in local database: {mp['name']}")
                return {
                    "found": True,
                    "name": mp["name"],
                    "party": mp["party"],
                    "constituency": constituency_name,
                    "email": mp["email"],
                    "phone": mp["phone"],
                    "member_id": mp["member_id"],
                    "profile_url": f"https://members.parliament.uk/member/{mp['member_id']}",
                    "data_source": "Local Database",
                    "last_updated": db.get("last_updated", "Unknown")
                }
    except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
        print(f"⚠️ Local database error: {e}")
    # First try local database
    try:
        with open("data/mp_database.json", "r") as f:
            db = json.load(f)
            if constituency_name in db["constituencies"]:
                mp = db["constituencies"][constituency_name]
                print(f"📋 Using local data for {constituency_name}")
                return {
                    "found": True,
                    "name": mp["name"],
                    "party": mp["party"],
                    "constituency": constituency_name,
                    "email": mp["email"],
                    "phone": mp["phone"],
                    "member_id": mp["member_id"],
                    "profile_url": f"https://members.parliament.uk/member/{mp['member_id']}",
                    "data_source": "Local Database"
                }
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        print("⚠️ Could not use local database, trying API...")
    
    # If local lookup fails, try Parliament API with proper headers
    try:
        print(f"🌐 Looking up MP for {constituency_name} via Parliament API...")
        headers = {
            'User-Agent': 'GovWhiz/1.0 (https://govwhiz.uk; contact@govwhiz.uk)',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        }
        url = f"https://members-api.parliament.uk/api/Members/Search?constituency={urllib.parse.quote(constituency_name)}&house=Commons"
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("items") and len(data["items"]) > 0:
                mp_data = data["items"][0]["value"]
                # Validate that the MP's constituency matches
                if mp_data.get("latestHouseMembership", {}).get("membershipFrom", "").lower() == constituency_name.lower():
                    mp_info = {
                        "found": True,
                        "name": mp_data.get("nameDisplayAs", "Unknown"),
                        "party": mp_data.get("latestParty", {}).get("name", "Unknown"),
                        "constituency": constituency_name,
                        "email": mp_data.get("email", "Not available"),
                        "phone": mp_data.get("phone", "020 7219 3000"),
                        "profile_url": f"https://members.parliament.uk/member/{mp_data.get('id', '')}",
                        "member_id": mp_data.get("id", ""),
                        "data_source": "UK Parliament API"
                    }
                else:
                    # MP data doesn't match constituency
                    return get_fallback_mp_data(constituency_name)
                
                print(f"✅ Found MP: {mp_info['name']} ({mp_info['party']})")
                return mp_info
            
            return {
                "found": False,
                "error": f"No current MP found for {constituency_name}",
                "constituency": constituency_name,
                "step_failed": "mp_lookup"
            }
        elif response.status_code == 403:
            print("⚠️ Parliament API access forbidden (403), using cached data...")
            return get_fallback_mp_data(constituency_name)
        else:
            return {
                "found": False,
                "error": f"Parliament API error (Status: {response.status_code})",
                "constituency": constituency_name,
                "step_failed": "mp_lookup"
            }
            
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Parliament API network error: {e}, using fallback data...")
        return get_fallback_mp_data(constituency_name)
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

def lookup_mp(postcode):
    """
    Complete MP lookup: postcode → constituency → MP
    Uses local database first, then falls back to free UK government APIs
    """
    print(f"\n🏛️ Looking up MP for {postcode}")
    print("=" * 50)
    
    if not validate_postcode(postcode):
        return {
            "found": False,
            "error": "Invalid postcode format",
            "postcode": postcode,
            "step_failed": "validation"
        }
    
    # Step 1: Get constituency from postcode
    constituency_result = get_constituency(postcode)
    
    if not constituency_result.get("found", False):
        return {
            "found": False,
            "error": constituency_result.get("error", "Unknown error finding constituency"),
            "postcode": postcode,
            "step_failed": "constituency_lookup",
            "data_source": constituency_result.get("data_source", "Unknown")
        }
    
    # Step 2: Get MP from constituency
    mp_info = get_mp_by_constituency(constituency_result["constituency"])
    
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

def ensure_data_directory():
    """Ensure the data directory exists for local database"""
    os.makedirs("data", exist_ok=True)
    if not os.path.exists("data/mp_database.json"):
        # Create empty database structure
        db = {
            "version": "2024.1",
            "last_updated": datetime.now().isoformat(),
            "constituencies": {},
            "postcode_map": {}
        }
        with open("data/mp_database.json", "w") as f:
            json.dump(db, f, indent=2)
        print("📁 Created new MP database file")

def get_fallback_mp_data(constituency_name):
    """Get MP information from fallback data when API is unavailable"""
    try:
        # Try to load from cached data file first
        cache_file = "data/mp_lookup_cache.json"
        if os.path.exists(cache_file):
            with open(cache_file, 'r') as f:
                cached_data = json.load(f)
                if constituency_name in cached_data:
                    mp_data = cached_data[constituency_name]
                    return {
                        "found": True,
                        "name": mp_data["name"],
                        "party": mp_data["party"],
                        "constituency": constituency_name,
                        "email": mp_data["email"],
                        "phone": mp_data.get("phone", "020 7219 3000"),
                        "profile_url": mp_data.get("profile_url", "https://members.parliament.uk"),
                        "data_source": "Cached Data"
                    }
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        pass

    # If no cached data, return generic contact info
    return {
        "found": True,
        "name": f"MP for {constituency_name}",
        "party": "Contact Parliament for Details",
        "constituency": constituency_name,
        "email": "contact@parliament.uk",
        "phone": "020 7219 3000",
        "profile_url": "https://members.parliament.uk",
        "data_source": "Generic Fallback",
        "note": "API unavailable - Please check the Parliament website for current MP details"
    }

if __name__ == "__main__":
    print("🏛️ GovWhiz FREE MP Lookup System")
    print("Using 100% free UK Parliament open data")
    print("No API keys required!")
    print("=" * 60)
    
    # Ensure data directory exists
    ensure_data_directory()
    
    # Show available commands
    print("\nAvailable commands:")
    print("- Enter a UK postcode (e.g., 'SW1A 1AA')")
    print("- Type 'test' to run test suite")
    print("- Type 'quit' or 'exit' to quit")
    print("- Press Enter for help")
    
    # Interactive mode
    while True:
        try:
            postcode = input("\nEnter postcode or command: ").strip().lower()
            
            # Handle commands
            if postcode in ('quit', 'exit', 'q'):
                print("👋 Goodbye!")
                break
            elif postcode == 'test':
                test_system()
                continue
            elif not postcode:
                continue
            
            # Look up MP
            result = lookup_mp(postcode)
            
            if result.get("found"):
                print(f"\n🎉 SUCCESS!")
                print(f"MP: {result['name']}")
                print(f"Party: {result['party']}")
                print(f"Constituency: {result['constituency']}")
                print(f"Email: {result['email']}")
                print(f"Phone: {result.get('phone', 'Not available')}")
                print(f"Profile: {result['profile_url']}")
                print(f"Data source: {result['data_source']}")
                
                if result['data_source'] == "Local Database":
                    print("\nℹ️ Note: Using cached data. For real-time updates, please check the MP's profile.")
            else:
                print(f"\n❌ ERROR: {result.get('error', 'Unknown error')}")
                if result.get('constituency'):
                    print(f"Constituency found: {result['constituency']}")
                print(f"Failed at: {result.get('step_failed', 'unknown step')}")
                
                # Show helpful message
                if result.get('step_failed') == 'constituency_lookup':
                    print("\nℹ️ Tips:")
                    print("- Check postcode format (e.g., 'SW1A 1AA')")
                    print("- Try removing spaces")
                    print("- Ensure it's a valid UK postcode")
                elif result.get('step_failed') == 'mp_lookup':
                    print("\nℹ️ Note: API temporarily unavailable, but constituency was found")
                    print("Try again in a few minutes or check the Parliament website directly")
        
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {str(e)}")
            print("Please try again")
