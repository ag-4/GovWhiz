#!/usr/bin/env python3
"""
Enhanced MP Lookup System
Handles MP search by postcode and maintains local database with automatic updates
"""

import requests
import json
import os
import re
from datetime import datetime, timedelta
import logging
from typing import Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class MPLookupService:
    def __init__(self, db_path="data/mp_database.json"):
        self.db_path = db_path
        self.postcode_regex = re.compile(r'^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$', re.IGNORECASE)
        self.load_database()

    def load_database(self):
        """Load the MP database from JSON file"""
        try:
            if os.path.exists(self.db_path):
                with open(self.db_path, 'r') as f:
                    self.db = json.load(f)
            else:
                self.db = {
                    "version": "2024.1",
                    "last_updated": datetime.now().isoformat(),
                    "constituencies": {},
                    "postcode_map": {},
                    "postcode_exact_map": {}
                }
                self.save_database()
        except Exception as e:
            logging.error(f"Error loading database: {e}")
            self.db = {
                "version": "2024.1",
                "last_updated": datetime.now().isoformat(),
                "constituencies": {},
                "postcode_map": {},
                "postcode_exact_map": {}
            }

    def save_database(self):
        """Save the MP database to JSON file"""
        try:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            with open(self.db_path, 'w') as f:
                json.dump(self.db, f, indent=2)
        except Exception as e:
            logging.error(f"Error saving database: {e}")

    def validate_postcode(self, postcode: str) -> bool:
        """Validate UK postcode format"""
        if not postcode:
            return False
        return bool(self.postcode_regex.match(postcode))

    def format_postcode(self, postcode: str) -> str:
        """Format postcode consistently"""
        # Remove spaces and convert to uppercase
        clean = postcode.strip().upper().replace(' ', '')
        # Add space in the correct position
        if len(clean) > 3:
            return f"{clean[:-3]} {clean[-3:]}"
        return clean

    def get_constituency(self, postcode: str) -> Dict:
        """Get constituency from postcode using local database first, then API"""
        try:
            if not self.validate_postcode(postcode):
                return {
                    "found": False,
                    "error": "Invalid postcode format",
                    "postcode": postcode
                }

            formatted_postcode = self.format_postcode(postcode)
            outward_code = formatted_postcode.split(' ')[0]

            # Try local database first
            if formatted_postcode in self.db["postcode_exact_map"]:
                return {
                    "found": True,
                    "constituency": self.db["postcode_exact_map"][formatted_postcode],
                    "postcode": formatted_postcode,
                    "data_source": "Local Database (Exact)"
                }

            if outward_code in self.db["postcode_map"]:
                return {
                    "found": True,
                    "constituency": self.db["postcode_map"][outward_code],
                    "postcode": formatted_postcode,
                    "data_source": "Local Database (Outward)"
                }

            # Try Postcodes.io API
            response = requests.get(
                f"https://api.postcodes.io/postcodes/{formatted_postcode.replace(' ', '')}"
            )

            if response.status_code == 200:
                data = response.json()
                if data["result"] and data["result"]["parliamentary_constituency"]:
                    constituency = data["result"]["parliamentary_constituency"]
                    
                    # Update database with new mapping
                    self.db["postcode_exact_map"][formatted_postcode] = constituency
                    self.db["postcode_map"][outward_code] = constituency
                    self.save_database()

                    return {
                        "found": True,
                        "constituency": constituency,
                        "postcode": formatted_postcode,
                        "data_source": "Postcodes.io API"
                    }

            return {
                "found": False,
                "error": "Could not find constituency for this postcode",
                "postcode": formatted_postcode
            }

        except Exception as e:
            logging.error(f"Error in get_constituency: {e}")
            return {
                "found": False,
                "error": str(e),
                "postcode": postcode
            }

    def lookup_mp(self, postcode: str) -> Dict:
        """Look up MP by postcode using local data and Parliament API"""
        try:
            constituency_result = self.get_constituency(postcode)
            if not constituency_result["found"]:
                return constituency_result

            constituency = constituency_result["constituency"]

            # Check if we have recent MP data
            if constituency in self.db["constituencies"]:
                mp_info = self.db["constituencies"][constituency]
                if mp_info.get("last_updated"):
                    last_updated = datetime.fromisoformat(mp_info["last_updated"])
                    if (datetime.now() - last_updated) < timedelta(days=1):
                        return {
                            "found": True,
                            "constituency": constituency,
                            "mp": mp_info,
                            "postcode": constituency_result["postcode"],
                            "data_source": constituency_result["data_source"]
                        }

            # Get current MP from Parliament API
            response = requests.get(
                "https://members-api.parliament.uk/api/Location/Constituency/Search",
                params={"searchText": constituency}
            )

            if response.status_code == 200:
                data = response.json()
                if data["items"]:
                    constituency_id = data["items"][0]["value"]["id"]
                    
                    # Get current MP
                    mp_response = requests.get(
                        f"https://members-api.parliament.uk/api/Location/Constituency/{constituency_id}/Members/Current"
                    )

                    if mp_response.status_code == 200:
                        mp_data = mp_response.json()
                        if mp_data["items"]:
                            mp = mp_data["items"][0]["value"]
                            
                            # Format MP info
                            mp_info = {
                                "name": mp["nameDisplayAs"],
                                "party": mp["latestParty"]["name"],
                                "member_id": str(mp["id"]),
                                "email": next((c["value"] for c in mp["contactDetails"] if c["type"] == "Email"), 
                                           f"{mp['nameDisplayAs'].lower().replace(' ', '.')}@parliament.uk"),
                                "phone": next((c["value"] for c in mp["contactDetails"] if c["type"] == "Phone"), 
                                           "020 7219 3000"),
                                "last_updated": datetime.now().isoformat()
                            }

                            # Update database
                            self.db["constituencies"][constituency] = mp_info
                            self.save_database()

                            return {
                                "found": True,
                                "constituency": constituency,
                                "mp": mp_info,
                                "postcode": constituency_result["postcode"],
                                "data_source": "Parliament API"
                            }

            return {
                "found": False,
                "error": "Could not find current MP information",
                "constituency": constituency,
                "postcode": constituency_result["postcode"]
            }

        except Exception as e:
            logging.error(f"Error in lookup_mp: {e}")
            return {
                "found": False,
                "error": str(e),
                "postcode": postcode
            }

def test_postcodes():
    """Test various postcode formats"""
    service = MPLookupService()
    
    test_cases = [
        "SW1A 1AA",  # Westminster
        "M1 1AA",    # Manchester Central
        "B1 1AA",    # Birmingham Ladywood
        "BS5 9AU",   # Bristol East
        "M21 9WQ",   # Manchester Withington
        "SW1H 0AA",  # Westminster
    ]
    
    print("\nTesting MP lookups...\n")
    
    for postcode in test_cases:
        print(f"Testing postcode: {postcode}")
        result = service.lookup_mp(postcode)
        
        if result["found"]:
            mp = result["mp"]
            print(f"✓ Found MP: {mp['name']}")
            print(f"  Party: {mp['party']}")
            print(f"  Constituency: {result['constituency']}")
            print(f"  Data source: {result['data_source']}")
        else:
            print(f"✗ Error: {result['error']}")
        print("-" * 50)

if __name__ == "__main__":
    test_postcodes()
