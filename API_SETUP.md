# 🏛️ GovWhiz Real MP Lookup API Setup

## 📋 Overview

This guide will help you set up real MP lookup functionality using the TheyWorkForYou API, which provides access to UK Parliament data.

## 🔑 Getting Your API Key

### Step 1: Visit TheyWorkForYou
1. Go to [TheyWorkForYou.com](https://www.theyworkforyou.com/)
2. Navigate to their API documentation page
3. Look for "API Key" or "Developer Access" section

### Step 2: Register for API Access
1. Create an account if you don't have one
2. Request an API key for your project
3. Describe your use case (e.g., "Educational civic engagement platform")

### Step 3: Get Your API Key
1. Once approved, you'll receive your API key
2. Copy the key - it will look something like: `A1B2C3D4E5F6G7H8`

## ⚙️ Configuration

### Python Setup (mp_lookup_api.py)
```python
# Replace this line in mp_lookup_api.py:
API_KEY = "your_api_key_here"

# With your actual API key:
API_KEY = "A1B2C3D4E5F6G7H8"  # Your actual key
```

### JavaScript Setup (mp_lookup_real.js)
```javascript
// Replace this line in mp_lookup_real.js:
this.apiKey = 'your_api_key_here';

// With your actual API key:
this.apiKey = 'A1B2C3D4E5F6G7H8';  // Your actual key
```

## 🚀 Testing Your Setup

### Test with Python
```bash
python mp_lookup_api.py
```

Enter a test postcode like `SW1A 1AA` to verify the API connection.

### Test with Web Interface
1. Open your GovWhiz website
2. Try the MP lookup feature
3. Enter a valid UK postcode
4. Check browser console for any errors

## 📝 Example Postcodes for Testing

- `SW1A 1AA` - Westminster (Prime Minister's constituency area)
- `M1 1AA` - Manchester Central
- `B1 1AA` - Birmingham
- `BS1 1AA` - Bristol
- `LS1 1AA` - Leeds
- `NE1 1AA` - Newcastle
- `G1 1AA` - Glasgow

## 🔧 Troubleshooting

### Common Issues

#### 1. "Invalid API Key" Error
- Double-check your API key is correct
- Ensure no extra spaces or characters
- Verify the key is active and not expired

#### 2. CORS Errors (Browser)
- TheyWorkForYou API might not allow direct browser requests
- Consider setting up a backend proxy
- Use the Python script as a backend service

#### 3. "No MP Found" for Valid Postcodes
- Check if the postcode format is correct
- Some postcodes might not have current MP data
- Try different test postcodes

### Backend Proxy Solution

If you encounter CORS issues, create a simple Flask backend:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

API_KEY = "your_api_key_here"

@app.route('/api/mp/<postcode>')
def get_mp(postcode):
    url = "https://www.theyworkforyou.com/api/getMP"
    params = {
        "postcode": postcode,
        "key": API_KEY,
        "output": "json"
    }
    
    response = requests.get(url, params=params)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

Then update your JavaScript to call `http://localhost:5000/api/mp/{postcode}` instead.

## 🌟 Alternative APIs

If TheyWorkForYou doesn't work for you, consider these alternatives:

### 1. UK Parliament Members API
- URL: `https://members-api.parliament.uk/`
- Free, official UK Parliament API
- No API key required for basic usage

### 2. MapIt + Parliament API Combination
- Use MapIt for postcode to constituency: `https://mapit.mysociety.org/`
- Then Parliament API for MP details

### 3. Democratic APIs
- Various civic data APIs available
- Check for local government data sources

## 📚 API Documentation

- [TheyWorkForYou API Docs](https://www.theyworkforyou.com/api/)
- [UK Parliament API](https://members-api.parliament.uk/index.html)
- [MapIt API](https://mapit.mysociety.org/docs/)

## 🔒 Security Notes

1. **Never commit API keys to public repositories**
2. **Use environment variables for production**
3. **Implement rate limiting if building a public service**
4. **Consider caching responses to reduce API calls**

## 📞 Support

If you need help:
1. Check the API provider's documentation
2. Look for community forums or support channels
3. Consider using mock data for development/testing

---

**Happy coding! 🚀 Your GovWhiz platform will soon have real MP lookup functionality!**
