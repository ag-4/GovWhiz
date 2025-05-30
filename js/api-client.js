// Optimized API client with caching, retries, and error handling
class APIClient {
    constructor() {
        this.baseURL = '/.netlify/functions/app';
        this.cache = new Map();
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 5000
        };
    }

    async fetchWithRetry(url, options = {}, retryCount = 0) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (retryCount < this.retryConfig.maxRetries) {
                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(2, retryCount),
                    this.retryConfig.maxDelay
                );

                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchWithRetry(url, options, retryCount + 1);
            }
            throw error;
        }
    }

    getCacheKey(endpoint, params) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }

    async getCached(endpoint, params = {}, maxAge = 3600000) {
        const key = this.getCacheKey(endpoint, params);
        const cached = this.cache.get(key);

        if (cached && Date.now() - cached.timestamp < maxAge) {
            return cached.data;
        }

        const data = await this.fetchWithRetry(
            `${this.baseURL}${endpoint}?${new URLSearchParams(params)}`
        );

        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        return data;
    }

    async lookupMP(postcode) {
        return this.getCached('/api/mp', { postcode }, 3600000); // 1 hour cache
    }

    async getHealth() {
        return this.fetchWithRetry(`${this.baseURL}/api/health`);
    }

    async getConstituencies(query = '') {
        return this.getCached('/api/constituencies', { q: query }, 86400000); // 24 hour cache
    }

    clearCache() {
        this.cache.clear();
    }

    async prefetchCommonData() {
        try {
            // Prefetch common constituencies
            await this.getConstituencies();
            
            // Prefetch common postcodes
            const commonPostcodes = ['SW1A 1AA', 'M1 1AA', 'B1 1AA'];
            await Promise.all(
                commonPostcodes.map(postcode => this.lookupMP(postcode))
            );
        } catch (error) {
            console.error('Prefetch failed:', error);
        }
    }
}

// Initialize API client
const api = new APIClient();
