const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const MPDatabase = require('./mp-database');
const MPDatabaseUpdater = require('./mp-database-updater');

// Cache for MP data with proper expiration
const mpCache = new Map();
const CACHE_DURATION = 3600000; // 1 hour
const MAX_RETRIES = 3; // Maximum number of retry attempts for API calls

// Normalize constituency name
function normalizeConstituencyName(name) {
    return name.trim()
              .replace(/\s+/g, ' ')
              .replace(/ and /gi, ' & ')
              .toLowerCase();
}

// Validate UK postcode format
function isValidPostcode(postcode) {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode);
}

exports.handler = async (event) => {
    try {
        const { postcode, pattern } = event.queryStringParameters;

        // Handle pattern-based lookup
        if (pattern) {
            const results = await MPDatabaseUpdater.getMPByPattern(pattern);
            return {
                statusCode: results.success ? 200 : 404,
                body: JSON.stringify(results)
            };
        }

        // Handle full postcode lookup
        if (!postcode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Postcode or pattern is required' })
            };
        }

        // Clean and validate postcode
        const cleanPostcode = postcode.toString().trim().toUpperCase().replace(/\s+/g, ' ');
        if (!isValidPostcode(cleanPostcode)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid postcode format' })
            };
        }

        console.log(`Processing postcode lookup for: ${cleanPostcode}`);

        // Check cache with proper expiration
        const cachedResult = mpCache.get(cleanPostcode);
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
            console.log(`Serving cached result for postcode: ${cleanPostcode}`);
            return {
                statusCode: 200,
                body: JSON.stringify(cachedResult.data)
            };
        }        // Try to get MP info using the updater
        const updaterResult = await MPDatabaseUpdater.processPostcode(cleanPostcode);
        
        if (updaterResult.success) {
            // Cache the successful result
            mpCache.set(cleanPostcode, {
                data: updaterResult,
                timestamp: Date.now()
            });

            return {
                statusCode: 200,
                body: JSON.stringify(updaterResult)
            };
        }

        // If updater failed, try the existing API lookup process
        // Step 1: Get constituency from postcodes.io with retries
        let postcodeData = null;
        let lastError = null;

        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const postcodeUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`;
                console.log(`Attempt ${i + 1}: Fetching constituency for postcode: ${cleanPostcode}`);
                
                const postcodeResponse = await fetch(postcodeUrl, { timeout: 5000 });
                if (!postcodeResponse.ok) {
                    throw new Error(`Postcode API error: ${postcodeResponse.status}`);
                }

                postcodeData = await postcodeResponse.json();
                if (postcodeData.result?.parliamentary_constituency) {
                    break;
                }
                
                throw new Error('No constituency found in postcode data');
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error.message);
                lastError = error;
                if (i < MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
                }
            }
        }

        if (!postcodeData?.result?.parliamentary_constituency) {
            console.error('All postcode lookup attempts failed:', lastError?.message);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No constituency found for this postcode' })
            };
        }        const constituency = postcodeData.result.parliamentary_constituency;
        console.log(`Found constituency: ${constituency}`);

        // Normalize constituency name for consistent lookup
        const normalizedConstituency = normalizeConstituencyName(constituency);
        
        // Check if we have this MP in our local database first
        if (MPDatabase[normalizedConstituency]) {
            console.log(`Found MP in local database for constituency: ${constituency}`);
            const localMP = MPDatabase[normalizedConstituency];
            
            const result = {
                found: true,
                constituency: constituency,
                mp: {
                    ...localMP,
                    constituency: constituency,
                    lastUpdated: new Date().toISOString()
                },
                location: {
                    latitude: postcodeData.result.latitude,
                    longitude: postcodeData.result.longitude
                },
                source: 'local_database'
            };

            // Cache the result
            mpCache.set(cleanPostcode, {
                data: result,
                timestamp: Date.now()
            });

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        }

        // If not in local database, try Parliament API with retries
        let constituencyData;
        let constituencyResponse;

        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const constituencyUrl = `https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${encodeURIComponent(constituency)}&skip=0&take=1`;
                console.log(`Attempt ${i + 1}: Looking up constituency ID for: ${constituency}`);
                
                constituencyResponse = await fetch(constituencyUrl, { timeout: 5000 });
                if (!constituencyResponse.ok) {
                    throw new Error(`Constituency lookup error: ${constituencyResponse.status}`);
                }

                constituencyData = await constituencyResponse.json();
                if (constituencyData.items?.[0]?.value?.id) {
                    break;
                }

                throw new Error('Constituency not found in Parliament database');
            } catch (error) {
                console.error(`Constituency lookup attempt ${i + 1} failed:`, error.message);
                if (i === MAX_RETRIES - 1) {
                    return {
                        statusCode: 503,
                        body: JSON.stringify({ error: 'Parliament API temporarily unavailable' })
                    };
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }

        const constituencyDetails = constituencyData.items[0].value;
        const mpId = constituencyDetails.currentRepresentation?.member?.id;
        
        if (!mpId) {
            console.error(`No current MP found for constituency: ${constituency}`);
            return {
                statusCode: 404,
                body: JSON.stringify({ 
                    error: 'No current MP found for this constituency',
                    constituency: constituency 
                })
            };
        }

        // Get full MP details with retries
        let mpData;
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const mpUrl = `https://members-api.parliament.uk/api/Members/${mpId}`;
                console.log(`Attempt ${i + 1}: Looking up MP details for ID: ${mpId}`);
                
                const mpResponse = await fetch(mpUrl, { timeout: 5000 });
                if (!mpResponse.ok) {
                    throw new Error(`MP lookup error: ${mpResponse.status}`);
                }
                
                mpData = await mpResponse.json();
                if (mpData.value) {
                    break;
                }
                
                throw new Error('No MP data in response');
            } catch (error) {
                console.error(`MP lookup attempt ${i + 1} failed:`, error.message);
                if (i === MAX_RETRIES - 1) {
                    return {
                        statusCode: 503,
                        body: JSON.stringify({ 
                            error: 'Unable to retrieve MP details',
                            constituency: constituency,
                            suggestion: 'Please try again later'
                        })
                    };
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }

        const mp = mpData.value;
        console.log(`Found MP: ${mp.nameDisplayAs}`);
        
        // Format MP data with comprehensive information
        const result = {
            found: true,
            constituency: constituency,
            mp: {
                id: mp.id,
                name: mp.nameDisplayAs || mp.name || 'Unknown',
                party: mp.latestParty?.name || 'Unknown Party',
                memberId: mp.id,
                constituency: constituency,
                email: mp.contactDetails?.find(c => c.type === "Email")?.value || 
                       `${mp.nameDisplayAs.toLowerCase().replace(/\s+/g, '.')}@parliament.uk`,
                phone: mp.contactDetails?.find(c => c.type === "Phone")?.value || "020 7219 3000",
                website: mp.contactDetails?.find(c => c.type === "Website")?.value || 
                        `https://members.parliament.uk/member/${mp.id}`,
                address: mp.contactDetails?.find(c => c.type === "Address")?.value,
                twitter: mp.socialLinks?.find(s => s.type === "Twitter")?.value,
                facebook: mp.socialLinks?.find(s => s.type === "Facebook")?.value,
                image: mp.thumbnailUrl || `https://members-api.parliament.uk/api/Members/${mp.id}/Portrait?cropType=ThreeFour`,
                lastUpdated: new Date().toISOString()
            },
            location: {
                latitude: postcodeData.result.latitude,
                longitude: postcodeData.result.longitude
            },
            timestamp: new Date().toISOString(),
            source: 'parliament_api'
        };

        // Cache the result
        mpCache.set(cleanPostcode, {
            data: result,
            timestamp: Date.now()
        });

        console.log('Successfully retrieved and formatted MP data');
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('MP lookup error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to look up MP',
                details: error.message
            })
        };
    }
};
