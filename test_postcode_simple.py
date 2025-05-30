#!/usr/bin/env python3
"""
Test the constituency lookup functionality for different postcode formats
"""

def test_postcodes():
    """Test postcode to constituency mapping"""
    # Load the MP database    try:
        with open("c:/Users/owl47/Documents/augment-projects/GovWhiz/data/mp_database.json", 'r') as f:
            db = json.load(f)
            postcode_map = db.get("postcode_map", {})
            constituencies = db.get("constituencies", {})
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading database: {e}")
        return

    # Test cases
    test_cases = [
        "SW1A 1AA",  # Westminster
        "BS5 9AU",   # Bristol
        "M21 9WQ",   # Manchester
        "B1 1AA",    # Birmingham
        "M1 1AE",    # Manchester Central
        "BS1 6QF",   # Bristol Central
        "SW1A",      # Just the district
        "M21",       # Just the district
        "BS5"        # Just the district
    ]
    
    print("Testing postcode lookup...")
    print("-" * 50)
    
    for postcode in test_cases:
        # Extract district from full postcode
        district = postcode.split()[0] if ' ' in postcode else postcode
        
        # Look up constituency
        constituency = postcode_map.get(district)
        
        print(f"\nTesting postcode: {postcode}")
        if constituency:
            mp_info = constituencies.get(constituency)
            if mp_info:
                print(f"✓ Found MP for {district}")
                print(f"  Constituency: {constituency}")
                print(f"  MP: {mp_info['name']} ({mp_info['party']})")
                print(f"  Contact: {mp_info['email']}")
            else:
                print(f"✗ Found constituency '{constituency}' but no MP info")
        else:
            print(f"✗ No mapping found for district: {district}")
    
    print("\nTest complete!")

if __name__ == "__main__":
    import json
    test_postcodes()
