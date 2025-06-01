const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testMPLookupAPI(constituency) {
    try {
        console.log(`Testing MP lookup for constituency: ${constituency}\n`);

        // Step 1: Search for constituency
        console.log('Step 1: Searching for constituency...');
        const searchUrl = 'https://members-api.parliament.uk/api/Location/Constituency/Search';
        const searchParams = new URLSearchParams({
            searchText: constituency,
            skip: '0',
            take: '1'
        });

        const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
        if (!searchResponse.ok) {
            throw new Error(`Constituency search failed: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        console.log('Search response:', JSON.stringify(searchData, null, 2));

        if (!searchData.items || searchData.items.length === 0) {
            throw new Error('No constituency found');
        }

        const constituencyMatch = searchData.items[0].value;
        console.log('\nConstituency found:', {
            id: constituencyMatch.id,
            name: constituencyMatch.name,
            currentRepresentation: constituencyMatch.currentRepresentation || 'None'
        });

        // Step 2: Get current MP
        if (!constituencyMatch.currentRepresentation?.member?.id) {
            throw new Error('No current MP found');
        }

        const mpId = constituencyMatch.currentRepresentation.member.id;
        console.log('\nStep 2: Getting MP details...');
        const mpUrl = `https://members-api.parliament.uk/api/Members/${mpId}`;
        
        const mpResponse = await fetch(mpUrl);
        if (!mpResponse.ok) {
            throw new Error(`MP details lookup failed: ${mpResponse.status}`);
        }

        const mpData = await mpResponse.json();
        console.log('MP data:', JSON.stringify(mpData, null, 2));

        // Step 3: Get social media links
        console.log('\nStep 3: Getting social media links...');
        const socialUrl = `https://members-api.parliament.uk/api/Members/${mpId}/SocialLinks`;
        
        const socialResponse = await fetch(socialUrl);
        if (!socialResponse.ok) {
            console.warn('Warning: Could not fetch social media links');
        } else {
            const socialData = await socialResponse.json();
            console.log('Social media data:', JSON.stringify(socialData, null, 2));
        }

        return {
            success: true,
            message: 'All API calls completed successfully'
        };

    } catch (error) {
        console.error('\nError during test:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test constituencies
const constituencies = [
    'Cities of London and Westminster',
    'Hackney North and Stoke Newington',
    'Manchester Central',
    'Birmingham, Ladywood'
];

// Run tests
async function runTests() {
    console.log('Starting API tests...\n');
    console.log('='.repeat(50));

    for (const constituency of constituencies) {
        console.log(`\nTesting constituency: ${constituency}`);
        console.log('-'.repeat(50));
        
        const result = await testMPLookupAPI(constituency);
        
        console.log('\nTest result:', result);
        console.log('='.repeat(50));
    }
}

// Run the tests
runTests().then(() => console.log('\nAll tests complete'));
