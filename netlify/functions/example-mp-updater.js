const MPDatabaseUpdater = require('./mp-database-updater');

// Example usage function
async function lookupAndUpdateMP(postcode) {
    try {
        console.log(`Looking up MP for postcode: ${postcode}`);
        
        // Try to process the postcode (this will also update the database)
        const result = await MPDatabaseUpdater.processPostcode(postcode);
        
        if (result.success) {
            console.log('Successfully found MP:');
            console.log(`Name: ${result.mp.name}`);
            console.log(`Party: ${result.mp.party}`);
            console.log(`Constituency: ${result.constituency}`);
            console.log(`Email: ${result.mp.email}`);
            console.log(`Phone: ${result.mp.phone}`);
            console.log(`Website: ${result.mp.website}`);
            console.log(`Twitter: ${result.mp.twitter}`);
            console.log(`Facebook: ${result.mp.facebook}`);
            console.log(`Instagram: ${result.mp.instagram}`);
            console.log(`LinkedIn: ${result.mp.linkedin}`);
            
            // Also show postcode pattern matching
            const pattern = postcode.match(/^[A-Z]{1,2}\d{1,2}/i)[0];
            console.log(`\nChecking other MPs in ${pattern} area...`);
            const patternResults = await MPDatabaseUpdater.getMPByPattern(pattern);
            
            if (patternResults.success && patternResults.results.length > 0) {
                console.log(`Found ${patternResults.results.length} MPs in this area:`);
                patternResults.results.forEach(entry => {
                    console.log(`- ${entry.mp.name} (${entry.constituency})`);
                });
            }
        } else {
            console.log('Failed to find MP:', result.error);
        }
    } catch (error) {
        console.error('Error during lookup:', error);
    }
}

// Example postcodes for testing
const testPostcodes = [
    'BS5 9AU',  // Bristol
    'SW1A 0AA', // Westminster
    'M1 1AE',   // Manchester
    'B1 1HQ',   // Birmingham
    'E1 6AN'    // East London
];

// Run tests sequentially
async function runTests() {
    for (const postcode of testPostcodes) {
        console.log('\n' + '='.repeat(50));
        await lookupAndUpdateMP(postcode);
    }
}

// Run the example
console.log('Starting MP database updater test...');
runTests().then(() => console.log('\nTests complete'));
