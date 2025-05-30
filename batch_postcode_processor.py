"""
Batch postcode district processor that expands and validates the postcode mapping database
"""
import json
import os
import requests
import time
from typing import Dict, List, Set, Tuple
from datetime import datetime
from collections import defaultdict

class PostcodeDistrictProcessor:
    def __init__(self, database_path: str = None):
        if database_path is None:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            self.database_path = os.path.join(script_dir, "data", "mp_database.json")
        else:
            self.database_path = database_path
        
        # Load state file path
        self.state_path = os.path.join(os.path.dirname(self.database_path), "processing_state.json")
            
        self.load_database()
        self.session = requests.Session()
        
        # Rate limiting parameters
        self.retry_delay = 1  # Initial delay between retries in seconds
        self.max_retries = 3
        self.min_request_interval = 0.5  # Minimum time between requests
        self.last_request_time = 0  # Last request timestamp
        
    def load_database(self):
        """Load the existing MP database and processing state"""
        try:
            with open(self.database_path, 'r', encoding='utf-8') as f:
                self.database = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading database: {e}")
            self.database = {
                "version": "2024.1",
                "last_updated": datetime.now().strftime("%Y-%m-%d"),
                "constituencies": {},
                "postcode_map": {}
            }
            
        # Load processing state if it exists
        try:
            with open(self.state_path, 'r', encoding='utf-8') as f:
                self.state = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.state = {
                "last_processed_index": 0,
                "failed_districts": [],
                "total_requests": 0,
                "success_count": 0,
                "error_count": 0,
                "start_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

    def save_database(self):
        """Save the updated database"""
        self.database["last_updated"] = datetime.now().strftime("%Y-%m-%d")
        with open(self.database_path, 'w', encoding='utf-8') as f:
            json.dump(self.database, f, indent=2, ensure_ascii=False)
    
    def save_state(self):
        """Save the current processing state"""
        with open(self.state_path, 'w', encoding='utf-8') as f:
            json.dump(self.state, f, indent=2, ensure_ascii=False)
            
    def wait_for_rate_limit(self):
        """Ensure we don't exceed rate limits"""
        now = time.time()
        time_since_last = now - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()

    def generate_districts(self) -> List[str]:
        """Generate a comprehensive list of UK postcode districts"""
        districts = []
        
        # Major city districts (most common first)
        major_cities = {
            'London': ['E1', 'EC1', 'N1', 'NW1', 'SE1', 'SW1', 'W1', 'WC1', 'E14', 'SW19'],
            'Birmingham': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'],
            'Manchester': ['M1', 'M2', 'M3', 'M4', 'M8', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M20', 'M21', 'M22', 'M23'],
            'Leeds': ['LS1', 'LS2', 'LS3', 'LS4', 'LS5', 'LS6', 'LS7', 'LS8', 'LS9', 'LS10'],
            'Liverpool': ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'],
            'Bristol': ['BS1', 'BS2', 'BS3', 'BS4', 'BS5', 'BS6', 'BS7', 'BS8', 'BS9', 'BS10'],
            'Sheffield': ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'],
            'Edinburgh': ['EH1', 'EH2', 'EH3', 'EH4', 'EH5', 'EH6', 'EH7', 'EH8', 'EH9', 'EH10'],
            'Glasgow': ['G1', 'G2', 'G3', 'G4', 'G5', 'G11', 'G12', 'G13', 'G14', 'G15'],
            'Cardiff': ['CF1', 'CF2', 'CF3', 'CF4', 'CF5', 'CF10', 'CF11', 'CF14', 'CF15', 'CF23']
        }
        
        # Add major city districts first
        for city, city_districts in major_cities.items():
            districts.extend(city_districts)
        
        # Add London special cases
        london_areas = ['EC', 'WC', 'E', 'N', 'NW', 'SE', 'SW', 'W']
        for area in london_areas:
            if len(area) == 1:
                # Single letter areas typically have more numbers
                for num in range(1, 21):
                    districts.append(f"{area}{num}")
            else:
                for num in range(1, 10):
                    districts.append(f"{area}{num}")
        
        # Add other major areas
        other_areas = [
            'AB', 'AL', 'BA', 'BB', 'BD', 'BH', 'BL', 'BN', 'BR', 'CA', 'CB', 'CH',
            'CM', 'CO', 'CR', 'CT', 'CV', 'DA', 'DD', 'DE', 'DG', 'DH', 'DL', 'DN',
            'DT', 'DY', 'EN', 'EX', 'FK', 'FY', 'GL', 'GU', 'HA', 'HD', 'HG', 'HP',
            'HR', 'HS', 'HU', 'HX', 'IG', 'IP', 'IV', 'KA', 'KT', 'KW', 'KY', 'LA',
            'LD', 'LE', 'LL', 'LN', 'LS', 'LU', 'ME', 'MK', 'ML', 'NE', 'NG', 'NN',
            'NP', 'NR', 'OL', 'OX', 'PA', 'PE', 'PH', 'PL', 'PO', 'PR', 'RG', 'RH',
            'RM', 'SA', 'SG', 'SK', 'SL', 'SM', 'SN', 'SO', 'SP', 'SR', 'SS', 'ST',
            'SY', 'TA', 'TD', 'TF', 'TN', 'TQ', 'TR', 'TS', 'TW', 'UB', 'WA', 'WD',
            'WF', 'WN', 'WR', 'WS', 'WV', 'YO', 'ZE'
        ]
        
        for area in other_areas:
            for num in range(1, 21):  # Most areas have up to 20 districts
                districts.append(f"{area}{num}")
        
        return sorted(list(set(districts)))  # Remove duplicates and sort
    
    def lookup_district(self, district: str, max_retries: int = 3) -> Tuple[bool, str, str]:
        """Look up constituency for a district using postcodes.io API"""
        # Skip if we already have this district
        if district in self.database["postcode_map"]:
            return True, district, self.database["postcode_map"][district]
        
        # Generate a sample postcode for this district
        test_postcodes = [f"{district} 1AA", f"{district} 1AB", f"{district} 1AD"]
        
        for attempt in range(max_retries):
            for test_postcode in test_postcodes:
                try:
                    self.wait_for_rate_limit()  # Respect rate limits
                    url = f"https://api.postcodes.io/postcodes/{test_postcode.replace(' ', '')}"
                    response = self.session.get(url, timeout=5)
                    self.state["total_requests"] += 1
                    
                    if response.status_code == 200:
                        data = response.json()
                        if 'result' in data and 'parliamentary_constituency' in data['result']:
                            constituency = data['result']['parliamentary_constituency']
                            self.state["success_count"] += 1
                            return True, district, constituency
                    
                    elif response.status_code == 429:  # Rate limit
                        delay = self.retry_delay * (attempt + 1)
                        print(f"Rate limited, waiting {delay} seconds...")
                        time.sleep(delay)
                        continue
                        
                except Exception as e:
                    print(f"Error looking up {test_postcode}: {e}")
                    self.state["error_count"] += 1
                    time.sleep(self.retry_delay)
            
            time.sleep(self.retry_delay)
        
        # Add to failed districts if all attempts fail
        if district not in self.state["failed_districts"]:
            self.state["failed_districts"].append(district)
            
        return False, district, ""
    
    def process_districts_batch(self, districts: List[str], batch_size: int = 10) -> Dict[str, Set[str]]:
        """Process a batch of districts and update the database"""
        district_constituencies = defaultdict(set)
        total = len(districts)
        
        # Resume from last processed index if available
        start_index = self.state["last_processed_index"]
        if start_index > 0:
            print(f"Resuming from district {start_index + 1} of {total}")
        
        print(f"\nProcessing {total - start_index} remaining districts in batches of {batch_size}...")
        
        try:
            for i in range(start_index, total, batch_size):
                batch = districts[i:i + batch_size]
                batch_num = i//batch_size + 1
                total_batches = (total + batch_size - 1)//batch_size
                
                print(f"\nBatch {batch_num}/{total_batches} ({((i + batch_size) * 100) // total}% complete)")
                print(f"Stats: {self.state['success_count']} successes, {self.state['error_count']} errors")
                
                for district in batch:
                    success, dist, constituency = self.lookup_district(district)
                    if success and constituency:
                        print(f"✓ {dist} → {constituency}")
                        district_constituencies[dist].add(constituency)
                        # Update database immediately
                        self.database["postcode_map"][dist] = constituency
                    else:
                        print(f"✗ {dist} (no valid constituency found)")
                
                # Update progress and save
                self.state["last_processed_index"] = i + batch_size
                self.save_state()
                self.save_database()
                
                # Show retry status for failed districts
                if self.state["failed_districts"]:
                    print(f"\nFailed districts ({len(self.state['failed_districts'])})")
                    print("These will be retried in the next run")
                
                print(f"\nProgress saved. Waiting before next batch...")
                time.sleep(2)  # Base delay between batches
                
        except KeyboardInterrupt:
            print("\nProcessing interrupted! Progress has been saved.")
            print("Run again to resume from where we left off.")
            self.save_state()
            self.save_database()
        
        return district_constituencies
    
    def validate_mappings(self) -> Tuple[int, int, List[str]]:
        """Validate existing mappings and return statistics"""
        total_districts = len(self.database["postcode_map"])
        valid_districts = 0
        invalid_mappings = []
        
        for district, constituency in self.database["postcode_map"].items():
            if constituency in self.database["constituencies"]:
                valid_districts += 1
            else:
                invalid_mappings.append(district)
        
        return total_districts, valid_districts, invalid_mappings

def main():
    """Main function to process and validate postcode districts"""
    processor = PostcodeDistrictProcessor()
    
    while True:
        print("\n=== Postcode District Processor ===")
        print("1. Process new districts")
        print("2. Validate existing mappings")
        print("3. Show statistics")
        print("4. Retry failed districts")
        print("5. Clear processing state")
        print("6. Exit")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == '1':
            districts = processor.generate_districts()
            print(f"\nGenerated {len(districts)} potential districts")
            
            batch_size = input("Enter batch size (default 10): ").strip()
            batch_size = int(batch_size) if batch_size.isdigit() else 10
            
            # If we have unprocessed districts, ask if we want to resume
            if processor.state["last_processed_index"] > 0:
                progress = (processor.state["last_processed_index"] * 100) // len(districts)
                print(f"\nFound existing progress ({progress}% complete)")
                resume = input("Resume from last position? (y/n): ").lower().strip()
                if resume != 'y':
                    processor.state["last_processed_index"] = 0
                    processor.state["failed_districts"] = []
                    processor.save_state()
            
            processor.process_districts_batch(districts, batch_size)
            print("\nProcessing complete!")
        
        elif choice == '2':
            total, valid, invalid = processor.validate_mappings()
            print(f"\nValidation Results:")
            print(f"Total Districts: {total}")
            print(f"Valid Mappings: {valid}")
            print(f"Invalid Mappings: {len(invalid)}")
            if invalid:
                print("\nInvalid district mappings:")
                for district in invalid[:10]:  # Show first 10
                    print(f"- {district} → {processor.database['postcode_map'][district]}")
                if len(invalid) > 10:
                    print(f"...and {len(invalid) - 10} more")
        
        elif choice == '3':
            print("\nDatabase Statistics:")
            print(f"Total MPs: {len(processor.database['constituencies'])}")
            print(f"Total Districts: {len(processor.database['postcode_map'])}")
            print(f"Last Updated: {processor.database['last_updated']}")
            print(f"Version: {processor.database['version']}")
            
            print("\nProcessing Statistics:")
            if "start_time" in processor.state:
                print(f"Started: {processor.state['start_time']}")
            print(f"Total Requests: {processor.state['total_requests']}")
            print(f"Successful Requests: {processor.state['success_count']}")
            print(f"Failed Requests: {processor.state['error_count']}")
            
            if processor.state["failed_districts"]:
                print(f"\nFailed Districts: {len(processor.state['failed_districts'])}")
                print("First 5 failures:")
                for district in processor.state["failed_districts"][:5]:
                    print(f"- {district}")
            
            # Show some example mappings
            print("\nExample Mappings:")
            samples = list(processor.database["postcode_map"].items())[:5]
            for district, constituency in samples:
                print(f"{district} → {constituency}")
        
        elif choice == '4':
            if not processor.state["failed_districts"]:
                print("\nNo failed districts to retry!")
                continue
                
            print(f"\nRetrying {len(processor.state['failed_districts'])} failed districts...")
            failed = processor.state["failed_districts"]
            processor.state["failed_districts"] = []  # Clear the list before retrying
            processor.save_state()
            
            batch_size = min(10, len(failed))  # Use smaller batch size for retries
            processor.process_districts_batch(failed, batch_size)
            print("\nRetry complete!")
            
        elif choice == '5':
            confirm = input("Are you sure you want to clear all processing state? (yes/no): ").lower().strip()
            if confirm == 'yes':
                processor.state = {
                    "last_processed_index": 0,
                    "failed_districts": [],
                    "total_requests": 0,
                    "success_count": 0,
                    "error_count": 0,
                    "start_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                processor.save_state()
                print("Processing state cleared!")
            else:
                print("Operation cancelled.")
        
        elif choice == '6':
            print("Goodbye!")
            break
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
