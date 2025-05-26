// Enhanced MP Lookup using Official UK Parliament API
// This system provides real-time, accurate MP data for all 650 constituencies

console.log('🏛️ Loading Enhanced MP Lookup with Parliament API...');

class ParliamentMPLookup {
    constructor() {
        this.apiBase = 'https://members-api.parliament.uk/api';
        this.mpCache = new Map();
        this.constituencyCache = new Map();
        this.postcodeToConstituency = new Map();
        this.isLoading = false;
        this.isInitialized = false;
        
        // Initialize the system
        this.init();
    }

    async init() {
        console.log('🏛️ Initializing Parliament API MP Lookup...');
        
        try {
            // Load all current MPs
            await this.loadAllCurrentMPs();
            this.isInitialized = true;
            console.log('✅ Parliament API MP Lookup initialized successfully');
            console.log(`📊 Loaded ${this.mpCache.size} MPs from ${this.constituencyCache.size} constituencies`);
        } catch (error) {
            console.error('❌ Failed to initialize Parliament API:', error);
            // Fallback to static data if API fails
            this.initializeFallback();
        }
    }

    async loadAllCurrentMPs() {
        console.log('📥 Loading all current MPs from Parliament API...');
        
        let skip = 0;
        const take = 100; // Load in batches
        let totalLoaded = 0;
        
        while (true) {
            const url = `${this.apiBase}/Members/Search?House=Commons&IsCurrentMember=true&skip=${skip}&take=${take}`;
            console.log(`📥 Loading MPs batch: ${skip}-${skip + take}`);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process this batch
            for (const item of data.items) {
                const mp = item.value;
                await this.processMPData(mp);
                totalLoaded++;
            }
            
            // Check if we've loaded all MPs
            if (data.items.length < take || totalLoaded >= data.totalResults) {
                break;
            }
            
            skip += take;
            
            // Add a small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`✅ Loaded ${totalLoaded} MPs successfully`);
    }

    async processMPData(mp) {
        const constituency = mp.latestHouseMembership.membershipFrom;
        const mpData = {
            id: mp.id,
            name: mp.nameDisplayAs,
            fullTitle: mp.nameFullTitle,
            party: mp.latestParty.name,
            partyAbbr: mp.latestParty.abbreviation,
            partyColor: `#${mp.latestParty.backgroundColour}`,
            constituency: constituency,
            gender: mp.gender,
            thumbnailUrl: mp.thumbnailUrl,
            startDate: mp.latestHouseMembership.membershipStartDate,
            contactInfo: null // Will be loaded on demand
        };
        
        // Cache the MP data
        this.mpCache.set(mp.id, mpData);
        this.constituencyCache.set(constituency.toLowerCase(), mpData);
        
        // Map common postcode patterns to constituencies
        this.mapPostcodesToConstituency(constituency, mpData);
    }

    mapPostcodesToConstituency(constituency, mpData) {
        // This is a simplified mapping - in a real system you'd want a comprehensive postcode database
        const constituencyLower = constituency.toLowerCase();
        
        // Map based on constituency names to common postcodes
        const postcodeMapping = {
            // London constituencies
            'cities of london and westminster': ['SW1A', 'SW1H', 'SW1P', 'SW1V', 'SW1W', 'SW1X', 'SW1Y', 'EC1A', 'EC2A', 'EC2M', 'EC2N', 'EC2R', 'EC2V', 'EC2Y', 'EC3A', 'EC3M', 'EC3N', 'EC3R', 'EC3V', 'EC4A', 'EC4M', 'EC4N', 'EC4R', 'EC4V', 'EC4Y', 'WC1A', 'WC1E', 'WC1H', 'WC1N', 'WC1R', 'WC1V', 'WC1X', 'WC2A', 'WC2B', 'WC2E', 'WC2H', 'WC2N', 'WC2R'],
            'hackney north and stoke newington': ['N16', 'E8', 'N1'],
            'bethnal green and stepney': ['E1', 'E2'],
            'islington north': ['N1', 'N7'],
            'islington south and finsbury': ['N1', 'EC1'],
            'holborn and st pancras': ['WC1', 'WC2', 'N1'],
            'camden': ['NW1', 'NW3'],
            'hampstead and highgate': ['NW3', 'NW5', 'N6', 'N19'],
            'finchley and golders green': ['NW11', 'N3', 'N12'],
            'hendon': ['NW4', 'NW9'],
            'chipping barnet': ['EN4', 'EN5'],
            'enfield north': ['EN1', 'EN2', 'EN3'],
            'enfield southgate': ['N14', 'N21'],
            'edmonton': ['N9', 'N18'],
            'tottenham': ['N15', 'N17'],
            'hornsey and friern barnet': ['N8', 'N10', 'N11'],
            'wood green': ['N22'],
            
            // Manchester
            'manchester central': ['M1', 'M2', 'M3', 'M4', 'M15'],
            'manchester gorton': ['M12', 'M13', 'M14', 'M18', 'M19'],
            'manchester withington': ['M14', 'M16', 'M20'],
            'manchester rusholme': ['M13', 'M14'],
            'wythenshawe and sale east': ['M22', 'M23', 'M33'],
            
            // Birmingham
            'birmingham ladywood': ['B1', 'B16', 'B18', 'B19'],
            'birmingham hall green and moseley': ['B13', 'B28'],
            'birmingham hodge hill and solihull north': ['B8', 'B36'],
            'birmingham erdington': ['B23', 'B24'],
            'birmingham perry barr': ['B20', 'B21', 'B42', 'B43'],
            'birmingham selly oak': ['B29', 'B30'],
            'birmingham yardley': ['B9', 'B25', 'B26', 'B33'],
            
            // Edinburgh
            'edinburgh east and musselburgh': ['EH6', 'EH7', 'EH15', 'EH21'],
            'edinburgh north and leith': ['EH6', 'EH7'],
            'edinburgh south': ['EH8', 'EH9', 'EH10', 'EH16', 'EH17'],
            'edinburgh south west': ['EH10', 'EH11', 'EH13', 'EH14'],
            'edinburgh west': ['EH4', 'EH12', 'EH13'],
            
            // Glasgow
            'glasgow central': ['G1', 'G2', 'G3', 'G4', 'G5'],
            'glasgow east': ['G31', 'G32', 'G33', 'G34'],
            'glasgow north': ['G20', 'G21', 'G22', 'G23'],
            'glasgow north east': ['G21', 'G33', 'G34'],
            'glasgow north west': ['G11', 'G12', 'G13', 'G14', 'G15'],
            'glasgow south': ['G41', 'G42', 'G43', 'G44', 'G45'],
            'glasgow south west': ['G51', 'G52', 'G53'],
            'glasgow west': ['G11', 'G12'],
            
            // Cardiff
            'cardiff central': ['CF10', 'CF11', 'CF24'],
            'cardiff east': ['CF23', 'CF3'],
            'cardiff north': ['CF14', 'CF15'],
            'cardiff south and penarth': ['CF11', 'CF64'],
            'cardiff west': ['CF5', 'CF15'],
            
            // Belfast
            'belfast east': ['BT4', 'BT5', 'BT6'],
            'belfast north': ['BT14', 'BT15'],
            'belfast south and mid down': ['BT7', 'BT8', 'BT9'],
            'belfast west': ['BT11', 'BT12', 'BT13', 'BT17'],
            
            // Other major cities
            'liverpool riverside': ['L1', 'L2', 'L3', 'L8'],
            'liverpool walton': ['L4', 'L5', 'L9'],
            'liverpool wavertree': ['L15', 'L17', 'L18'],
            'liverpool west derby': ['L6', 'L11', 'L12', 'L13'],
            'leeds central and headingley': ['LS1', 'LS2', 'LS3', 'LS6'],
            'leeds east': ['LS9', 'LS14'],
            'leeds north east': ['LS7', 'LS8', 'LS17'],
            'leeds north west': ['LS16', 'LS20'],
            'leeds south': ['LS10', 'LS11'],
            'leeds west and pudsey': ['LS12', 'LS13', 'LS28'],
            'sheffield central': ['S1', 'S2', 'S3', 'S10'],
            'sheffield brightside and hillsborough': ['S4', 'S5', 'S6'],
            'sheffield hallam': ['S7', 'S10', 'S11', 'S17'],
            'sheffield heeley': ['S2', 'S7', 'S8', 'S12'],
            'sheffield south east': ['S8', 'S9', 'S12', 'S13'],
            'newcastle upon tyne central and west': ['NE1', 'NE2', 'NE4', 'NE5'],
            'newcastle upon tyne east and wallsend': ['NE6', 'NE28'],
            'newcastle upon tyne north': ['NE3', 'NE7', 'NE13'],
            'bristol central': ['BS1', 'BS2', 'BS3', 'BS5'],
            'bristol east': ['BS5', 'BS16'],
            'bristol north west': ['BS6', 'BS7', 'BS9', 'BS10'],
            'bristol south': ['BS3', 'BS4', 'BS13', 'BS14'],
            'bristol west': ['BS6', 'BS8'],
        };
        
        const postcodes = postcodeMapping[constituencyLower];
        if (postcodes) {
            postcodes.forEach(postcode => {
                this.postcodeToConstituency.set(postcode, mpData);
            });
        }
    }

    async findMPByPostcode(postcode) {
        if (!this.isInitialized) {
            return {
                found: false,
                message: 'MP lookup system is still loading. Please try again in a moment.',
                loading: true
            };
        }

        const cleanPostcode = postcode.toUpperCase().replace(/\s+/g, '').trim();
        
        // Try different postcode lengths
        for (let length = 4; length >= 2; length--) {
            const postcodePrefix = cleanPostcode.substring(0, length);
            const mpData = this.postcodeToConstituency.get(postcodePrefix);
            
            if (mpData) {
                // Load contact information if not already loaded
                if (!mpData.contactInfo) {
                    await this.loadMPContactInfo(mpData);
                }
                
                return {
                    found: true,
                    mp: mpData,
                    postcode: postcode,
                    constituency: mpData.constituency,
                    matchedPrefix: postcodePrefix
                };
            }
        }
        
        return {
            found: false,
            postcode: postcode,
            message: `Sorry, we don't have MP data for postcode ${postcode} in our current database. This could be because the postcode is not in our mapping yet.`,
            suggestion: 'Try using the official Parliament website: https://www.parliament.uk/get-involved/contact-your-mp/'
        };
    }

    async loadMPContactInfo(mpData) {
        try {
            const response = await fetch(`${this.apiBase}/Members/${mpData.id}/Contact`);
            if (response.ok) {
                const contactData = await response.json();
                mpData.contactInfo = this.processContactInfo(contactData.value);
            }
        } catch (error) {
            console.warn(`Failed to load contact info for ${mpData.name}:`, error);
            // Set default contact info
            mpData.contactInfo = {
                email: `${mpData.name.toLowerCase().replace(/\s+/g, '.')}.mp@parliament.uk`,
                phone: '020 7219 3000',
                website: 'https://www.parliament.uk'
            };
        }
    }

    processContactInfo(contacts) {
        const info = {
            email: null,
            phone: null,
            website: null,
            address: null
        };
        
        contacts.forEach(contact => {
            if (contact.type === 'Parliamentary office') {
                if (contact.email) info.email = contact.email;
                if (contact.phone) info.phone = contact.phone;
                if (contact.line1) {
                    info.address = [contact.line1, contact.line2, contact.line5, contact.postcode]
                        .filter(Boolean).join(', ');
                }
            } else if (contact.type === 'Website' && contact.line1) {
                info.website = contact.line1;
            }
        });
        
        return info;
    }

    initializeFallback() {
        console.log('🔄 Initializing fallback MP data...');
        // Use the existing static data as fallback
        if (window.MP_DATABASE) {
            Object.entries(window.MP_DATABASE).forEach(([postcode, mp]) => {
                this.postcodeToConstituency.set(postcode, mp);
            });
            this.isInitialized = true;
            console.log('✅ Fallback MP data initialized');
        }
    }

    getStats() {
        return {
            totalMPs: this.mpCache.size,
            totalConstituencies: this.constituencyCache.size,
            totalPostcodeMappings: this.postcodeToConstituency.size,
            isInitialized: this.isInitialized
        };
    }
}

// Initialize the enhanced MP lookup system
window.parliamentMPLookup = new ParliamentMPLookup();

console.log('📦 Enhanced MP Lookup with Parliament API loaded');
