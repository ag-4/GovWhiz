#!/usr/bin/env python3
"""
Parse the downloaded UK Parliament Members JSON data and extract relevant fields
for use in the MP lookup system.
"""

import json
import requests
import os
from typing import List, Dict, Any

def parse_mp_data() -> List[Dict[str, Any]]:
    """
    Parse the downloaded MP data and extract relevant fields.
    
    Returns:
        List of cleaned MP data dictionaries
    """
    DATA_PATH = "data/members.json"
    
    # Check if data file exists
    if not os.path.exists(DATA_PATH):
        print(f"❌ Error: {DATA_PATH} not found!")
        print("Please run download_members.py first to download the data.")
        return []
    
    print("📖 Loading MP data from local file...")
    
    # Load the downloaded data
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return []
    
    # Extract members from our data structure
    members = data.get("members", [])
    if not members:
        print("❌ No members found in data file")
        return []
    
    print(f"📊 Processing {len(members)} MPs...")
    
    # Extract relevant fields for each MP
    all_mps = []
    
    for mp in members:
        try:
            # Extract basic information
            mp_id = mp.get("id", "")
            name = mp.get("nameDisplayAs", "Unknown")
            
            # Extract party information
            party_info = mp.get("latestParty", {})
            party = party_info.get("name", "Unknown")
            party_abbrev = party_info.get("abbreviation", "")
            
            # Extract constituency information
            membership = mp.get("latestHouseMembership", {})
            constituency = membership.get("membershipFrom", "Unknown")
            constituency_id = membership.get("membershipFromId", "")
            
            # Generate email (standard format for MPs)
            email_name = name.lower().replace(" ", ".").replace("'", "").replace("-", "")
            # Remove titles and honorifics
            email_name = email_name.replace("rt.hon.", "").replace("sir.", "").replace("dame.", "")
            email_name = email_name.replace("dr.", "").replace("mr.", "").replace("ms.", "").replace("mrs.", "")
            email_name = email_name.strip(".")
            email = f"{email_name}.mp@parliament.uk"
            
            # Create cleaned MP record
            mp_record = {
                "id": mp_id,
                "name": name,
                "party": party,
                "party_abbreviation": party_abbrev,
                "constituency": constituency,
                "constituency_id": constituency_id,
                "email": email,
                "phone": "020 7219 3000",  # General Parliament number
                "profile_url": f"https://members.parliament.uk/member/{mp_id}",
                "thumbnail_url": mp.get("thumbnailUrl", ""),
                "gender": mp.get("gender", ""),
                "membership_start": membership.get("membershipStartDate", ""),
                "status": membership.get("membershipStatus", {}).get("statusDescription", "Current Member")
            }
            
            all_mps.append(mp_record)
            
        except Exception as e:
            print(f"⚠️ Warning: Error processing MP {mp.get('nameDisplayAs', 'Unknown')}: {e}")
            continue
    
    print(f"✅ Successfully processed {len(all_mps)} MPs")
    return all_mps

def save_cleaned_data(mps: List[Dict[str, Any]]) -> None:
    """
    Save the cleaned MP data to a new JSON file.
    
    Args:
        mps: List of cleaned MP data dictionaries
    """
    output_file = "data/cleaned_mps.json"
    
    # Create output structure
    output_data = {
        "metadata": {
            "source": "UK Parliament Members API (parsed)",
            "processed_at": __import__('time').strftime("%Y-%m-%d %H:%M:%S UTC", __import__('time').gmtime()),
            "total_mps": len(mps),
            "description": "Cleaned and processed MP data for lookup system"
        },
        "mps": mps
    }
    
    # Save to file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved cleaned data to {output_file}")
        print(f"📁 File size: {os.path.getsize(output_file) / 1024:.1f} KB")
        
    except Exception as e:
        print(f"❌ Error saving cleaned data: {e}")

def create_constituency_lookup(mps: List[Dict[str, Any]]) -> None:
    """
    Create a constituency-to-MP lookup dictionary for faster searches.
    
    Args:
        mps: List of MP data dictionaries
    """
    constituency_lookup = {}
    
    for mp in mps:
        constituency = mp["constituency"]
        constituency_lookup[constituency] = {
            "name": mp["name"],
            "party": mp["party"],
            "party_abbreviation": mp["party_abbreviation"],
            "email": mp["email"],
            "phone": mp["phone"],
            "profile_url": mp["profile_url"],
            "id": mp["id"]
        }
    
    # Save constituency lookup
    lookup_file = "data/constituency_lookup.json"
    
    lookup_data = {
        "metadata": {
            "source": "UK Parliament Members API (constituency lookup)",
            "processed_at": __import__('time').strftime("%Y-%m-%d %H:%M:%S UTC", __import__('time').gmtime()),
            "total_constituencies": len(constituency_lookup),
            "description": "Fast constituency-to-MP lookup for streamlined system"
        },
        "constituencies": constituency_lookup
    }
    
    try:
        with open(lookup_file, 'w', encoding='utf-8') as f:
            json.dump(lookup_data, f, indent=2, ensure_ascii=False)
        
        print(f"🔍 Created constituency lookup: {lookup_file}")
        print(f"📊 {len(constituency_lookup)} constituencies indexed")
        
    except Exception as e:
        print(f"❌ Error creating constituency lookup: {e}")

def main():
    """Main function to parse and process MP data."""
    print("🚀 Starting MP data parsing...")
    
    # Parse the MP data
    mps = parse_mp_data()
    
    if not mps:
        print("❌ No MP data to process")
        return
    
    # Save cleaned data
    save_cleaned_data(mps)
    
    # Create constituency lookup
    create_constituency_lookup(mps)
    
    print("✅ MP data parsing complete!")
    print(f"📊 Summary:")
    print(f"   - Total MPs processed: {len(mps)}")
    print(f"   - Cleaned data: data/cleaned_mps.json")
    print(f"   - Constituency lookup: data/constituency_lookup.json")
    print(f"   - Ready for integration with streamlined MP lookup system")
    
    # Show sample data
    if mps:
        print(f"\n📋 Sample MP record:")
        sample_mp = mps[0]
        print(f"   - Name: {sample_mp['name']}")
        print(f"   - Party: {sample_mp['party']}")
        print(f"   - Constituency: {sample_mp['constituency']}")
        print(f"   - Email: {sample_mp['email']}")
        print(f"   - Profile: {sample_mp['profile_url']}")

if __name__ == "__main__":
    main()
