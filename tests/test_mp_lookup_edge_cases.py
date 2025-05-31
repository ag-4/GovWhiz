"""
Test suite for edge cases in the MP lookup service
"""
import pytest
import json
import requests
from unittest.mock import patch, MagicMock
from mp_lookup_service import MPLookupService

@pytest.fixture
def test_service(tmp_path):
    db_path = tmp_path / "test_db.json"
    config_path = tmp_path / "test_config.json"
    
    mock_config = {
        'twfy_api_key': 'test_key',
        'twfy_api_url': 'https://www.theyworkforyou.com/api/',
        'postcodes_api_url': 'https://api.postcodes.io/postcodes/'
    }
    
    with open(config_path, 'w') as f:
        json.dump(mock_config, f)
    
    return MPLookupService(db_path=str(db_path), config_path=str(config_path))

@pytest.mark.asyncio
async def test_empty_json_response(test_service):
    """Test handling of empty JSON response"""
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = []
        
        success, data = await test_service.get_mp_from_constituency("Test Constituency")
        assert success == False
        assert data['error'] == "No valid MP data found for this constituency"

@pytest.mark.asyncio
async def test_invalid_json_response(test_service):
    """Test handling of invalid JSON response"""
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.side_effect = ValueError("Invalid JSON")
        
        success, data = await test_service.get_mp_from_constituency("Test Constituency")
        assert success == False
        assert data['error'] == "Invalid response from API"

@pytest.mark.asyncio
async def test_timeout_error(test_service):
    """Test handling of request timeout"""
    with patch('requests.get') as mock_get:
        mock_get.side_effect = requests.exceptions.Timeout("Request timed out")
        
        success, data = await test_service.get_mp_from_constituency("Test Constituency")
        assert success == False
        assert "timed out" in data['error']

@pytest.mark.asyncio
async def test_connection_error(test_service):
    """Test handling of connection error"""
    with patch('requests.get') as mock_get:
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection failed")
        
        success, data = await test_service.get_mp_from_constituency("Test Constituency")
        assert success == False
        assert "Network error" in data['error']
        assert "Connection failed" in data['error']

@pytest.mark.asyncio
async def test_empty_constituency(test_service):
    """Test handling of empty constituency name"""
    success, data = await test_service.get_mp_from_constituency("")
    assert success == False
    assert "error" in data

@pytest.mark.asyncio
async def test_partial_mp_data(test_service):
    """Test handling of partial MP data"""
    mock_mp_data = [{
        'given_name': 'John',
        # Missing family_name
        'party': 'Test Party',
        # Missing other fields
    }]
    
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_mp_data
        
        success, data = await test_service.get_mp_from_constituency("Test Constituency")
        assert success == True
        assert data['name'] == 'John'  # Should handle missing family name
        assert data['party'] == 'Test Party'
        assert all(key in data for key in ['email', 'phone', 'website', 'twitter', 'image_url'])  # Should have all fields
