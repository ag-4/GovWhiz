"""
Advanced test cases for the MP lookup service focusing on error handling
"""
import pytest
import json
import tempfile
import os
import requests
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
from mp_lookup_service import MPLookupService

@pytest.fixture
def invalid_config_service():
    """Service with invalid configuration"""
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
        json.dump({
            'twfy_api_key': '',  # Invalid API key
            'twfy_api_url': 'https://invalid.example.com/',
            'postcodes_api_url': 'https://invalid.example.com/'
        }, f)
        config_path = f.name
    
    return MPLookupService(db_path="test_db.json", config_path=config_path)

@pytest.fixture
def db_error_service():
    """Service with invalid database path"""
    return MPLookupService(db_path="/invalid/path/db.json", config_path="config.json")

@pytest.mark.asyncio
async def test_invalid_api_key(invalid_config_service):
    """Test handling of invalid API key"""
    with patch('requests.get') as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = "Invalid API key"
        mock_get.return_value = mock_response
        
        success, data = await invalid_config_service.get_mp_from_constituency("Test Constituency")
        assert success == False
        assert data.get('error') == "Invalid API key"

@pytest.mark.asyncio
async def test_connection_timeout():
    """Test handling of connection timeout"""
    service = MPLookupService()
    
    with patch('requests.get') as mock_get:
        mock_get.side_effect = requests.exceptions.Timeout("Connection timed out")
        
        success, data = await service.get_mp_from_constituency("Test Constituency")
        assert success == False
        assert data.get('error') == "Request timed out"

@pytest.mark.asyncio
async def test_rate_limit_response():
    """Test handling of rate limiting"""
    service = MPLookupService()
    
    with patch('requests.get') as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.text = "Rate limit exceeded"
        mock_get.return_value = mock_response
        
        success, data = await service.get_mp_from_constituency("Test Constituency")
        assert success == False
        assert data.get('error') == "Rate limit exceeded"

@pytest.mark.asyncio
async def test_malformed_api_response():
    """Test handling of malformed API responses"""
    service = MPLookupService()
    
    with patch('requests.get') as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        # Various malformed responses
        test_cases = [
            None,
            [],
            [None],
            [{}],
            [{'invalid': 'data'}],
            'Invalid JSON'
        ]
        
        for case in test_cases:
            if isinstance(case, str):
                mock_response.json.side_effect = ValueError("Invalid JSON")
                expected_error = "Invalid response from API"
            elif case is None or not isinstance(case, list):
                mock_response.json.return_value = case
                expected_error = "Invalid response format from API"
            elif not case:
                mock_response.json.return_value = case
                expected_error = "No valid MP data found for this constituency"
            else:
                mock_response.json.return_value = case
                expected_error = "Missing required MP name information"
            
            mock_get.return_value = mock_response
            success, data = await service.get_mp_from_constituency("Test Constituency")
            assert success == False, f"Case {case} should fail"
            assert data.get('error') == expected_error, f"Case {case} should return error '{expected_error}'"

@pytest.mark.asyncio
async def test_cache_expiry():
    """Test cache expiry behavior"""
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
        json.dump({
            'twfy_api_key': 'test_key',
            'twfy_api_url': 'https://www.theyworkforyou.com/api/',
            'postcodes_api_url': 'https://api.postcodes.io/postcodes/'
        }, f)
        config_path = f.name

    service = MPLookupService(db_path="test_db.json", config_path=config_path)
    test_constituency = "Test Constituency"
    
    # First request - should hit the API
    with patch('requests.get') as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mp_data = {
            'given_name': 'John',
            'family_name': 'Smith',
            'party': 'Test Party'
        }
        mock_response.json.return_value = [mp_data]
        mock_get.return_value = mock_response
        
        success, data = await service.get_mp_from_constituency(test_constituency)
        assert success == True
        assert mock_get.call_count == 1
        assert data['name'] == 'John Smith'
        
        # Second immediate request - should use cache
        success, data = await service.get_mp_from_constituency(test_constituency)
        assert success == True
        assert mock_get.call_count == 1  # No additional API call
        assert data['name'] == 'John Smith'
        
        # Manually expire the cache
        cache_key = f"constituency_{test_constituency}"
        service.db['cache'][cache_key]['timestamp'] = (
            datetime.now() - timedelta(hours=2)
        ).isoformat()
        
        # Third request after cache expiry - should hit the API again
        success, data = await service.get_mp_from_constituency(test_constituency)
        assert success == True
        assert mock_get.call_count == 2  # One more API call
        assert data['name'] == 'John Smith'
