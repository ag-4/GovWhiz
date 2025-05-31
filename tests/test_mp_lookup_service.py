"""
Test suite for the enhanced MP lookup service
"""
import pytest
import json
import os
import requests
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from mp_lookup_service import MPLookupService

@pytest.fixture
def mock_config():
    return {
        'twfy_api_key': 'test_key',
        'twfy_api_url': 'https://www.theyworkforyou.com/api/',
        'postcodes_api_url': 'https://api.postcodes.io/postcodes/'
    }

@pytest.fixture
def test_service(tmp_path, mock_config):
    db_path = tmp_path / "test_db.json"
    config_path = tmp_path / "test_config.json"
    
    # Create test config
    with open(config_path, 'w') as f:
        json.dump(mock_config, f)
    
    return MPLookupService(db_path=str(db_path), config_path=str(config_path))

def test_postcode_validation(test_service):
    """Test postcode validation"""
    # Test valid postcodes
    valid_postcodes = [
        "SW1A 1AA",   # Westminster
        "BS5 9AU",    # Bristol East
        "M21 9WQ",    # Manchester Withington
        "B1 1AA",     # Birmingham
        "NW3 3AW",    # Hampstead
        "M16 0FL",    # Manchester
    ]
    
    for postcode in valid_postcodes:
        assert test_service.validate_postcode(postcode), f"Failed to validate {postcode}"
        assert test_service.validate_postcode(postcode.replace(" ", "")), f"Failed to validate {postcode} without space"
    
    # Test invalid postcodes
    invalid_postcodes = [
        "",
        "invalid",
        "SW1",
        "SW1A1A",
        "12345",
        "ABC DEF"
    ]
    
    for postcode in invalid_postcodes:
        assert not test_service.validate_postcode(postcode), f"Should not validate {postcode}"

@pytest.mark.asyncio
async def test_constituency_lookup(test_service):
    """Test constituency lookup from postcode"""
    test_cases = [
        ("SW1A 1AA", "Cities of London and Westminster"),
        ("M1 1AA", "Manchester Central"),
        ("B1 1AA", "Birmingham, Ladywood"),
    ]
    
    for postcode, expected_constituency in test_cases:
        mock_response = {
            'result': {
                'parliamentary_constituency': expected_constituency,
                'latitude': 51.5,
                'longitude': -0.1
            }
        }
        
        with patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = mock_response
            
            success, data = await test_service.get_constituency_from_postcode(postcode)
            
            assert success == True, f"Lookup failed for {postcode}"
            assert data['constituency'] == expected_constituency
            assert 'location' in data

@pytest.mark.asyncio
async def test_mp_lookup_with_fallback(test_service):
    """Test MP lookup with API fallback"""
    # Test successful API lookup
    with patch('requests.get') as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [{
            'given_name': 'John',
            'family_name': 'Smith',
            'party': 'Test Party',
            'email': 'john.smith@parliament.uk',
            'office_phone': '020 7219 3000',
            'url': 'https://www.parliament.uk/mp/john-smith',
            'twitter_username': '@johnsmith',
            'image': 'https://example.com/mp.jpg'
        }]
        mock_get.return_value = mock_response
        
        success, data = await test_service.get_mp_from_constituency("Test Constituency")
        assert success == True
        assert data['name'] == 'John Smith'
    
    # Clear cache before testing error case
    test_service.clear_cache()
    
    # Test API failure with error response
    with patch('requests.get') as mock_get:
        error_response = MagicMock()
        error_response.status_code = 500
        error_response.text = "Internal Server Error"
        error_response.json.side_effect = ValueError("No JSON available")
        mock_get.return_value = error_response
        
        success, data = await test_service.get_mp_from_constituency("Test Constituency")
        print(f"Response status code: {error_response.status_code}")
        print(f"Success: {success}")
        print(f"Data: {data}")
        assert success == False
        assert data.get('error') == 'Server error'

@pytest.mark.asyncio
async def test_full_lookup_flow(test_service):
    """Test the complete MP lookup flow"""
    postcode = "SW1A 1AA"
    
    # Mock responses
    mock_constituency_response = {
        'result': {
            'parliamentary_constituency': 'Cities of London and Westminster',
            'latitude': 51.5,
            'longitude': -0.1
        }
    }
    
    mock_mp_response = [{
        'given_name': 'John',
        'family_name': 'Smith',
        'party': 'Test Party',
        'email': 'john.smith@parliament.uk',
        'office_phone': '020 7219 3000',
    }]
    
    with patch('requests.get') as mock_get:
        def mock_api_call(*args, **kwargs):
            mock_response = MagicMock()
            mock_response.status_code = 200
            
            if 'postcodes.io' in args[0]:
                mock_response.json.return_value = mock_constituency_response
            else:
                mock_response.json.return_value = mock_mp_response
                
            return mock_response
            
        mock_get.side_effect = mock_api_call
        
        # Test full lookup
        result = await test_service.find_mp(postcode)
        
        assert result['found'] == True
        assert result['constituency'] == 'Cities of London and Westminster'
        assert result['mp']['name'] == 'John Smith'
        assert result['mp']['party'] == 'Test Party'
        
        # Test caching
        cached_result = await test_service.find_mp(postcode)
        assert cached_result == result