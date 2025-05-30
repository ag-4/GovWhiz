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
    def __init__(self):
        self.base_url = "https://www.parliament.uk"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Set up database path
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.mp_database_file = os.path.join(script_dir, "data", "mp_database.json")
        self.load_database()

    def load_database(self):
        """Load the MP database"""
        try:
            with open(self.mp_database_file, 'r', encoding='utf-8') as f:
                self.database = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading database: {e}")
            self.database = {
                "version": "2024.1",
                "last_updated": datetime.now().strftime("%Y-%m-%d"),
                "constituencies": {},
                "postcode_map": {}
            }

    def save_database(self):
        """Save updates to the database"""
        try:
            self.database["last_updated"] = datetime.now().strftime("%Y-%m-%d")
            os.makedirs(os.path.dirname(self.mp_database_file), exist_ok=True)
            with open(self.mp_database_file, 'w', encoding='utf-8') as f:
                json.dump(self.database, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving database: {e}")
            return False

    def lookup_mp(self, postcode: str) -> Dict:
        """Look up MP information by postcode"""
        postcode = postcode.upper().strip()
        district = postcode.split()[0] if ' ' in postcode else postcode[:4].rstrip()
        
        # First check local database
        if district in self.database["postcode_map"]:
            constituency = self.database["postcode_map"][district]
            if constituency in self.database["constituencies"]:
                mp_info = self.database["constituencies"][constituency]
                print(f"Found MP in local database: {mp_info['name']}")
                return {"found": True, "mp": mp_info}
        
        # Try postcodes.io API
        try:
            url = f"https://api.postcodes.io/postcodes/{postcode.replace(' ', '')}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if 'result' in data and 'parliamentary_constituency' in data['result']:
                    constituency = data['result']['parliamentary_constituency']
                    print(f"Found constituency via API: {constituency}")
                    
                    # Update postcode map
                    self.database["postcode_map"][district] = constituency
                    
                    # Check if we have MP info
                    if constituency in self.database["constituencies"]:
                        return {"found": True, "mp": self.database["constituencies"][constituency]}
                    
                    # Try to scrape MP info
                    mp_info = self.scrape_mp_info(constituency)
                    if mp_info:
                        self.database["constituencies"][constituency] = mp_info
                        self.save_database()
                        return {"found": True, "mp": mp_info}
            
        except Exception as e:
            print(f"Error looking up postcode: {e}")
        
        return {"found": False, "error": "Could not find MP information"}

    def scrape_mp_info(self, constituency: str) -> Optional[Dict]:
        """Scrape MP information from Parliament website"""
        try:
            # Search for MP
            search_url = f"https://www.parliament.uk/mps-lords-and-offices/mps/?search_term={quote_plus(constituency)}"
            response = self.session.get(search_url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                mp_links = soup.find_all('a', href=re.compile(r'/mp/'))
                
                if mp_links:
                    # Get MP profile
                    mp_url = urljoin(self.base_url, mp_links[0]['href'])
                    response = self.session.get(mp_url, timeout=10)
                    
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        return self.extract_mp_info(soup, mp_url)
        
        except Exception as e:
            print(f"Error scraping MP info: {e}")
        
        return None

    def extract_mp_info(self, soup: BeautifulSoup, mp_url: str) -> Dict:
        """Extract MP information from their profile page"""
        mp_info = {
            "name": "N/A",
            "party": "N/A",
            "email": "N/A",
            "phone": "N/A",
            "website": "N/A",
            "parliament_url": mp_url
        }
        
        # Extract name from heading
        name_elem = soup.find('h1')
        if name_elem:
            name = name_elem.get_text().strip()
            if 'MP' in name:
                mp_info["name"] = name.split('MP')[0].strip()
        
        # Extract party
        parties = ['Conservative', 'Labour', 'Liberal Democrat', 'Scottish National Party']
        for elem in soup.find_all(['p', 'span', 'div']):
            text = elem.get_text().lower()
            for party in parties:
                if party.lower() in text:
                    mp_info["party"] = party
                    break
        
        # Extract email
        email_links = soup.find_all('a', href=re.compile(r'mailto:'))
        if email_links:
            mp_info["email"] = email_links[0]['href'].replace('mailto:', '')
        
        # Extract phone
        phone_pattern = r'(?:\+44|0)[\s-]?(?:\d{1,5}[\s-]?\d{3,4}[\s-]?\d{3,4})'
        phones = re.findall(phone_pattern, soup.get_text())
        if phones:
            mp_info["phone"] = phones[0].strip()
        
        return mp_info

def main():
    """Main function - test the MP lookup system"""
    service = MPLookupService()
    
    while True:
        print("\n=== UK MP Information System ===")
        print("1. Look up MP by postcode")
        print("2. Show database stats")
        print("3. Exit")
        
        try:
            choice = input("\nEnter your choice (1-3): ").strip()
            
            if choice == '1':
                postcode = input("Enter postcode (e.g., SW1A 1AA): ").strip()
                if postcode:
                    print("\nLooking up MP information...")
                    result = service.lookup_mp(postcode)
                    
                    if result["found"]:
                        mp = result["mp"]
                        print("\nFound MP:")
                        print(f"Name: {mp['name']}")
                        print(f"Party: {mp['party']}")
                        
                        # Show additional info if available
                        if mp["email"] != "N/A":
                            print(f"Email: {mp['email']}")
                        if mp["phone"] != "N/A":
                            print(f"Phone: {mp['phone']}")                        website = mp.get("website")
                        if website and website != "N/A":
                            print(f"Website: {website}")
                    else:
                        print(f"\nError: {result.get('error', 'Could not find MP')}")
            
            elif choice == '2':
                print("\nDatabase Statistics:")
                print(f"Total MPs: {len(service.database['constituencies'])}")
                print(f"Total Postcode Districts: {len(service.database['postcode_map'])}")
                print(f"Last Updated: {service.database['last_updated']}")
                print(f"Version: {service.database['version']}")
            
            elif choice == '3':
                print("Goodbye!")
                break
            
            else:
                print("Invalid choice. Please try again.")
                
        except Exception as e:
            print(f"Error: {e}")
            print("Please try again.")

if __name__ == "__main__":
    main()
