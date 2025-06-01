const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs').promises;
const path = require('path');

class MPDatabaseUpdater {
    constructor() {
        this.postcodeCache = new Map();
        this.postcodePatterns = new Map();
        this.databasePath = path.join(__dirname, 'mp-database.js');
    }

    async loadDatabase() {
        try {
            const db = require('./mp-database');
            return db;
        } catch (error) {
            console.error('Error loading database:', error);
            return {};
        }
    }

    cleanPostcode(postcode) {
        return postcode.toString().trim().toUpperCase().replace(/\s+/g, ' ');
    }

    getPostcodePattern(postcode) {
        const cleaned = this.cleanPostcode(postcode);
        const match = cleaned.match(/^[A-Z]{1,2}\d{1,2}/i);
        return match ? match[0].toUpperCase() : null;
    }

    async getMPFromConstituency(constituencyName) {
        try {
            console.log('Looking up MP for constituency:', constituencyName);
            
            // Step 1: Search for constituency
            const searchUrl = 'https://members-api.parliament.uk/api/Location/Constituency/Search';
            const searchParams = new URLSearchParams({
                searchText: constituencyName,
                skip: '0',
                take: '1'
            });

            const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
            if (!searchResponse.ok) {
                throw new Error(`API Error (${searchResponse.status}): ${await searchResponse.text()}`);
            }

            const searchData = await searchResponse.json();
            if (!searchData.items?.length) {
                throw new Error('Constituency not found');
            }

            const constituencyMatch = searchData.items[0].value;
            const mpData = constituencyMatch.currentRepresentation?.member?.value;

            if (!mpData) {
                throw new Error('No current MP found');
            }

            // Step 2: Get additional MP information
            const contactUrl = `https://members-api.parliament.uk/api/Members/${mpData.id}/Contact`;
            const contactResponse = await fetch(contactUrl);
            const contactData = await contactResponse.json();

            const socialUrl = `https://members-api.parliament.uk/api/Members/${mpData.id}/SocialLinks`;
            const socialResponse = await fetch(socialUrl);
            const socialData = await socialResponse.json();

            // Build complete MP profile
            return {
                found: true,
                mp: {
                    id: mpData.id.toString(),
                    name: mpData.nameDisplayAs,
                    party: mpData.latestParty?.name || 'Unknown Party',
                    constituency: constituencyMatch.name,
                    constituencyId: constituencyMatch.id.toString(),
                    email: contactData.value?.email || 
                           `${mpData.nameDisplayAs.toLowerCase().replace(/[^a-z]/g, '.')}@parliament.uk`,
                    phone: contactData.value?.phone || '020 7219 3000',
                    website: contactData.value?.website || 
                            `https://members.parliament.uk/member/${mpData.id}`,
                    address: contactData.value?.addresses?.[0]?.address || '',
                    twitter: socialData.items?.find(s => s.type === "Twitter")?.value || '',
                    facebook: socialData.items?.find(s => s.type === "Facebook")?.value || '',
                    instagram: socialData.items?.find(s => s.type === "Instagram")?.value || '',
                    linkedin: socialData.items?.find(s => s.type === "LinkedIn")?.value || '',
                    image: mpData.thumbnailUrl,
                    lastUpdated: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error getting MP details:', error);
            return {
                found: false,
                error: error.message
            };
        }
    }

    async getConstituencyFromPostcode(postcode) {
        try {
            const cleanPostcode = this.cleanPostcode(postcode);
            const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Postcode lookup failed: ${response.status}`);
            }

            const data = await response.json();
            if (!data.result?.parliamentary_constituency) {
                throw new Error('No constituency found for postcode');
            }

            return {
                found: true,
                constituency: data.result.parliamentary_constituency,
                location: {
                    latitude: data.result.latitude,
                    longitude: data.result.longitude
                },
                postcodePattern: this.getPostcodePattern(cleanPostcode)
            };
        } catch (error) {
            return {
                found: false,
                error: error.message
            };
        }
    }

    async updateDatabase(constituencyName, mpInfo) {
        try {
            console.log('Updating database for constituency:', constituencyName);
            
            const normalizedConstituency = constituencyName.toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/ and /gi, ' & ')
                .trim();

            const currentDb = await this.loadDatabase();
            const updatedDb = {
                ...currentDb,
                [normalizedConstituency]: mpInfo
            };

            const content = `// Local MP database for fallback and caching
const MPDatabase = ${JSON.stringify(updatedDb, null, 4)};

module.exports = MPDatabase;`;

            await fs.writeFile(this.databasePath, content, 'utf8');
            return true;
        } catch (error) {
            console.error('Error updating database:', error);
            return false;
        }
    }

    async processPostcode(postcode) {
        try {
            console.log(`Processing postcode: ${postcode}`);
            
            // Step 1: Get constituency
            const constituencyInfo = await this.getConstituencyFromPostcode(postcode);
            if (!constituencyInfo.found) {
                throw new Error(constituencyInfo.error);
            }

            // Step 2: Get MP details
            const mpInfo = await this.getMPFromConstituency(constituencyInfo.constituency);
            if (!mpInfo.found) {
                throw new Error(mpInfo.error);
            }

            // Step 3: Update database
            const updated = await this.updateDatabase(constituencyInfo.constituency, mpInfo.mp);
            if (!updated) {
                throw new Error('Failed to update database');
            }

            // Step 4: Update pattern mapping
            if (constituencyInfo.postcodePattern) {
                if (!this.postcodePatterns.has(constituencyInfo.postcodePattern)) {
                    this.postcodePatterns.set(constituencyInfo.postcodePattern, new Set());
                }
                this.postcodePatterns.get(constituencyInfo.postcodePattern)
                    .add(constituencyInfo.constituency);
            }

            return {
                success: true,
                mp: mpInfo.mp,
                constituency: constituencyInfo.constituency,
                location: constituencyInfo.location,
                pattern: constituencyInfo.postcodePattern
            };

        } catch (error) {
            console.error('Error processing postcode:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async lookupByPattern(pattern) {
        try {
            const normalizedPattern = pattern.toUpperCase();
            const currentDb = await this.loadDatabase();
            const matchingConstituencies = Array.from(this.postcodePatterns.get(normalizedPattern) || []);
            
            const results = matchingConstituencies
                .filter(c => currentDb[c])
                .map(c => ({
                    constituency: c,
                    mp: currentDb[c]
                }));

            return {
                success: true,
                results,
                pattern: normalizedPattern,
                count: results.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                pattern
            };
        }
    }
}

// Export a singleton instance
module.exports = new MPDatabaseUpdater();
