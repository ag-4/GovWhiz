#!/usr/bin/env python3
"""
Download all current UK Parliament Members (Commons) data from the official API
and save it as a comprehensive JSON file.
"""

import requests
import json
import os
import time
from typing import List, Dict, Any

def download_all_members() -> List[Dict[Any, Any]]:
    """
    Download all current MPs from the UK Parliament Members API.
    
    Returns:
        List of all MP data dictionaries
    """
    base_url = "https://members-api.parliament.uk/api/Members/Search"
    params = {
        "house": "Commons",
        "IsCurrentMember": "true",
        "skip": 0,
        "take": 20  # API default page size
    }
    
    all_members = []
    total_results = None
    
    print("🏛️ Downloading UK Parliament Members data...")
    
    while True:
        print(f"📥 Fetching page: skip={params['skip']}, take={params['take']}")
        
        try:
            response = requests.get(base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Get total results from first request
            if total_results is None:
                total_results = data.get('totalResults', 0)
                print(f"📊 Total MPs to download: {total_results}")
            
            # Extract member data
            items = data.get('items', [])
            if not items:
                print("✅ No more members to fetch")
                break
            
            # Add members to our collection
            for item in items:
                member_data = item.get('value', {})
                if member_data:
                    all_members.append(member_data)
            
            print(f"✅ Downloaded {len(items)} members (Total: {len(all_members)}/{total_results})")
            
            # Check if we have all members
            if len(all_members) >= total_results:
                print("🎉 All members downloaded!")
                break
            
            # Move to next page
            params['skip'] += params['take']
            
            # Be nice to the API
            time.sleep(0.5)
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching data: {e}")
            break
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON: {e}")
            break
    
    return all_members

def save_members_data(members: List[Dict[Any, Any]], filename: str = "data/members.json") -> None:
    """
    Save members data to JSON file.
    
    Args:
        members: List of member data dictionaries
        filename: Output filename
    """
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Prepare the data structure
    output_data = {
        "metadata": {
            "source": "UK Parliament Members API",
            "url": "https://members-api.parliament.uk/api/Members/Search",
            "downloaded_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "total_members": len(members),
            "house": "Commons",
            "current_members_only": True
        },
        "members": members
    }
    
    # Save to file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved {len(members)} members to {filename}")
    print(f"📁 File size: {os.path.getsize(filename) / 1024 / 1024:.2f} MB")

def main():
    """Main function to download and save members data."""
    print("🚀 Starting UK Parliament Members download...")
    
    # Download all members
    members = download_all_members()
    
    if not members:
        print("❌ No members data downloaded")
        return
    
    # Save to file
    save_members_data(members)
    
    print("✅ Download complete!")
    print(f"📊 Summary:")
    print(f"   - Total MPs: {len(members)}")
    print(f"   - File: data/members.json")
    print(f"   - Ready for use in MP lookup system")

if __name__ == "__main__":
    main()
