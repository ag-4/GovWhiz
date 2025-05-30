"""
Enhanced MP information scraper with postcode mapping integration
"""
from bs4 import BeautifulSoup
import json
import time
import re
import requests
from urllib.parse import urljoin, quote_plus
from datetime import datetime
from typing import Dict, List, Optional

class UKMPScraper:
    def __init__(self):
        self.base_url = "https://www.parliament.uk"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.mp_database_file = "data/mp_database.json"
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
        with open(self.mp_database_file, 'w', encoding='utf-8') as f:
            json.dump(self.database, f, indent=2, ensure_ascii=False)
    
    def update_mp_info(self, mp_info: Dict):
        """Update MP information in database"""
        if not mp_info or 'constituency' not in mp_info:
            return False
        
        constituency = mp_info['constituency']
        self.database["constituencies"][constituency] = {
            "name": mp_info["name"],
            "party": mp_info["party"],
            "email": mp_info["email"],
            "phone": mp_info["phone"],
            "member_id": mp_info.get("member_id", ""),
            "website": mp_info.get("website", ""),
            "parliament_url": mp_info.get("parliament_url", "")
        }
        return True

    def search_mp_by_postcode(self, postcode: str) -> Optional[Dict]:
        """Search for MP by postcode"""
        # Clean postcode and extract district
        postcode = postcode.upper().strip()
        district = postcode.split()[0] if ' ' in postcode else postcode[:4].rstrip()
        
        # Check if we have this district mapped
        if district in self.database["postcode_map"]:
            constituency = self.database["postcode_map"][district]
            if constituency in self.database["constituencies"]:
                return self.database["constituencies"][constituency]
            
            # If we have the mapping but not the MP info, try to fetch it
            mp_info = self.search_mp_by_constituency(constituency)
            if mp_info:
                self.update_mp_info(mp_info)
                self.save_database()
                return mp_info
        
        # Try to get constituency from postcodes.io
        try:
            url = f"https://api.postcodes.io/postcodes/{postcode.replace(' ', '')}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if 'result' in data and 'parliamentary_constituency' in data['result']:
                    constituency = data['result']['parliamentary_constituency']
                    
                    # Update our postcode map
                    self.database["postcode_map"][district] = constituency
                    
                    # Try to get MP info if we don't have it
                    if constituency not in self.database["constituencies"]:
                        mp_info = self.search_mp_by_constituency(constituency)
                        if mp_info:
                            self.update_mp_info(mp_info)
                            self.save_database()
                            return mp_info
                    else:
                        return self.database["constituencies"][constituency]
        except Exception as e:
            print(f"Error looking up postcode: {e}")
        
        return None

    def update_all_mps(self):
        """Update information for all MPs in our database"""
        print("Updating MP information...")
        updated_count = 0
        error_count = 0
        
        # First get a list of all MPs
        all_mps = self.get_all_mps_list()
        
        if all_mps:
            for mp in all_mps:
                if self.update_mp_info(mp):
                    updated_count += 1
                else:
                    error_count += 1
                time.sleep(1)  # Be nice to the server
            
            self.save_database()
            print(f"Updated {updated_count} MPs, {error_count} errors")
        else:
            print("Failed to retrieve MPs list")
    
    # Include all the original scraper methods here
    def search_mp_by_name(self, name):
        """Search for MP by name"""
        try:
            search_url = f"https://www.parliament.uk/search/results/?q={quote_plus(name)}&t=MP"
            response = self.session.get(search_url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                mp_links = soup.find_all('a', href=re.compile(r'/biographies/commons/'))
                
                results = []
                for link in mp_links[:5]:
                    mp_url = urljoin(self.base_url, link['href'])
                    mp_info = self.get_mp_details(mp_url)
                    if mp_info:
                        results.append(mp_info)
                
                return results
            
        except Exception as e:
            print(f"Error searching for MP: {e}")
        
        return []

        def search_mp_by_constituency(self, constituency):
        """Search for MP by constituency"""
        try:
            search_url = f"https://www.parliament.uk/search/results/?q={quote_plus(constituency + ' constituency')}&t=MP"
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
                
                # Extract basic information
                name = self.extract_name(soup)
                constituency = self.extract_constituency(soup)
                party = self.extract_party(soup)
                email = self.extract_email(soup)
                website = self.extract_website(soup)
                phone = self.extract_phone(soup)
                
                mp_info = {
                    'name': name,
                    'constituency': constituency,
                    'party': party,
                    'email': email,
                    'phone': phone,
                    'website': website,
                    'parliament_url': mp_url
                }
                
                return mp_info
            
        except Exception as e:
            print(f"Error extracting MP details: {e}")
        
        return None

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
    
    def extract_website(self, soup):
        """Extract website URL"""
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.startswith('http') and 'parliament.uk' not in href:
                if any(domain in href.lower() for domain in ['.com', '.co.uk', '.org.uk', '.net']):
                    return href
        return "N/A"
    
    def extract_phone(self, soup):
        """Extract phone number"""
        phone_pattern = r'(?:\+44|0)[\s-]?(?:\d{1,5}[\s-]?\d{3,4}[\s-]?\d{3,4}|\d{3}[\s-]?\d{3}[\s-]?\d{4})'
        phones = re.findall(phone_pattern, soup.get_text())
        if phones:
            return phones[0].strip()
        return "N/A"

def main():
    """Main function to test and update MP database"""
    scraper = UKMPScraper()
    
    while True:
        print("\n=== UK MP Information System ===")
        print("1. Search MP by postcode")
        print("2. Search MP by name")
        print("3. Search MP by constituency")
        print("4. Update all MP information")
        print("5. Show database statistics")
        print("6. Exit")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == '1':
            postcode = input("Enter postcode: ").strip()
            if postcode:
                print(f"\nSearching for MP by postcode: {postcode}")
                mp = scraper.search_mp_by_postcode(postcode)
                if mp:
                    print(f"\nFound MP:")
                    print(f"Name: {mp['name']}")
                    print(f"Party: {mp['party']}")
                    print(f"Email: {mp['email']}")
                    print(f"Phone: {mp['phone']}")
                    if 'website' in mp:
                        print(f"Website: {mp['website']}")
                else:
                    print("No MP found for that postcode.")
        
        elif choice == '2':
            name = input("Enter MP name: ").strip()
            if name:
                results = scraper.search_mp_by_name(name)
                if results:
                    for i, mp in enumerate(results, 1):
                        print(f"\n--- Result {i} ---")
                        print(f"Name: {mp['name']}")
                        print(f"Constituency: {mp['constituency']}")
                        print(f"Party: {mp['party']}")
                else:
                    print("No MPs found with that name.")
        
        elif choice == '3':
            constituency = input("Enter constituency name: ").strip()
            if constituency:
                mp = scraper.search_mp_by_constituency(constituency)
                if mp:
                    print(f"\nFound MP:")
                    print(f"Name: {mp['name']}")
                    print(f"Party: {mp['party']}")
                    print(f"Email: {mp['email']}")
                else:
                    print("No MP found for that constituency.")
        
        elif choice == '4':
            confirm = input("This will update all MP information. Continue? (y/n): ").strip().lower()
            if confirm == 'y':
                scraper.update_all_mps()
        
        elif choice == '5':
            stats = {
                "Total MPs": len(scraper.database["constituencies"]),
                "Total Postcode Districts": len(scraper.database["postcode_map"]),
                "Last Updated": scraper.database["last_updated"],
                "Version": scraper.database["version"]
            }
            print("\nDatabase Statistics:")
            for key, value in stats.items():
                print(f"{key}: {value}")
        
        elif choice == '6':
            print("Goodbye!")
            break
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
