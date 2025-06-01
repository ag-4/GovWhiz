const MPDatabaseUpdater = require('./mp-database-updater');

async function testUpdater() {
    try {
        // Test full postcode
        console.log('\nTesting full postcode lookup...');
        const result1 = await MPDatabaseUpdater.processPostcode('BS5 9AU');
        console.log('Result:', JSON.stringify(result1, null, 2));

        // Test partial postcode pattern
        console.log('\nTesting partial postcode pattern...');
        const result2 = await MPDatabaseUpdater.getMPByPattern('BS5');
        console.log('Pattern results:', JSON.stringify(result2, null, 2));

        // Test another postcode in the same area
        console.log('\nTesting another postcode in the same area...');
        const result3 = await MPDatabaseUpdater.processPostcode('BS5 7TT');
        console.log('Result:', JSON.stringify(result3, null, 2));

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testUpdater().then(() => console.log('Test complete'));
