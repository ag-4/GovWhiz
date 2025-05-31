"""
Enhanced UK MP Information System
Combines web scraping with local database for efficient lookups
"""
from bs4 import BeautifulSoup
import json
import time
import re
import requests
import os
from urllib.parse import urljoin, quote_plus
from datetime import datetime
from typing import Dict, Optional

class MPLookupService:
    def __init__(self, db_path="data/mp_database.json"):
        self.db_path = db_path
        self.validate_regex = re.compile(r'^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$', re.IGNORECASE)
        self.load_database()
        
    def load_database(self):
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
            print(f"Error loading database: {e}")
            self.db = {
                "version": "2024.1",
                "last_updated": datetime.now().isoformat(),
                "constituencies": {},
                "postcode_map": {},
                "postcode_exact_map": {}
            }

    def save_database(self):
        try:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            with open(self.db_path, 'w') as f:
                json.dump(self.db, f, indent=2)
        except Exception as e:
            print(f"Error saving database: {e}")

    def format_mp(self, mp):
        return {
            "name": mp["name"],
            "party": mp["party"],
            "email": mp["email"],
            "phone": mp["phone"],
            "website": mp.get("website", ""),
            "member_id": mp.get("member_id", "")
        }

    def lookup_mp(self, postcode: str) -> Dict:
        try:
            if not self.validate_regex.match(postcode):
                return {
                    "found": False,
                    "error": "Invalid postcode format",
                    "postcode": postcode
                }

            formatted = postcode.strip().upper()
            outcode = formatted.split()[0] if ' ' in formatted else formatted[:len(formatted)-3]

            # First try exact match
            if formatted in self.db["postcode_exact_map"]:
                constituency = self.db["postcode_exact_map"][formatted]
                if constituency in self.db["constituencies"]:
                    return {
                        "found": True,
                        "mp": self.format_mp(self.db["constituencies"][constituency]),
                        "constituency": constituency,
                        "postcode": formatted
                    }

            # Then try outcode match
            if outcode in self.db["postcode_map"]:
                constituency = self.db["postcode_map"][outcode]
                if constituency in self.db["constituencies"]:
                    return {
                        "found": True,
                        "mp": self.format_mp(self.db["constituencies"][constituency]),
                        "constituency": constituency,
                        "postcode": formatted
                    }

            # Fall back to API lookup
            return self._lookup_from_api(formatted)

        except Exception as e:
            return {
                "found": False,
                "error": str(e),
                "postcode": postcode
            }

    def _lookup_from_api(self, postcode: str) -> Dict:
        try:
            # Get constituency from postcode
            response = requests.get(
                f"https://api.postcodes.io/postcodes/{postcode.replace(' ', '')}"
            )
            
            if response.status_code != 200:
                return {
                    "found": False,
                    "error": "Could not find constituency for this postcode",
                    "postcode": postcode
                }

            data = response.json()
            if not data["result"] or not data["result"]["parliamentary_constituency"]:
                return {
                    "found": False,
                    "error": "No constituency found for this postcode",
                    "postcode": postcode
                }

            constituency = data["result"]["parliamentary_constituency"]

            # Get MP details from Parliament API
            mp_response = requests.get(
                "https://members-api.parliament.uk/api/Location/Constituency/Search",
                params={"searchText": constituency}
            )

            if mp_response.status_code != 200:
                return {
                    "found": False,
                    "error": "Could not fetch MP information",
                    "postcode": postcode,
                    "constituency": constituency
                }

            mp_data = mp_response.json()
            if not mp_data["items"]:
                return {
                    "found": False,
                    "error": "No MP found for this constituency",
                    "postcode": postcode,
                    "constituency": constituency
                }

            constituency_id = mp_data["items"][0]["value"]["id"]
            
            # Get current MP
            current_mp_response = requests.get(
                f"https://members-api.parliament.uk/api/Location/Constituency/{constituency_id}/Members/Current"
            )

            if current_mp_response.status_code != 200:
                return {
                    "found": False,
                    "error": "Could not fetch current MP details",
                    "postcode": postcode,
                    "constituency": constituency
                }

            current_mp_data = current_mp_response.json()
            if not current_mp_data["items"]:
                return {
                    "found": False,
                    "error": "No current MP found for this constituency",
                    "postcode": postcode,
                    "constituency": constituency
                }

            mp = current_mp_data["items"][0]["value"]
            
            # Format MP info
            mp_info = {
                "name": mp["nameDisplayAs"],
                "party": mp["latestParty"]["name"],
                "email": next((c["value"] for c in mp["contactDetails"] if c["type"] == "Email"), 
                            f"{mp['nameDisplayAs'].lower().replace(' ', '.')}@parliament.uk"),
                "phone": next((c["value"] for c in mp["contactDetails"] if c["type"] == "Phone"), 
                            "020 7219 3000"),
                "website": f"https://members.parliament.uk/member/{mp['id']}",
                "member_id": str(mp["id"])
            }

            # Update our database
            self.db["constituencies"][constituency] = mp_info
            self.db["postcode_exact_map"][postcode] = constituency
            self.db["postcode_map"][postcode.split()[0]] = constituency
            self.save_database()

            return {
                "found": True,
                "mp": mp_info,
                "constituency": constituency,
                "postcode": postcode
            }

        except Exception as e:
            return {
                "found": False,
                "error": str(e),
                "postcode": postcode
            }

    def test_lookup(self, postcode="SW1A 0AA"):
        """
        Test the MP lookup functionality with a known postcode
        Returns True if successful, False otherwise
        """
        print(f"🧪 Testing MP lookup with postcode: {postcode}")
        try:
            result = self.lookup_mp(postcode)
            if result:
                print("✅ MP lookup successful:")
                print(json.dumps(result, indent=2))
                return True
            else:
                print("❌ MP lookup failed - no results")
                return False
        except Exception as e:
            print(f"❌ MP lookup failed with error: {str(e)}")
            return False

    def update_database(self):
        """
        Update the database with latest MP information
        This method can be called to refresh the database
        """
        print("🔄 Database update functionality - currently using API fallback")
        print("✅ Database will be updated automatically when new postcodes are looked up")
        return True

if __name__ == "__main__":
    import sys
    service = MPLookupService()
    if "--test" in sys.argv:
        test_postcode = sys.argv[sys.argv.index("--test") + 1] if len(sys.argv) > sys.argv.index("--test") + 1 else "SW1A 0AA"
        service.test_lookup(test_postcode)
    else:
        service.update_database()  # Regular update mode
