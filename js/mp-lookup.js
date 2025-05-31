/**
 * GovWhiz - MP Lookup System
 * Handles MP search, postcode validation, and contact information display
 */
class MPLookupSystem {
    constructor() {
        this.cache = new Map();
        this.postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        this.apiEndpoint = '/api/mp-lookup';
        this.postcodeApiEndpoint = 'https://api.postcodes.io/postcodes';
    }

    validatePostcode(postcode) {
        if (!postcode) return false;
        postcode = postcode.toString().replace(/\s/g, '').toUpperCase();
        return this.postcodeRegex.test(postcode);
    }

    /**
     * Multi-strategy postcode lookup with enhanced API integration
     */
    async findMP(postcode) {
        try {
            // Clean and validate postcode
            postcode = postcode.toString().replace(/\s+/g, ' ').trim().toUpperCase();
            if (!this.validatePostcode(postcode)) {
                throw new Error('Please enter a valid UK postcode');
            }

            // Check cache first with expiration
            if (this.cache.has(postcode)) {
                const cachedResult = this.cache.get(postcode);
                if (cachedResult.timestamp && Date.now() - cachedResult.timestamp < 3600000) { // 1 hour cache
                    return cachedResult.data;
                }
                this.cache.delete(postcode); // Clear expired cache
            }

            // First, validate and get constituency using PostcodesIO
            const constituencyData = await this.getConstituencyFromPostcode(postcode);
            if (!constituencyData.success) {
                throw new Error(constituencyData.error || 'Invalid postcode');
            }

            // Then get MP data using constituency
            const mpData = await this.findMPByConstituency(constituencyData.constituency);
            
            const result = {
                found: true,
                mp: mpData,
                constituency: constituencyData.constituency,
                source: 'api'
            };

            // Cache the result
            this.cache.set(postcode, {
                data: result,
                timestamp: Date.now()
            });

            return result;
        } catch (error) {
            console.error('MP lookup error:', error);
            return {
                found: false,
                error: error.message || 'Could not find MP',
                postcode
            };
        }
    }

    /**
     * Get constituency information from postcode using PostcodesIO API
     */
    async getConstituencyFromPostcode(postcode) {
        try {
            const response = await fetch(`${this.postcodeApiEndpoint}/${encodeURIComponent(postcode)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Postcode lookup failed');
            }

            if (!data.result || !data.result.parliamentary_constituency) {
                throw new Error('No constituency found for this postcode');
            }

            return {
                success: true,
                constituency: data.result.parliamentary_constituency,
                location: {
                    lat: data.result.latitude,
                    lon: data.result.longitude
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Postcode lookup failed'
            };
        }
    }

    /**
     * Find MP information by constituency using TheyWorkForYou API via our backend
     */
    async findMPByConstituency(constituency) {
        try {
            const response = await fetch(`${this.apiEndpoint}/constituency/${encodeURIComponent(constituency)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'MP lookup failed');
            }

            if (!data.mp) {
                throw new Error('No MP found for this constituency');
            }

            return {
                name: data.mp.full_name,
                party: data.mp.party,
                constituency: constituency,
                email: data.mp.email,
                phone: data.mp.phone || '',
                website: data.mp.website || '',
                twitter: data.mp.twitter || '',
                role: data.mp.current_role || 'Member of Parliament',
                image: data.mp.image_url || ''
            };
        } catch (error) {
            throw new Error(`Could not find MP information: ${error.message}`);
        }
    }

    // Email template generator
    getEmailTemplate(type, mpName, constituency) {
        const templates = {
            support: `Dear ${mpName},\n\nAs your constituent in ${constituency}, I am writing to express my support for [Bill Name]. I believe this legislation is important because [Your Reasons].\n\nI would appreciate knowing your position on this matter and whether you plan to support it in Parliament.\n\nYours sincerely,\n[Your Name]\n[Your Address]`,
            oppose: `Dear ${mpName},\n\nAs your constituent in ${constituency}, I am writing to express my concerns about [Bill Name]. I believe this legislation could have negative impacts because [Your Reasons].\n\nI would appreciate knowing your position on this matter and how you plan to vote.\n\nYours sincerely,\n[Your Name]\n[Your Address]`,
            meeting: `Dear ${mpName},\n\nI am a constituent in ${constituency} and would like to request a meeting to discuss [Topic]. This matter is important to me because [Your Reasons].\n\nI am available [Suggest Times] and would appreciate the opportunity to speak with you.\n\nYours sincerely,\n[Your Name]\n[Your Address]`,
            question: `Dear ${mpName},\n\nAs your constituent in ${constituency}, I would like to know your position on [Issue/Topic]. This matter is important to me because [Your Reasons].\n\nI look forward to hearing your thoughts on this issue.\n\nYours sincerely,\n[Your Name]\n[Your Address]`
        };
        return templates[type] || templates.question;
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mpLookup = new MPLookupSystem();
});
