const { createHandler } = require('@netlify/functions');
const serverless = require('serverless-http');
const { app } = require('../../app.py');

// Create handler for the Flask app
const handler = serverless(app);

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
