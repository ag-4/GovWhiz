#!/usr/bin/env python3
"""
Generate district-to-constituency mapping using postcodes.io API
"""
import json
import os
import requests
import time
from collections import defaultdict

def generate_full_postcodes():
    """Generate sample full UK postcodes for each district"""
    # Format examples: BS5 9AU, M21 9WQ
    # Common second parts for testing
    second_parts = ['1AA', '1AB', '1AD', '1AE', '1AF', '2AA', '2AB', '9AA', '9AB', '9AU', '9AW', '9AX']
    
    # List of valid first parts of UK postcodes with district numbers
    area_districts = [
        # London
        'SW1', 'SW1A', 'SW1P', 'SW1V', 'SW1W', 'SW1X', 'SW1Y', 'SW1E', 'SW1H',
        'EC1', 'EC2', 'EC3', 'EC4', 'WC1', 'WC2',
        # Major cities
        'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9',
        'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21',
        'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9',
        'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20',
        'BS1', 'BS2', 'BS3', 'BS4', 'BS5', 'BS6', 'BS7', 'BS8', 'BS9',
        'BS10', 'BS11', 'BS13', 'BS14', 'BS15', 'BS16',
        'BT', 'CA', 'CB', 'CF', 'CH', 'CM', 'CO', 'CR', 'CT', 'CV', 'CW', 'DA',
        'DD', 'DE', 'DG', 'DH', 'DL', 'DN', 'DT', 'DY', 'E', 'EC', 'EH', 'EN',
        'EX', 'FK', 'FY', 'G', 'GL', 'GU', 'HA', 'HD', 'HG', 'HP', 'HR', 'HS',
        'HU', 'HX', 'IG', 'IP', 'IV', 'KA', 'KT', 'KW', 'KY', 'L', 'LA', 'LD',
        'LE', 'LL', 'LN', 'LS', 'LU', 'M', 'ME', 'MK', 'ML', 'N', 'NE', 'NG',
        'NN', 'NP', 'NR', 'NW', 'OL', 'OX', 'PA', 'PE', 'PH', 'PL', 'PO', 'PR',
        'RG', 'RH', 'RM', 'S', 'SA', 'SE', 'SG', 'SK', 'SL', 'SM', 'SN', 'SO',
        'SP', 'SR', 'SS', 'ST', 'SW', 'SY', 'TA', 'TD', 'TF', 'TN', 'TQ', 'TR',
        'TS', 'TW', 'UB', 'W', 'WA', 'WC', 'WD', 'WF', 'WN', 'WR', 'WS', 'WV',
        'YO', 'ZE'
    ]
      full_postcodes = []
    for district in area_districts:
        for second_part in second_parts:
            full_postcodes.append(f"{district} {second_part}")
    
    print(f"Generated {len(full_postcodes)} sample full postcodes")
    return full_postcodes

def get_district_from_postcode(postcode):
    """Extract district from full postcode (e.g., 'BS5 9AU' -> 'BS5')"""
    return postcode.split()[0]

def get_constituency_for_district(district):
    """Get constituency for a postcode district using postcodes.io API"""
    url = f"https://api.postcodes.io/outcodes/{district}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if 'result' in data and 'parliamentary_constituency' in data['result']:
                constituency = data['result']['parliamentary_constituency']
                # Handle both string and list responses
                if isinstance(constituency, list):
                    # If it's a list, take the first non-None value
                    for c in constituency:
                        if c:
                            return c
                    return None
                return constituency
    except Exception as e:
        print(f"Error looking up {district}: {e}")
    
    return None

def main():
    """Main function"""
    print("Generating postcode district to constituency mapping...")
    
    # Load existing database
    db_path = "../data/mp_database.json"
    with open(db_path, "r") as f:
        db = json.load(f)
    
    # Initialize postcode map if not exists
    if "postcode_map" not in db:
        db["postcode_map"] = {}
    
    # Get list of districts
    districts = get_districts()
    if not districts:
        print("Failed to get district list")
        return
        
    total = len(districts)
    print(f"Processing {total} districts...")
    
    # Track constituencies by district
    district_constituencies = defaultdict(set)
    
    # Process each district
    for i, district in enumerate(districts, 1):
        if district in db["postcode_map"]:
            print(f"[{i}/{total}] Skipping {district} (already mapped)")
            continue
            
        constituency = get_constituency_for_district(district)
        if constituency:
            district_constituencies[district].add(constituency)
            print(f"[{i}/{total}] Added {district} → {constituency}")
        else:
            print(f"[{i}/{total}] No constituency found for {district}")
        
        # Save progress every 10 districts
        if i % 10 == 0:
            # Update database with current mappings
            for dist, const_set in district_constituencies.items():
                if const_set:
                    # If multiple constituencies found, use the most common one
                    db["postcode_map"][dist] = list(const_set)[0]
            
            # Save to file
            with open(db_path, "w") as f:
                json.dump(db, f, indent=2)
            print("Progress saved...")
        
        # Be nice to the API
        time.sleep(0.5)
    
    # Final save
    for dist, const_set in district_constituencies.items():
        if const_set:
            db["postcode_map"][dist] = list(const_set)[0]
            
    with open(db_path, "w") as f:
        json.dump(db, f, indent=2)
    
    print(f"Completed! Mapped {len(district_constituencies)} districts.")

if __name__ == "__main__":
    main()
