const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs').promises;
const path = require('path');
const MPDatabase = require('./mp-database');

class MPDatabaseUpdater {
    constructor() {
        this.postcodeCache = new Map();
        this.postcodePatterns = new Map(); // Store postcode patterns (e.g., 'BS5' -> ['BS5 9AU', 'BS5 8XX'])
        this.databasePath = path.join(__dirname, 'mp-database.js');
    }

    // Clean and format postcode
    cleanPostcode(postcode) {
        return postcode.toString().trim().toUpperCase().replace(/\s+/g, ' ');
    }

    // Extract postcode pattern (first part)
    getPostcodePattern(postcode) {
        const cleaned = this.cleanPostcode(postcode);
        const match = cleaned.match(/^[A-Z]{1,2}\d{1,2}/i);
        return match ? match[0].toUpperCase() : null;
    }    // Get MP information from Parliament API
    async getMPDetails(constituencyName) {
        try {
            // Search for constituency
            const searchUrl = `https://members-api.parliament.uk/api/Location/Constituency/Search`;
            const searchResponse = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                params: {
                    searchText: constituencyName,
                    skip: 0,
                    take: 1
                }
            });
            const searchData = await searchResponse.json();            console.log('Search response:', JSON.stringify(searchData, null, 2));
            
            if (!searchData.items || searchData.items.length === 0) {
                throw new Error(`No constituency found matching "${constituencyName}"`);
            }

            const constituencyMatch = searchData.items[0].value;
            if (!constituencyMatch.currentRepresentation?.member?.id) {
                throw new Error(`No current MP found for constituency "${constituencyName}"`);
            }

            const mpId = constituencyMatch.currentRepresentation.member.id;
            console.log(`Found MP ID: ${mpId} for constituency "${constituencyName}"`);

            // Additional logging
            console.log('Constituency details:', {
                id: constituencyMatch.id,
                name: constituencyMatch.name,
                mpId: mpId
            });

            // Get detailed MP information
            const mpUrl = `https://members-api.parliament.uk/api/Members/${mpId}`;
            const mpResponse = await fetch(mpUrl);
            const mpData = await mpResponse.json();

            if (!mpData.value) {
                throw new Error('Failed to get MP details');
            }

            const mp = mpData.value;

            // Get social media links
            const socialUrl = `https://members-api.parliament.uk/api/Members/${mpId}/SocialLinks`;
            const socialResponse = await fetch(socialUrl);
            const socialData = await socialResponse.json();

            // Format MP data
            return {
                name: mp.nameDisplayAs,
                party: mp.latestParty?.name || 'Unknown Party',
                email: mp.contactDetails?.find(c => c.type === "Email")?.value || 
                       `${mp.nameDisplayAs.toLowerCase().replace(/\\s+/g, '.')}@parliament.uk`,
                phone: mp.contactDetails?.find(c => c.type === "Phone")?.value || "020 7219 3000",
                website: mp.contactDetails?.find(c => c.type === "Website")?.value || 
                        `https://members.parliament.uk/member/${mp.id}`,
                address: mp.contactDetails?.find(c => c.type === "Address")?.value,
                twitter: socialData.items?.find(s => s.type === "Twitter")?.value || '',
                facebook: socialData.items?.find(s => s.type === "Facebook")?.value || '',
                instagram: socialData.items?.find(s => s.type === "Instagram")?.value || '',
                linkedin: socialData.items?.find(s => s.type === "LinkedIn")?.value || '',
                id: mp.id.toString(),
                constituencyId: mp.latestHouseMembership?.membershipFrom || '',
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting MP details:', error);
            return null;
        }
    }

    // Get constituency from postcode
    async getConstituencyFromPostcode(postcode) {
        try {
            const cleanPostcode = this.cleanPostcode(postcode);
            const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data.result?.parliamentary_constituency) {
                throw new Error('No constituency found for postcode');
            }

            return {
                constituency: data.result.parliamentary_constituency,
                postcodePattern: this.getPostcodePattern(cleanPostcode)
            };
        } catch (error) {
            console.error('Error getting constituency:', error);
            return null;
        }
    }

    // Update database with new MP information
    async updateDatabase(constituencyName, mpInfo, postcodePattern) {
        try {
            if (!constituencyName || !mpInfo) return false;

            // Normalize constituency name for consistent lookup
            const normalizedConstituency = constituencyName.toLowerCase()
                .replace(/\\s+/g, ' ')
                .replace(/ and /gi, ' & ')
                .trim();

            // Read current database content
            const currentContent = await fs.readFile(this.databasePath, 'utf8');
            
            // Parse the database object from the file content
            const databaseMatch = currentContent.match(/const MPDatabase = ({[^;]+});/);
            if (!databaseMatch) {
                throw new Error('Could not parse database content');
            }

            // Create updated database content
            const updatedContent = currentContent.replace(
                /const MPDatabase = ({[^;]+});/,
                `const MPDatabase = ${JSON.stringify({
                    ...MPDatabase,
                    [normalizedConstituency]: mpInfo
                }, null, 4)};`
            );

            // Write updated content back to file
            await fs.writeFile(this.databasePath, updatedContent, 'utf8');

            // Update postcode pattern mapping
            if (postcodePattern) {
                if (!this.postcodePatterns.has(postcodePattern)) {
                    this.postcodePatterns.set(postcodePattern, new Set());
                }
                this.postcodePatterns.get(postcodePattern).add(normalizedConstituency);
            }

            return true;
        } catch (error) {
            console.error('Error updating database:', error);
            return false;
        }
    }

    // Main function to handle new postcode lookup and database update
    async processPostcode(postcode) {
        try {
            console.log(`Processing postcode: ${postcode}`);
            
            // Get constituency information
            const constituencyInfo = await this.getConstituencyFromPostcode(postcode);
            if (!constituencyInfo) {
                throw new Error('Could not find constituency for postcode');
            }

            // Get MP details
            const mpInfo = await this.getMPDetails(constituencyInfo.constituency);
            if (!mpInfo) {
                throw new Error('Could not find MP information');
            }

            // Update database
            const updated = await this.updateDatabase(
                constituencyInfo.constituency,
                mpInfo,
                constituencyInfo.postcodePattern
            );

            if (!updated) {
                throw new Error('Failed to update database');
            }

            return {
                success: true,
                constituency: constituencyInfo.constituency,
                mp: mpInfo,
                postcodePattern: constituencyInfo.postcodePattern
            };
        } catch (error) {
            console.error('Error processing postcode:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get MP by postcode pattern (e.g., "BS5")
    async getMPByPattern(pattern) {
        const normalizedPattern = pattern.toUpperCase();
        const constituencies = this.postcodePatterns.get(normalizedPattern);
        
        if (!constituencies) {
            return {
                success: false,
                error: 'No MPs found for this postcode pattern'
            };
        }

        const results = [];
        for (const constituency of constituencies) {
            if (MPDatabase[constituency]) {
                results.push({
                    constituency,
                    mp: MPDatabase[constituency]
                });
            }
        }

        return {
            success: true,
            results
        };
    }
}

module.exports = new MPDatabaseUpdater();
