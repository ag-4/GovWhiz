import requests
import json

# TheyWorkForYou API configuration
API_KEY = "your_api_key_here"  # Replace with your actual API key
BASE_URL = "https://www.theyworkforyou.com/api"

def get_mp_by_postcode(postcode):
    """
    Get MP information by postcode using TheyWorkForYou API
    
    Args:
        postcode (str): UK postcode (e.g., "SW1A 1AA")
    
    Returns:
        dict: MP information or error message
    """
    url = f"{BASE_URL}/getMP"
    params = {
        "postcode": postcode.strip().upper(),
        "key": API_KEY,
        "output": "json"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        data = response.json()

        if "error" in data:
            return {"error": data["error"], "found": False}
        
        # Extract and format MP information
        mp_info = {
            "found": True,
            "name": data.get("name", "Unknown"),
            "party": data.get("party", "Unknown"),
            "constituency": data.get("constituency", "Unknown"),
            "email": data.get("email", ""),
            "website": data.get("url", ""),
            "office": data.get("office", ""),
            "phone": data.get("phone", ""),
            "image": data.get("image", ""),
            "postcode": postcode.upper()
        }
        
        return mp_info
        
    except requests.exceptions.RequestException as e:
        return {
            "error": f"Network error: {str(e)}", 
            "found": False
        }
    except json.JSONDecodeError:
        return {
            "error": "Invalid response from API", 
            "found": False
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}", 
            "found": False
        }

def get_mp_info_detailed(person_id):
    """
    Get detailed MP information by person ID
    
    Args:
        person_id (str): MP's person ID from TheyWorkForYou
    
    Returns:
        dict: Detailed MP information
    """
    url = f"{BASE_URL}/getPerson"
    params = {
        "id": person_id,
        "key": API_KEY,
        "output": "json"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        return data
        
    except Exception as e:
        return {"error": f"Error fetching detailed info: {str(e)}"}

def search_mps(search_term):
    """
    Search for MPs by name or constituency
    
    Args:
        search_term (str): Search term
    
    Returns:
        list: List of matching MPs
    """
    url = f"{BASE_URL}/getMPs"
    params = {
        "search": search_term,
        "key": API_KEY,
        "output": "json"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        return data
        
    except Exception as e:
        return {"error": f"Error searching MPs: {str(e)}"}

def validate_postcode(postcode):
    """
    Basic UK postcode validation
    
    Args:
        postcode (str): Postcode to validate
    
    Returns:
        bool: True if postcode format is valid
    """
    import re
    
    # Basic UK postcode pattern
    pattern = r'^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$'
    return bool(re.match(pattern, postcode.strip().upper()))

# Example usage and testing
if __name__ == "__main__":
    print("🏛️ GovWhiz MP Lookup Tool")
    print("=" * 40)
    
    while True:
        postcode = input("\nEnter your postcode (or 'quit' to exit): ").strip()
        
        if postcode.lower() == 'quit':
            break
            
        if not validate_postcode(postcode):
            print("❌ Invalid postcode format. Please use format like 'SW1A 1AA'")
            continue
            
        print(f"🔍 Looking up MP for {postcode}...")
        mp_info = get_mp_by_postcode(postcode)
        
        if mp_info.get("found"):
            print(f"\n✅ MP Found:")
            print(f"   Name: {mp_info['name']}")
            print(f"   Party: {mp_info['party']}")
            print(f"   Constituency: {mp_info['constituency']}")
            if mp_info['email']:
                print(f"   Email: {mp_info['email']}")
            if mp_info['website']:
                print(f"   Website: {mp_info['website']}")
        else:
            print(f"❌ Error: {mp_info.get('error', 'Unknown error')}")
