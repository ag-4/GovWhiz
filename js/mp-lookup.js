/**
 * GovWhiz - MP Lookup System
 * Handles MP search, postcode validation, and contact information display
 */
class MPLookupSystem {
    constructor() {
        this.cache = new Map();
        // UK Postcode regex pattern
        this.postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        
        // Comprehensive MP Database
        this.mpDatabase = {
            'SW1A': { 
                name: 'Rt Hon Sir Keir Starmer MP', 
                party: 'Labour', 
                constituency: 'Holborn and St Pancras', 
                email: 'keir.starmer.mp@parliament.uk', 
                phone: '020 7219 4000', 
                website: 'https://www.parliament.uk/biographies/commons/sir-keir-starmer/4514', 
                role: 'Prime Minister'
            },
            'SW1H': {
                name: 'Nickie Aiken MP',
                party: 'Conservative',
                constituency: 'Cities of London and Westminster',
                email: 'nickie.aiken.mp@parliament.uk',
                phone: '020 7219 4000', 
                website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656',
                role: 'Member of Parliament'
            },
            // More MPs from database...
        };
    }

    validatePostcode(postcode) {
        if (!postcode) return false;
        postcode = postcode.toString().replace(/\s/g, '').toUpperCase();
        return this.postcodeRegex.test(postcode);
    }    /**
     * Multi-strategy postcode lookup that tries several methods to find the correct MP
     */
    async findMP(postcode) {
        try {
            postcode = postcode.toString().replace(/\s/g, '').toUpperCase();
            
            if (!this.validatePostcode(postcode)) {
                throw new Error('Please enter a valid UK postcode');
            }

            // Call the Netlify serverless function endpoint
            const response = await fetch(`/.netlify/functions/app/api/mp?postcode=${encodeURIComponent(postcode)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch MP data');
            }
            const data = await response.json();
            
            if (!data.found) {
                throw new Error(data.error || 'Could not find MP for this postcode');
            }

            return data;
            
            // Check cache first
            if (this.cache.has(postcode)) {
                return this.cache.get(postcode);
            }

            // Strategy 1: Try the first part of the postcode (outward code)
            const outwardCode = postcode.match(/^[A-Z]{1,2}[0-9][A-Z0-9]?/i)[0];
            if (this.mpDatabase[outwardCode]) {
                const result = this.mpDatabase[outwardCode];
                this.cache.set(postcode, result);
                return result;
            }

            // Strategy 2: Try just the district (first 2-3 chars)
            const district = postcode.match(/^[A-Z]{1,2}[0-9]/i)[0];
            if (this.mpDatabase[district]) {
                const result = this.mpDatabase[district];
                this.cache.set(postcode, result);
                return result;
            }

            // If not in our database, try the Parliament API
            const constituencyResponse = await fetch(
                `https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${encodeURIComponent(postcode)}`
            );
            
            if (!constituencyResponse.ok) {
                throw new Error('Unable to find your constituency. Please try again later.');
            }

            const constituencyData = await constituencyResponse.json();
            if (!constituencyData.items?.length) {
                throw new Error('No constituency found for this postcode');
            }

            const constituency = constituencyData.items[0].value;
            
            // Get MP details from Parliament API
            const mpResponse = await fetch(
                `https://members-api.parliament.uk/api/Location/Constituency/${constituency.id}/Members`
            );
            
            if (!mpResponse.ok) {
                throw new Error('Unable to fetch MP information. Please try again later.');
            }

            const mpData = await mpResponse.json();
            if (!mpData.items?.length) {
                throw new Error('No current MP found for this constituency');
            }

            const mp = mpData.items[0].value;
            
            // Format the MP data consistently with our database format
            const mpInfo = {
                name: mp.nameDisplayAs,
                party: mp.latestParty.name,
                constituency: constituency.name,
                email: mp.contactDetails.find(c => c.type === 'Email')?.value || 
                       `${mp.nameDisplayAs.toLowerCase().replace(/ /g, '.')}@parliament.uk`,
                phone: mp.contactDetails.find(c => c.type === 'Phone')?.value || '020 7219 3000',
                website: `https://members.parliament.uk/member/${mp.id}`,
                role: mp.latestHouseMembership?.membershipFrom ? 'Member of Parliament' : undefined
            };

            // Cache the API result
            this.cache.set(postcode, mpInfo);
            return mpInfo;

        } catch (error) {
            throw new Error('Error finding MP: ' + error.message);
        }
    }    getEmailTemplate(templateType, mpName, constituency) {
        const templates = {
            'meeting': {
                subject: 'Meeting Request - Constituent from ' + constituency,
                body: `Dear ${mpName},\n\nI am a constituent in ${constituency} and would like to request a meeting to discuss an important matter affecting our community.\n\nPreferred meeting times:\n[Please specify your availability]\n\nThe matter I would like to discuss:\n[Brief description of the topic]\n\nContact details:\nName: [Your Name]\nAddress: [Your Full Address]\nPhone: [Your Phone Number]\n\nThank you for your time and consideration.\n\nKind regards,\n[Your Name]`
            },
            'support': {
                subject: 'Support for Legislative Bill - Constituent View',
                body: `Dear ${mpName},\n\nI am writing as your constituent in ${constituency} to express my strong support for [Bill Name].\n\nKey reasons for my support:\n1. [First reason]\n2. [Second reason]\n3. [Third reason]\n\nI believe this legislation will benefit our community by [expected benefits].\n\nI would appreciate knowing your position on this bill and whether you intend to support it.\n\nName: [Your Name]\nAddress: [Your Full Address]\n\nKind regards,\n[Your Name]`
            },
            'oppose': {
                subject: 'Concerns Regarding Proposed Legislation',
                body: `Dear ${mpName},\n\nI am writing as a concerned constituent from ${constituency} regarding [Bill Name].\n\nI have serious concerns about this legislation for the following reasons:\n1. [First concern]\n2. [Second concern]\n3. [Third concern]\n\nThe potential impact on our community could include:\n- [Impact 1]\n- [Impact 2]\n- [Impact 3]\n\nI would urge you to consider these points and represent these concerns in Parliament.\n\nName: [Your Name]\nAddress: [Your Full Address]\n\nKind regards,\n[Your Name]`
            },
            'question': {
                subject: 'Constituent Query - Policy Position',
                body: `Dear ${mpName},\n\nI'm writing as your constituent in ${constituency} to inquire about your position on [Issue/Policy].\n\nSpecifically, I would like to know:\n1. Your stance on this matter\n2. Any actions you have taken or plan to take\n3. How this aligns with our constituency's interests\n\nThis issue is important to me because [your reasons].\n\nName: [Your Name]\nAddress: [Your Full Address]\n\nKind regards,\n[Your Name]`
            },
            'local': {
                subject: 'Local Issue Requiring Attention',
                body: `Dear ${mpName},\n\nI am writing regarding an important local issue in ${constituency} that requires attention.\n\nThe issue:\n[Describe the local issue]\n\nLocation affected:\n[Specific location/area]\n\nImpact on the community:\n- [Impact 1]\n- [Impact 2]\n- [Impact 3]\n\nSuggested solutions:\n1. [Solution 1]\n2. [Solution 2]\n\nName: [Your Name]\nAddress: [Your Full Address]\nPhone: [Your Phone Number]\n\nKind regards,\n[Your Name]`
            }
        };
        
        const template = templates[templateType];
        return template ? template : {
            subject: 'Constituent Query',
            body: 'Template not found'
        };
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mpLookup = new MPLookupSystem();
});
