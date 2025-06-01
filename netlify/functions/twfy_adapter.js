const axios = require('axios');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('axios-rate-limit');

class TheyWorkForYouAdapter {
    constructor(apiKey, cacheDir = '.cache') {
        this.apiKey = apiKey || 'AbcDefGhiJklMnoPqrStuVwxYz'; // Default test key
        this.baseUrl = 'https://www.theyworkforyou.com/api';
        this.cacheDir = cacheDir;
        this.cacheDuration = 3600000; // 1 hour in milliseconds
        
        // Set up rate-limited axios instance
        this.http = rateLimit(axios.create({
            headers: {
                'User-Agent': 'GovWhiz/1.0 (Civic Engagement Platform)'
            }
        }), { maxRequests: 1, perMilliseconds: 1000 }); // 1 request per second
    }

    async _getCachePath(key) {
        return path.join(this.cacheDir, `${key}.json`);
    }

    async _getFromCache(key) {
        try {
            const cachePath = await this._getCachePath(key);
            const data = await fs.readFile(cachePath, 'utf8');
            const cached = JSON.parse(data);
            
            if (Date.now() - new Date(cached.timestamp) < this.cacheDuration) {
                return cached.data;
            }
        } catch (error) {
            console.warn(`Cache read error for ${key}:`, error.message);
        }
        return null;
    }

    async _saveToCache(key, data) {
        try {
            const cachePath = await this._getCachePath(key);
            await fs.mkdir(path.dirname(cachePath), { recursive: true });
            await fs.writeFile(cachePath, JSON.stringify({
                timestamp: new Date().toISOString(),
                data
            }));
        } catch (error) {
            console.warn(`Cache write error for ${key}:`, error.message);
        }
    }

    async _makeRequest(endpoint, params) {
        const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
        
        // Try cache first
        const cached = await this._getFromCache(cacheKey);
        if (cached) return cached;

        // Add API key and output format
        params = {
            ...params,
            key: this.apiKey,
            output: 'js'
        };

        // Make request with retries
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const response = await this.http.get(`${this.baseUrl}/${endpoint}`, { params });
                const data = response.data;

                if (data.error) {
                    console.warn(`TheyWorkForYou API error for ${endpoint}:`, data.error);
                    if (data.error.toLowerCase().includes('exceeded')) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                        continue;
                    }
                    throw new Error(data.error);
                }

                const cleanData = this._validateData(data);
                await this._saveToCache(cacheKey, cleanData);
                return cleanData;

            } catch (error) {
                if (attempt < 2) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    continue;
                }
                console.error(`Error fetching data from TheyWorkForYou for ${endpoint}:`, error);
                throw error;
            }
        }

        return {};
    }

    _validateData(data) {
        if (typeof data === 'object' && data !== null) {
            if (Array.isArray(data)) {
                return data.filter(item => item !== null).map(item => this._validateData(item));
            }
            return Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== null)
            );
        }
        return data;
    }

    _cleanPostcode(postcode) {
        return postcode.replace(/\s+/g, '').toUpperCase();
    }

    _extractTwitter(twitter) {
        if (!twitter) return '';
        const match = twitter.match(/(?:@)?(\w+)\/?$/);
        return match ? `@${match[1]}` : twitter;
    }

    _extractFacebook(facebook) {
        if (!facebook) return '';
        if (!facebook.startsWith('http')) {
            return `https://www.facebook.com/${facebook}`;
        }
        return facebook;
    }

    async getAllMps() {
        try {
            let mps = await this._makeRequest('getMPs', { date: 'now' });
            
            if (!mps || !mps.length) {
                mps = await this._makeRequest('getPerson', { id: '0' });
                mps = mps.filter(mp => mp?.current_member?.house === 1);
            }
            
            return mps;
        } catch (error) {
            console.error('Error fetching MPs from TheyWorkForYou:', error);
            return [];
        }
    }

    async getMpDetails(personId) {
        try {
            const mpData = await this._makeRequest('getPerson', { id: personId });
            if (!mpData) return null;

            const votesData = await this._makeRequest('getMP', { id: personId });
            
            return {
                source: 'theyworkforyou',
                person_id: personId,
                name: mpData.full_name,
                party: mpData.party,
                constituency: mpData.constituency,
                email: mpData.email,
                website: mpData.website,
                twitter: this._extractTwitter(mpData.twitter_username),
                facebook: this._extractFacebook(mpData.facebook_page),
                voting_record: votesData?.voting_record || {},
                speeches: votesData?.speeches || 0,
                expenses: votesData?.expenses || {},
                last_updated: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error fetching MP details from TheyWorkForYou for ${personId}:`, error);
            return null;
        }
    }

    async getMpByPostcode(postcode) {
        try {
            const data = await this._makeRequest('getMP', { 
                postcode: this._cleanPostcode(postcode) 
            });
            
            if (!data || data.error) return null;
            
            return this.getMpDetails(data.person_id);
        } catch (error) {
            console.error(`Error fetching MP by postcode from TheyWorkForYou for ${postcode}:`, error);
            return null;
        }
    }
}

module.exports = TheyWorkForYouAdapter;
