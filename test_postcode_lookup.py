#!/usr/bin/env python3
"""
Test the postcode lookup functionality with various formats
"""
from mp_service import MPLookupService

def test_postcodes():
    """Test various postcode formats"""
    service = MPLookupService()
    
    # Test cases - mix of formats and areas
    test_cases = [
        "SW1A 1AA",  # Westminster
        "BS5 9AU",   # Bristol
        "M21 9WQ",   # Manchester
        "B1 1AA",    # Birmingham
        "M1 1AE",    # Manchester Central
        "BS1 6QF",   # Bristol Central
    ]
    
    print("Testing postcode lookup...")
    print("-" * 50)
    
    for postcode in test_cases:
        print(f"\nTesting postcode: {postcode}")
        result = service.lookup_mp(postcode)
        if result["found"]:
            print(f"✓ Found MP: {result.get('name')} ({result.get('constituency')})")
            print(f"  Party: {result.get('party')}")
            print(f"  Email: {result.get('email')}")
        else:
            print(f"✗ Error: {result.get('error')}")
            
    print("\nTest complete!")

if __name__ == "__main__":
    test_postcodes()
