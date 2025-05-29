# 🏛️ GovWhiz Backend MP Lookup Setup Guide

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
python start_server.py
```

### Option 2: Manual Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

## 📋 What You Get

### 🖥️ Flask Backend Server
- **Real MP lookup API** using TheyWorkForYou
- **Automatic fallback** to mock data
- **CORS enabled** for frontend integration
- **Health check endpoints** for monitoring
- **Comprehensive error handling**

### 🌐 API Endpoints

#### Main Endpoints:
- `GET /` - Serves your GovWhiz main page
- `GET /api/mp?postcode=SW1A1AA` - MP lookup by postcode
- `GET /api/health` - Server health check
- `GET /api/test` - Test with sample postcodes

#### Example API Usage:
```bash
# Test the API
curl "http://localhost:5000/api/mp?postcode=SW1A1AA"

# Health check
curl "http://localhost:5000/api/health"

# Test data
curl "http://localhost:5000/api/test"
```

## 🔧 Configuration

### Environment Variables (Optional)
```bash
# Set your TheyWorkForYou API key
export THEYWORKFORYOU_API_KEY="your_api_key_here"

# Or create a .env file:
echo "THEYWORKFORYOU_API_KEY=your_api_key_here" > .env
```

### Without API Key
- Server will use **mock data** for testing
- All functionality works with realistic sample data
- Perfect for development and demonstrations

## 🧪 Testing Your Setup

### 1. Start the Server
```bash
python start_server.py
```

You should see:
```
🏛️ Starting GovWhiz MP Lookup Server
====================================
API Key configured: False
Available endpoints:
  GET /                    - Main GovWhiz page
  GET /api/mp?postcode=... - MP lookup
  GET /api/health          - Health check
  GET /api/test            - Test with sample data
====================================
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[your-ip]:5000
```

### 2. Test the API
Open another terminal and test:

```bash
# Test MP lookup
curl "http://localhost:5000/api/mp?postcode=SW1A1AA"

# Expected response:
{
  "found": true,
  "name": "Rt Hon Rishi Sunak MP",
  "party": "Conservative",
  "constituency": "Richmond (Yorks)",
  "email": "rishi.sunak.mp@parliament.uk",
  "website": "https://members.parliament.uk/member/4212/contact",
  "phone": "020 7219 5000",
  "postcode": "SW1A 1AA",
  "mock": true,
  "timestamp": "2025-01-27T..."
}
```

### 3. Test Your Website
1. Open your GovWhiz website: `http://localhost:5000/`
2. Try the MP lookup feature
3. Enter a postcode like `SW1A 1AA`
4. Check browser console for connection status

## 🔄 Integration Levels

Your GovWhiz now has **3 levels of MP lookup**:

### Level 1: Flask Backend (Primary) 🖥️
- **Best option** - Full server with API
- Real data when API key configured
- Mock data for testing without API key
- Handles CORS and error management

### Level 2: Direct API (Secondary) 🌐
- Direct browser calls to TheyWorkForYou
- May have CORS issues
- Requires API key in frontend

### Level 3: Mock Data (Fallback) 📋
- Always works for demonstrations
- Realistic sample data
- No external dependencies

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
pip install -r requirements.txt
```

#### 2. Port 5000 already in use
```bash
# Kill existing process
lsof -ti:5000 | xargs kill -9

# Or change port in app.py:
app.run(debug=True, host="0.0.0.0", port=5001)
```

#### 3. CORS errors in browser
- The Flask server has CORS enabled
- Make sure you're accessing via `http://localhost:5000/`
- Check that the server is running

#### 4. API key issues
- Server works without API key (uses mock data)
- Set environment variable: `export THEYWORKFORYOU_API_KEY=your_key`
- Check `/api/health` endpoint for configuration status

### Debug Mode

Enable detailed logging:
```python
# In app.py, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T...",
  "api_configured": false
}
```

### Test Endpoint
```bash
curl http://localhost:5000/api/test
```

Returns sample data for multiple postcodes.

## 🚀 Production Deployment

### For Production Use:

1. **Set API key** as environment variable
2. **Use production WSGI server** (gunicorn, uWSGI)
3. **Configure reverse proxy** (nginx, Apache)
4. **Enable HTTPS** for security
5. **Set up monitoring** and logging

### Example Production Command:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🎯 Next Steps

1. **Start the server**: `python start_server.py`
2. **Test the integration**: Open your GovWhiz website
3. **Get API key**: For real data from TheyWorkForYou
4. **Customize**: Modify `app.py` for additional features

## 📞 Support

If you encounter issues:
1. Check the server logs in terminal
2. Test API endpoints with curl
3. Verify browser console for errors
4. Ensure all dependencies are installed

---

**Your GovWhiz now has a professional backend API for real MP lookup functionality!** 🏛️✨
