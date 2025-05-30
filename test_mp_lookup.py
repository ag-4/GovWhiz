"""
Test script for MP lookup system
"""
from mp_lookup_service import MPLookupService

def test_postcodes():
    """Test various postcode formats"""
    service = MPLookupService()
    
    # Test different postcode formats
    test_cases = [
        "SW1A 1AA",   # Westminster
        "BS5 9AU",    # Bristol East
        "M21 9WQ",    # Manchester Withington
        "B1 1AA",     # Birmingham
        "NW3 3AW",    # New case
        "M16 0FL",    # New case
    ]
    
    print("Testing postcode lookups...")
    print("-" * 50)
    
    for postcode in test_cases:
        print(f"\nTesting postcode: {postcode}")
        result = service.lookup_mp(postcode)
        
        if result["found"]:
            mp = result["mp"]
            print("Found MP:")
            print(f"Name: {mp.get('name', 'N/A')}")
            print(f"Party: {mp.get('party', 'N/A')}")
            
            # Show additional info if available
            for field in ['email', 'phone', 'website']:
                value = mp.get(field)
                if value and value != "N/A":
                    print(f"{field.title()}: {value}")
        else:
            print(f"Error: {result.get('error', 'Could not find MP')}")
    
    print("\nTest complete!")

if __name__ == "__main__":
    test_postcodes()
