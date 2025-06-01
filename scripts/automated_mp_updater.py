"""
Automated MP Database Updater
Handles automatic updates of MP information, including:
- Full and partial postcode lookups
- Social media and contact details
- Regular database updates
- Postcode pattern mapping
"""

import requests
import json
import time
import re
from datetime import datetime, timedelta
import os
from typing import Dict, List, Optional, Set
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mp_updater.log'),
        logging.StreamHandler()
    ]
)

class AutomatedMPUpdater:
    def __init__(self, database_path: str = "data/mp_database.json", twfy_api_key: Optional[str] = None):
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'GovWhiz/2.0 Automated MP Database Updater'
        })
        self.postcode_patterns = {}
        
        # Initialize TheyWorkForYou adapter
        self.twfy = TheyWorkForYouAdapter(twfy_api_key)
        
        self.load_database()
        
        # Ensure all required database sections exist
        if "constituencies" not in self.database:
            self.database["constituencies"] = {}
        if "postcode_patterns" not in self.database:
            self.database["postcode_patterns"] = {}
        if "update_status" not in self.database:
            self.database["update_status"] = {
                "last_full_update": None,
                "failed_constituencies": [],
                "last_error": None
            }

    def load_database(self) -> None:
        """Load or initialize the MP database"""
        try:
            if self.database_path.exists():
                with open(self.database_path, 'r', encoding='utf-8') as f:
                    self.database = json.load(f)
            else:
                self.database = {
                    "version": "2025.1",
                    "last_updated": datetime.now().isoformat(),
                    "constituencies": {},
                    "postcode_patterns": {},
                    "update_status": {
                        "last_full_update": None,
                        "failed_constituencies": [],
                        "last_error": None
                    }
                }
        except Exception as e:
            logging.error(f"Error loading database: {e}")
            raise

    def save_database(self) -> None:
        """Save the current state of the database"""
        try:
            self.database["last_updated"] = datetime.now().isoformat()
            with open(self.database_path, 'w', encoding='utf-8') as f:
                json.dump(self.database, f, indent=2, ensure_ascii=False)
            logging.info(f"Database saved successfully to {self.database_path}")
        except Exception as e:
            logging.error(f"Error saving database: {e}")
            raise

    def get_constituency_from_postcode(self, postcode: str) -> Optional[Dict]:
        """Get constituency information from a postcode using PostcodesIO API"""
        try:
            clean_postcode = re.sub(r'\s+', '', postcode.upper())
            url = f"https://api.postcodes.io/postcodes/{clean_postcode}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            if not data.get("result", {}).get("parliamentary_constituency"):
                return None

            return {
                "constituency": data["result"]["parliamentary_constituency"],
                "postcode": clean_postcode,
                "pattern": re.match(r"^[A-Z]{1,2}\d{1,2}", clean_postcode)[0]
            }
        except Exception as e:
            logging.error(f"Error getting constituency for postcode {postcode}: {e}")
            return None

    def get_mp_details(self, constituency: str) -> Optional[Dict]:
        """Get MP details from the Parliament API with improved error handling"""
        try:
            # Search for constituency
            search_url = "https://members-api.parliament.uk/api/Location/Constituency/Search"
            params = {"searchText": constituency, "skip": "0", "take": "1"}
            response = self.session.get(search_url, params=params, timeout=10)
            response.raise_for_status()
            search_data = response.json()

            if not search_data.get("items"):
                logging.warning(f"No constituency found: {constituency}")
                return None

            constituency_data = search_data["items"][0]["value"]
            current_rep = constituency_data.get("currentRepresentation", {})
            
            if not current_rep or not current_rep.get("member", {}).get("value"):
                logging.warning(f"No current MP found for {constituency}")
                return None

            mp_data = current_rep["member"]["value"]
            mp_id = mp_data["id"]            # Fetch additional MP information
            contact_response = None
            social_response = None
            contact_data = {}
            social_links = {}
            
            try:
                # Fetch contact details
                contact_url = f"https://members-api.parliament.uk/api/Members/{mp_id}/Contact"
                contact_response = self.session.get(contact_url, timeout=10)
                if contact_response.ok:
                    try:
                        contact_json = contact_response.json()
                        contact_data = contact_json.get("value", {})
                    except Exception as e:
                        logging.warning(f"Error parsing contact data for {constituency}: {e}")
                else:
                    logging.warning(f"Could not fetch contact data for {constituency}: {contact_response.status_code}")

                # Fetch social media links
                social_url = f"https://members-api.parliament.uk/api/Members/{mp_id}/SocialLinks"
                social_response = self.session.get(social_url, timeout=10)
                if social_response.ok:
                    try:
                        social_json = social_response.json()
                        social_links = {
                            link["type"].lower(): link["value"]
                            for link in social_json.get("value", [])
                            if isinstance(link, dict) and "type" in link and "value" in link
                        }
                    except Exception as e:
                        logging.warning(f"Error parsing social media data for {constituency}: {e}")
                else:
                    logging.warning(f"Could not fetch social media data for {constituency}: {social_response.status_code}")
            except Exception as e:
                logging.warning(f"Error fetching additional MP data for {constituency}: {e}")# Process social media links
            social_links = {}
            if social_response and social_response.ok:
                try:
                    social_json = social_response.json()
                    if social_json and isinstance(social_json.get("value"), list):
                        for link in social_json["value"]:
                            if link.get("type") and link.get("value"):
                                social_links[link["type"].lower()] = link["value"]
                except Exception as e:
                    logging.warning(f"Error parsing social media data for {constituency}: {e}")# Build comprehensive MP profile
            party = mp_data.get("latestParty", {})
            membership = mp_data.get("latestHouseMembership", {})
            status = membership.get("membershipStatus", {})
            
            mp_info = {
                "name": mp_data["nameDisplayAs"],
                "party": party.get("name", "Unknown"),
                "party_color": party.get("backgroundColour"),
                "constituency": constituency_data["name"],
                "member_id": str(mp_id),
                "email": contact_data.get("email") or f"{mp_data['nameDisplayAs'].lower().replace(' ', '.')}@parliament.uk",
                "phone": contact_data.get("phone") or "020 7219 3000",
                "website": contact_data.get("website") or f"https://members.parliament.uk/member/{mp_id}",
                "address": next((a.get("address", "") for a in contact_data.get("addresses", [])), ""),
                "social_media": social_links,
                "image": mp_data.get("thumbnailUrl", ""),
                "gender": mp_data.get("gender", ""),
                "status": status.get("statusDescription", "Current Member"),
                "last_updated": datetime.now().isoformat()
            }

            return mp_info

        except requests.exceptions.RequestException as e:
            logging.error(f"Network error getting MP details for {constituency}: {e}")
            return None
        except Exception as e:
            logging.error(f"Error getting MP details for {constituency}: {e}")
            return None

    def update_postcode_pattern(self, pattern: str, constituency: str) -> None:
        """Update the postcode pattern mapping"""
        if pattern not in self.database["postcode_patterns"]:
            self.database["postcode_patterns"][pattern] = set()
        self.database["postcode_patterns"][pattern].add(constituency)

    def process_postcode(self, postcode: str, force_update: bool = False) -> Dict:
        """Process a postcode and update the database"""
        try:
            constituency_info = self.get_constituency_from_postcode(postcode)
            if not constituency_info:
                return {"success": False, "error": "Could not find constituency"}

            constituency = constituency_info["constituency"]
            
            # Check if we need to update MP info
            current_mp = self.database["constituencies"].get(constituency, {})
            needs_update = force_update or not current_mp or (
                "last_updated" in current_mp and
                datetime.fromisoformat(current_mp["last_updated"]) < datetime.now() - timedelta(days=1)
            )

            if needs_update:
                mp_info = self.get_mp_details(constituency)
                if mp_info:
                    self.database["constituencies"][constituency] = mp_info
                    self.update_postcode_pattern(constituency_info["pattern"], constituency)
                    self.save_database()
                else:
                    return {"success": False, "error": "Could not fetch MP details"}
            else:
                mp_info = current_mp

            return {
                "success": True,
                "constituency": constituency,
                "mp": mp_info,
                "postcode_pattern": constituency_info["pattern"]
            }

        except Exception as e:
            logging.error(f"Error processing postcode {postcode}: {e}")
            return {"success": False, "error": str(e)}

    def find_mp_by_pattern(self, pattern: str) -> List[Dict]:
        """Find MPs by postcode pattern"""
        pattern = pattern.upper()
        matching_constituencies = set()
        
        # Check direct pattern matches
        if pattern in self.database["postcode_patterns"]:
            matching_constituencies.update(self.database["postcode_patterns"][pattern])
        
        # Check for partial matches
        for db_pattern in self.database["postcode_patterns"]:
            if db_pattern.startswith(pattern):
                matching_constituencies.update(self.database["postcode_patterns"][db_pattern])

        return [
            {
                "constituency": constituency,
                "mp": self.database["constituencies"].get(constituency)
            }
            for constituency in matching_constituencies
            if constituency in self.database["constituencies"]
        ]

    def update_all_constituencies(self) -> Dict:
        """Update information for all known constituencies"""
        start_time = datetime.now()
        updated = 0
        failed = 0
        errors = []
        
        # Clear previous error list
        self.database["update_status"]["failed_constituencies"] = []

        # Get initial list of constituencies from Parliament API
        try:
            search_url = "https://members-api.parliament.uk/api/Location/Constituency/Search"
            params = {"skip": "0", "take": "100"}  # Get up to 100 constituencies
            response = self.session.get(search_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            constituencies = []
            if data.get("items"):
                constituencies = [item["value"]["name"] for item in data["items"]]
            
            # Add any constituencies we already know about
            constituencies.extend(list(self.database["constituencies"].keys()))
            constituencies = list(set(constituencies))  # Remove duplicates
            
            logging.info(f"Found {len(constituencies)} constituencies to update")
            
            for constituency in constituencies:
                try:
                    logging.info(f"Updating {constituency}...")
                    mp_info = self.get_mp_details(constituency)
                    if mp_info:
                        self.database["constituencies"][constituency] = mp_info
                        updated += 1
                        logging.info(f"✓ Successfully updated {constituency}")
                    else:
                        failed += 1
                        error_msg = f"No MP information found for {constituency}"
                        errors.append(error_msg)
                        self.database["update_status"]["failed_constituencies"].append(constituency)
                        logging.error(error_msg)
                    time.sleep(1)  # Rate limiting
                except Exception as e:
                    failed += 1
                    error_msg = f"Error updating {constituency}: {str(e)}"
                    errors.append(error_msg)
                    self.database["update_status"]["failed_constituencies"].append(constituency)
                    logging.error(error_msg)
                    time.sleep(1)  # Rate limiting even on error
            
            self.database["update_status"]["last_full_update"] = datetime.now().isoformat()
            self.database["update_status"]["last_error"] = errors[-1] if errors else None
            self.save_database()

            duration = datetime.now() - start_time
            return {
                "success": True,
                "updated": updated,
                "failed": failed,
                "errors": errors,
                "duration": str(duration),
                "constituencies": constituencies
            }

        except Exception as e:
            error_msg = f"Failed to get constituency list: {str(e)}"
            logging.error(error_msg)
            self.database["update_status"]["last_error"] = error_msg
            self.save_database()
            return {
                "success": False,
                "error": error_msg,
                "updated": updated,
                "failed": failed
            }

    def merge_mp_data(self, parliament_data: Optional[Dict], twfy_data: Optional[Dict]) -> Optional[Dict]:
        """Merge MP data from multiple sources, with Parliament data taking precedence"""
        if not parliament_data and not twfy_data:
            return None
            
        if not parliament_data:
            return twfy_data
            
        if twfy_data:
            # Merge the data, preferring Parliament data for overlapping fields
            merged = {**twfy_data, **parliament_data}
            
            # Merge social media separately to keep all links
            twfy_social = twfy_data.get("social_media", {})
            parl_social = parliament_data.get("social_media", {})
            merged["social_media"] = {**twfy_social, **parl_social}
            
            # Keep both source IDs
            merged["parliament_id"] = parliament_data.get("member_id")
            merged["twfy_id"] = twfy_data.get("person_id")
            
            # Add voting record if available
            if "voting_record" in twfy_data:
                merged["voting_record"] = twfy_data["voting_record"]
                
            return merged
            
        return parliament_data

if __name__ == "__main__":
    updater = AutomatedMPUpdater()
    # Example usage
    print("Starting automated MP database update...")
    result = updater.update_all_constituencies()
    print(f"Update complete: {result}")
