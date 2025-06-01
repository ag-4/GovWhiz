const { createHandler } = require('@netlify/functions');
const express = require('express');
const TheyWorkForYouAdapter = require('./twfy_adapter');

const app = express();

// Initialize the adapter with API key from environment variable
const adapter = new TheyWorkForYouAdapter(process.env.THEYWORKFORYOU_API_KEY);

// MP lookup endpoint
app.get('/api/mp/lookup/:postcode', async (req, res) => {
    try {
        const { postcode } = req.params;
        const mpData = await adapter.get_mp_by_postcode(postcode);
        
        if (!mpData) {
            return res.status(404).json({ error: 'MP not found' });
        }
        
        res.json(mpData);
    } catch (error) {
        console.error('Error looking up MP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all MPs endpoint
app.get('/api/mp/all', async (req, res) => {
    try {
        const mps = await adapter.get_all_mps();
        res.json(mps);
    } catch (error) {
        console.error('Error fetching all MPs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// MP details endpoint
app.get('/api/mp/details/:personId', async (req, res) => {
    try {
        const { personId } = req.params;
        const mpDetails = await adapter.get_mp_details(personId);
        
        if (!mpDetails) {
            return res.status(404).json({ error: 'MP details not found' });
        }
        
        res.json(mpDetails);
    } catch (error) {
        console.error('Error fetching MP details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create handler for the Express app
const handler = createHandler(app);

// Export the handler for Netlify Functions
exports.handler = async (event, context) => {
  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    };
  }

  // Handle the actual request
  return await handler(event, context);
};
