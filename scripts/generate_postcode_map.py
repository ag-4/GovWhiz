#!/usr/bin/env python3
"""
Generate a comprehensive postcode district to constituency mapping using ONS Postcode Directory
"""
import json
import os
import csv
from collections import defaultdict
import requests
from tqdm import tqdm

def download_onspd_data():
    """Download and extract the latest ONSPD data"""
    data_dir = "../data"
    csv_path = os.path.join(data_dir, "postcodes.csv")
    
    if not os.path.exists(csv_path):
        print("Downloading ONSPD data...")
        # Download from a public source (you'll need to update this URL with the latest ONSPD data)
        url = "https://github.com/ideal-postcodes/postcodes.io/raw/master/latest/generated/district.json"
        response = requests.get(url)
        
        if response.status_code == 200:
            with open(csv_path, 'w', encoding='utf-8') as f:
                json.dump(response.json(), f, indent=2)
        else:
            raise Exception(f"Failed to download ONSPD data: {response.status_code}")
    
    return csv_path

def get_district_mappings(data_path):
    """Process the ONSPD data to create district to constituency mappings"""
    print("Processing postcode district mappings...")
    
    district_constituencies = defaultdict(set)
    
    # Load the district data
    with open(data_path, 'r', encoding='utf-8') as f:
        districts = json.load(f)
    
    # Process each district
    for district, data in districts.items():
        if 'parliamentary_constituency' in data:
            district_constituencies[district].add(data['parliamentary_constituency'])
    
    # Convert to final format (taking most common constituency for each district)
    district_map = {}
    for district, constituencies in district_constituencies.items():
        if constituencies:
            # If multiple constituencies, take the first one for now
            # In a production environment, you might want to handle this differently
            district_map[district] = list(constituencies)[0]
    
    return district_map

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
    
    try:
        # Get the ONSPD data
        data_path = download_onspd_data()
        
        # Process the data
        district_map = get_district_mappings(data_path)
        
        # Update the database
        db["postcode_map"].update(district_map)
        
        # Save the updated database
        with open(db_path, "w") as f:
            json.dump(db, f, indent=2)
        
        print(f"Successfully mapped {len(district_map)} postcode districts to constituencies!")
        
    except Exception as e:
        print(f"Error processing postcode data: {e}")
        return

if __name__ == "__main__":
    main()
