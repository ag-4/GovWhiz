#!/usr/bin/env python3
"""
Simple test for postcode to constituency mapping
"""
import json
import os

def test_postcodes():
    """Test various postcode formats against our database"""
    db_path = "c:/Users/owl47/Documents/augment-projects/GovWhiz/data/mp_database.json"
    print(f"Looking for database at: {db_path}")
    
    # Load the database
    try:
        with open(db_path, 'r') as f:
            db = json.load(f)
            postcode_map = db.get("postcode_map", {})
            constituencies = db.get("constituencies", {})
    except Exception as e:
        print(f"Error loading database: {e}")
        return

    # Test cases - mix of formats
    test_cases = [
        "SW1A 1AA",  # Westminster
        "BS5 9AU",   # Bristol East
        "M21 9WQ",   # Manchester Withington
        "B1 1AA",    # Birmingham Ladywood
        "M1 1AE",    # Manchester Central
        "BS1 6QF",   # Bristol Central
        "SW1A",      # Just the district (Westminster)
        "M21",       # Just the district (Manchester Withington)
        "BS5"        # Just the district (Bristol East)
    ]
    
    print("\nTesting postcode lookup...")
    print("-" * 50)
    
    for postcode in test_cases:
        print(f"\nTesting postcode: {postcode}")
        
        # Extract district from full postcode
        district = postcode.split()[0] if ' ' in postcode else postcode
        
        # Look up constituency
        constituency = postcode_map.get(district)
        
        if constituency:
            mp_info = constituencies.get(constituency)
            if mp_info:
                print(f"✓ Found MP for {district}")
                print(f"  Constituency: {constituency}")
                print(f"  MP: {mp_info['name']}")
                print(f"  Party: {mp_info['party']}")
                print(f"  Contact: {mp_info['email']}")
            else:
                print(f"✗ Found constituency '{constituency}' but no MP info")
        else:
            print(f"✗ No mapping found for district: {district}")
    
    print("\nTest complete!")

if __name__ == "__main__":
    test_postcodes()
