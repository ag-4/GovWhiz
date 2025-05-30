#!/usr/bin/env python3
"""
Test postcode lookup functionality across all valid UK postcode formats.
"""
import json
import os
import requests
from time import sleep
from datetime import datetime
from typing import Dict, List, Set
import itertools

def generate_valid_districts() -> List[str]:
    """Generate all valid UK postcode districts"""
    # Standard format areas (e.g., SW1A, BS1, M1)
    area_codes = {
        # London
        'EC', 'WC', 'E', 'N', 'NW', 'SE', 'SW', 'W',
        # Major cities
        'B', 'BA', 'BB', 'BD', 'BH', 'BL', 'BN', 'BR', 'BS',
        'CF', 'CH', 'CM', 'CO', 'CR', 'CT', 'CV',
        'DE', 'DH', 'DL', 'DN',
        'G', 'GL', 'GU',
        'HA', 'HD', 'HG', 'HP', 'HR', 'HU',
        'IG', 'IP',
        'KT',
        'L', 'LE', 'LS',
        'M', 'ME', 'MK',
        'NE', 'NG', 'NN', 'NP', 'NR',
        'OL', 'OX',
        'PE', 'PO',
        'RG', 'RH', 'RM',
        'S', 'SE', 'SG', 'SK', 'SL', 'SM', 'SN', 'SO', 'SP', 'SR', 'SS', 'ST', 'SW',
        'TN', 'TW',
        'UB',
        'WA', 'WD', 'WF', 'WN', 'WR',
        'YO'
    }
    
    districts = []
    for area in area_codes:
        if len(area) == 1:
            # Single letter areas can have 1-2 digits (e.g., M1, M11)
            for num in range(1, 100):
                districts.append(f"{area}{num}")
        else:
            # Two letter areas typically have 1-2 digits
            for num in range(1, 100):
                districts.append(f"{area}{num}")
            
    return districts

def generate_test_postcodes(district: str) -> List[str]:
    """Generate test postcodes for a given district"""
    # Second part format: number + 2 letters (e.g., 1AA, 9ZZ)
    numbers = range(1, 10)  # 1-9
    letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'  # Excluding I and O as they're rarely used
    
    test_postcodes = []
    # Generate a representative sample
    for num in numbers:
        for l1, l2 in itertools.product(letters[:5], letters[:5]):  # Using first 5 letters for sample
            test_postcodes.append(f"{district} {num}{l1}{l2}")
            if len(test_postcodes) >= 10:  # Limit samples per district
                break
        if len(test_postcodes) >= 10:
            break
            
    return test_postcodes

def test_postcode(postcode: str, db: Dict) -> Dict:
    """Test a single postcode against our database"""
    district = postcode.split()[0]
    postcode_map = db.get("postcode_map", {})
    constituencies = db.get("constituencies", {})
    
    result = {
        "postcode": postcode,
        "district": district,
        "success": False,
        "constituency": None,
        "mp_info": None
    }
    
    # Check if we have the district mapped
    constituency = postcode_map.get(district)
    if constituency:
        result["success"] = True
        result["constituency"] = constituency
        result["mp_info"] = constituencies.get(constituency)
        
    return result

def save_results(results: List[Dict], filename: str):
    """Save test results to a file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tested": len(results),
            "successful": sum(1 for r in results if r["success"]),
            "results": results
        }, f, indent=2)

def main():
    """Main test function"""
    # Load the MP database
    try:
        with open("c:/Users/owl47/Documents/augment-projects/GovWhiz/data/mp_database.json", 'r') as f:
            db = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading database: {e}")
        return

    # Generate all valid districts
    districts = generate_valid_districts()
    print(f"Generated {len(districts)} valid postcode districts")
    
    # Test results
    results = []
    total_districts = len(districts)
    
    # Process each district
    for i, district in enumerate(districts, 1):
        print(f"\nTesting district {i}/{total_districts}: {district}")
        
        # Generate test postcodes for this district
        test_postcodes = generate_test_postcodes(district)
        
        # Test each postcode
        for postcode in test_postcodes:
            result = test_postcode(postcode, db)
            if result["success"]:
                print(f"  ✓ {postcode} → {result['constituency']}")
                mp = result["mp_info"]
                if mp:
                    print(f"    MP: {mp['name']} ({mp['party']})")
            else:
                print(f"  ✗ {postcode} - No mapping found")
            
            results.append(result)
        
        # Save progress periodically
        if i % 10 == 0:
            save_results(results, "c:/Users/owl47/Documents/augment-projects/GovWhiz/data/postcode_test_results.json")
            print(f"Progress saved... ({len(results)} postcodes tested)")
    
    # Final save
    save_results(results, "c:/Users/owl47/Documents/augment-projects/GovWhiz/data/postcode_test_results.json")
    
    # Print summary
    successful = sum(1 for r in results if r["success"])
    total = len(results)
    print(f"\nTest complete!")
    print(f"Total postcodes tested: {total}")
    print(f"Successful lookups: {successful} ({(successful/total)*100:.1f}%)")
    print(f"Results saved to postcode_test_results.json")

if __name__ == "__main__":
    main()
