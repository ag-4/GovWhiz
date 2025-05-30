"""
Enhanced UK MP Scraper with postcode mapping and database integration
"""
from bs4 import BeautifulSoup
import json
import time
import re
import requests
from urllib.parse import urljoin, quote_plus
from datetime import datetime
from typing import Dict, List, Optional
import os

class UKMPScraper:
    def __init__(self, database_path=None):
        self.base_url = "https://www.parliament.uk"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Set database path
        if database_path is None:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            self.mp_database_file = os.path.join(script_dir, "data", "mp_database.json")
        else:
            self.mp_database_file = database_path
            
        self.load_database()

    def load_database(self):
        """Load existing MP database"""
        try:
            with open(self.mp_database_file, 'r', encoding='utf-8') as f:
                self.database = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.database = {
                "version": "2024.1",
                "last_updated": datetime.now().strftime("%Y-%m-%d"),
                "constituencies": {},
                "postcode_map": {}
            }

    def save_database(self):
        """Save updated MP database"""
        self.database["last_updated"] = datetime.now().strftime("%Y-%m-%d")
        os.makedirs(os.path.dirname(self.mp_database_file), exist_ok=True)
        with open(self.mp_database_file, 'w', encoding='utf-8') as f:
            json.dump(self.database, f, indent=2, ensure_ascii=False)

    def search_mp_by_postcode(self, postcode: str) -> Optional[Dict]:
        """Search for MP by postcode"""
        postcode = postcode.upper().strip()
        district = postcode.split()[0] if ' ' in postcode else postcode[:4].rstrip()
        
        # First check our local database
        if district in self.database["postcode_map"]:
            constituency = self.database["postcode_map"][district]
            if constituency in self.database["constituencies"]:
                mp_info = self.database["constituencies"][constituency]
                print(f"Found MP in local database: {mp_info['name']}")
                return mp_info
        
        # Try postcodes.io API
        try:
            url = f"https://api.postcodes.io/postcodes/{postcode.replace(' ', '')}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if 'result' in data and 'parliamentary_constituency' in data['result']:
                    constituency = data['result']['parliamentary_constituency']
                    print(f"Found constituency via API: {constituency}")
                    
                    # Update our postcode map
                    self.database["postcode_map"][district] = constituency
                    
                    # Try to get MP info if we don't have it
                    if constituency not in self.database["constituencies"]:
                        mp_info = self.search_mp_by_constituency(constituency)
                        if mp_info:
                            self.database["constituencies"][constituency] = mp_info
                            self.save_database()
                            return mp_info
                    else:
                        return self.database["constituencies"][constituency]
            
        except Exception as e:
            print(f"Error looking up postcode: {e}")
        
        return None

    def search_mp_by_constituency(self, constituency: str) -> Optional[Dict]:
        """Search for MP by constituency"""
        print(f"Searching for MP in constituency: {constituency}")
        try:
            search_url = f"https://www.parliament.uk/mps-lords-and-offices/mps/?search_term={quote_plus(constituency)}"
            response = self.session.get(search_url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                mp_links = soup.find_all('a', href=re.compile(r'/mp/'))
                
                if mp_links:
                    mp_url = urljoin(self.base_url, mp_links[0]['href'])
                    return self.get_mp_details(mp_url)
            
        except Exception as e:
            print(f"Error searching constituency: {e}")
        
        return None

    def get_mp_details(self, mp_url: str) -> Optional[Dict]:
        """Get MP details from their profile page"""
        try:
            response = self.session.get(mp_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                mp_info = {
                    'name': self.extract_name(soup),
                    'constituency': self.extract_constituency(soup),
                    'party': self.extract_party(soup),
                    'email': self.extract_email(soup),
                    'phone': self.extract_phone(soup),
                    'website': self.extract_website(soup),
                    'parliament_url': mp_url
                }
                
                if mp_info['name'] != "N/A" and mp_info['constituency'] != "N/A":
                    return mp_info
            
        except Exception as e:
            print(f"Error getting MP details: {e}")
        
        return None

    def extract_name(self, soup) -> str:
        """Extract MP name from page"""
        for tag in ['h1', 'h2', 'title']:
            elem = soup.find(tag)
            if elem:
                name = elem.get_text().strip()
                if 'MP' in name:
                    return name.split('MP')[0].strip()
        return "N/A"

    def extract_constituency(self, soup) -> str:
        """Extract constituency from page"""
        for elem in soup.find_all(['p', 'span', 'div']):
            text = elem.get_text()
            if 'MP for' in text:
                return text.split('MP for')[-1].strip()
        return "N/A"

    def extract_party(self, soup) -> str:
        """Extract political party from page"""
        parties = ['Conservative', 'Labour', 'Liberal Democrat', 'Scottish National Party', 'Plaid Cymru']
        for elem in soup.find_all(['p', 'span', 'div']):
            text = elem.get_text()
            for party in parties:
                if party.lower() in text.lower():
                    return party
        return "N/A"

    def extract_email(self, soup) -> str:
        """Extract email address from page"""
        email_links = soup.find_all('a', href=re.compile(r'mailto:'))
        if email_links:
            return email_links[0]['href'].replace('mailto:', '')
        return "N/A"

    def extract_phone(self, soup) -> str:
        """Extract phone number from page"""
        phone_pattern = r'(?:\+44|0)[\s-]?(?:\d{1,5}[\s-]?\d{3,4}[\s-]?\d{3,4})'
        for elem in soup.find_all(['p', 'span', 'div']):
            text = elem.get_text()
            if 'telephone' in text.lower() or 'tel:' in text.lower():
                matches = re.findall(phone_pattern, text)
                if matches:
                    return matches[0]
        return "N/A"

    def extract_website(self, soup) -> str:
        """Extract website URL from page"""
        for link in soup.find_all('a', href=True):
            href = link['href']
            if (href.startswith('http') and 
                'parliament.uk' not in href and
                any(x in href for x in ['.org.uk', '.com', '.co.uk'])):
                return href
        return "N/A"

def main():
    """Main function to test postcode lookup"""
    scraper = UKMPScraper()
    
    while True:
        print("\n=== UK MP Lookup System ===")
        print("1. Look up MP by postcode")
        print("2. Look up MP by constituency")
        print("3. Show database stats")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            postcode = input("Enter postcode (e.g., SW1A 1AA): ").strip()
            if postcode:
                print("\nSearching...")                mp = scraper.search_mp_by_postcode(postcode)
                if mp:
                    print("\nFound MP:")
                    print(f"Name: {mp.get('name', 'N/A')}")
                    for field in ['party', 'email', 'phone']:
                        if field in mp and mp[field] != 'N/A':
                            print(f"{field.title()}: {mp[field]}")
                    if 'website' in mp and mp['website'] != 'N/A':
                        print(f"Website: {mp['website']}")
                else:
                    print("No MP found for that postcode.")
        
        elif choice == '2':
            constituency = input("Enter constituency name: ").strip()
            if constituency:
                print("\nSearching...")
                mp = scraper.search_mp_by_constituency(constituency)
                if mp:
                    print("\nFound MP:")
                    print(f"Name: {mp['name']}")
                    print(f"Party: {mp['party']}")
                    print(f"Email: {mp['email']}")
                    print(f"Phone: {mp['phone']}")
                else:
                    print("No MP found for that constituency.")
        
        elif choice == '3':
            print("\nDatabase Statistics:")
            print(f"Total MPs: {len(scraper.database['constituencies'])}")
            print(f"Total Postcode Districts: {len(scraper.database['postcode_map'])}")
            print(f"Last Updated: {scraper.database['last_updated']}")
            print(f"Version: {scraper.database['version']}")
        
        elif choice == '4':
            print("Goodbye!")
            break
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
