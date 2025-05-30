"""
Enhanced MP data scraper and database updater
"""
from bs4 import BeautifulSoup
import requests
import json
import time
import re
from urllib.parse import urljoin, quote_plus
from datetime import datetime
import os

class UKMPScraper:
    def __init__(self):
        self.base_url = "https://www.parliament.uk"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.db_path = "data/mp_database.json"
        self.load_database()

    def load_database(self):
        """Load existing MP database"""
        try:
            with open(self.db_path, 'r', encoding='utf-8') as f:
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
        with open(self.db_path, 'w', encoding='utf-8') as f:
            json.dump(self.database, f, indent=2, ensure_ascii=False)
        print(f"Database saved to {self.db_path}")

    def update_mp_info(self, mp_info):
        """Update MP information in the database"""
        if not mp_info or 'constituency' not in mp_info:
            return

        constituency = mp_info['constituency']
        
        # Update constituency information
        self.database["constituencies"][constituency] = {
            "name": mp_info["name"],
            "party": mp_info["party"],
            "email": mp_info["email"],
            "phone": mp_info["phone"],
            "website": mp_info.get("website", "N/A"),
            "member_id": mp_info.get("member_id", "N/A")
        }

    def search_and_update_constituency(self, constituency_name):
        """Search for and update MP info for a specific constituency"""
        print(f"Searching for MP in constituency: {constituency_name}")
        mp_info = self.search_mp_by_constituency(constituency_name)
        if mp_info:
            self.update_mp_info(mp_info)
            print(f"Updated information for {mp_info['name']} ({constituency_name})")
        else:
            print(f"No MP found for constituency: {constituency_name}")

    def update_all_constituencies(self):
        """Update information for all constituencies in the database"""
        total = len(self.database["constituencies"])
        print(f"Updating information for {total} constituencies...")

        for i, constituency in enumerate(list(self.database["constituencies"].keys()), 1):
            print(f"\nProcessing {i}/{total}: {constituency}")
            self.search_and_update_constituency(constituency)
            self.save_database()  # Save after each update
            time.sleep(2)  # Be respectful to the server

    # Your existing scraper methods here    def search_mp_by_constituency(self, constituency):
        """Search for MP by constituency"""
        try:
            # Use the members API instead of search
            search_url = "https://members-api.parliament.uk/api/Members/Search"
            params = {
                "searchText": constituency,
                "membershipStatus": "Current",
                "house": "Commons"
            }
            response = self.session.get(search_url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                mp_links = soup.find_all('a', href=re.compile(r'/biographies/commons/'))
                
                if mp_links:
                    mp_url = urljoin(self.base_url, mp_links[0]['href'])
                    return self.get_mp_details(mp_url)
            
        except Exception as e:
            print(f"Error searching constituency: {e}")
        
        return None

    def get_mp_details(self, mp_url):
        """Extract MP details from their Parliament profile page"""
        try:
            response = self.session.get(mp_url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract information
                name = self.extract_name(soup)
                constituency = self.extract_constituency(soup)
                party = self.extract_party(soup)
                email = self.extract_email(soup)
                website = self.extract_website(soup)
                phone = self.extract_phone(soup)
                
                # Generate a unique member ID if not found
                member_id = self.extract_member_id(soup) or str(hash(name + constituency))[-4:]
                
                return {
                    'name': name,
                    'constituency': constituency,
                    'party': party,
                    'email': email,
                    'phone': phone,
                    'website': website,
                    'member_id': member_id,
                    'parliament_url': mp_url
                }
            
        except Exception as e:
            print(f"Error extracting MP details: {e}")
        
        return None

    # Add all the extract_* methods from the original scraper here
    def extract_name(self, soup):
        """Extract MP name"""
        name_elem = soup.find('h1')
        if name_elem:
            return name_elem.get_text().strip()
        return "N/A"

    def extract_constituency(self, soup):
        """Extract constituency"""
        constituency_elem = soup.find(text=re.compile(r'MP for'))
        if constituency_elem:
            parent = constituency_elem.parent
            if parent:
                return parent.get_text().replace('MP for', '').strip()
        return "N/A"

    def extract_party(self, soup):
        """Extract political party"""
        for elem in soup.find_all(['p', 'span', 'div']):
            text = elem.get_text().lower()
            if any(party in text for party in ['conservative', 'labour', 'liberal democrat', 'snp', 'plaid cymru']):
                return elem.get_text().strip()
        return "N/A"

    def extract_email(self, soup):
        """Extract email address"""
        email_links = soup.find_all('a', href=re.compile(r'mailto:'))
        if email_links:
            return email_links[0]['href'].replace('mailto:', '')
        return "N/A"

    def extract_phone(self, soup):
        """Extract phone number"""
        phone_pattern = r'(?:\+44|0)[\s-]?(?:\d{1,5}[\s-]?\d{3,4}[\s-]?\d{3,4}|\d{3}[\s-]?\d{3}[\s-]?\d{4})'
        phones = re.findall(phone_pattern, soup.get_text())
        if phones:
            return phones[0].strip()
        return "020 7219 4000"  # Default Commons number

    def extract_member_id(self, soup):
        """Extract member ID from URL or page"""
        # Try to find member ID in URL or page content
        url = str(soup.url) if hasattr(soup, 'url') else ""
        id_match = re.search(r'/member/(\d+)/', url)
        if id_match:
            return id_match.group(1)
        return None

def main():
    """Main function to update MP database"""
    scraper = UKMPScraper()
    
    print("=== UK MP Database Updater ===")
    print("1. Update all constituencies")
    print("2. Update specific constituency")
    print("3. Show database stats")
    print("4. Exit")
    
    while True:
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            scraper.update_all_constituencies()
            
        elif choice == '2':
            constituency = input("Enter constituency name: ").strip()
            if constituency:
                scraper.search_and_update_constituency(constituency)
                
        elif choice == '3':
            total_constituencies = len(scraper.database["constituencies"])
            total_postcodes = len(scraper.database["postcode_map"])
            print(f"\nDatabase Statistics:")
            print(f"Total constituencies: {total_constituencies}")
            print(f"Total postcode mappings: {total_postcodes}")
            print(f"Last updated: {scraper.database['last_updated']}")
            
        elif choice == '4':
            print("Goodbye!")
            break
            
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
