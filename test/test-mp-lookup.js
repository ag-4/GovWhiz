// MP Lookup API Test Script
const mpLookup = require('../netlify/functions/mp-lookup');

async function testPostcodes() {  const testCases = [
    'SW1A 0AA', // House of Commons
    'M14 4PX',  // Manchester
    'B5 4AX',   // Birmingham
    'EH8 8DX'   // Edinburgh
  ];

  console.log('Testing MP lookup with multiple postcodes...\n');

  for (const postcode of testCases) {
    console.log(`Testing postcode: ${postcode}`);
    try {
      const result = await mpLookup.handler({
        queryStringParameters: { postcode }
      });

      console.log(`Status: ${result.statusCode}`);
      const data = JSON.parse(result.body);
      
      if (data.error) {
        console.log(`Error: ${data.error}`);
      } else if (data.found && data.mp) {
        console.log(`MP: ${data.mp.name}`);
        console.log(`Constituency: ${data.constituency}`);
        console.log(`Party: ${data.mp.party}`);
      }
      
      console.log('---\n');
    } catch (error) {
      console.error(`Error testing ${postcode}:`, error);
      console.log('---\n');
    }
  }
}

// Run the tests
testPostcodes();
