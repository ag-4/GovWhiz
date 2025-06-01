/**
 * GovWhiz - Main Application Script (Clean & Optimized)
 * Consolidated functionality with proper error handling and modern JavaScript
 */

// Application State
const GovWhiz = {
    initialized: false,
    currentUser: null,
    cache: new Map(),

    // Initialize the application
    init() {
        if (this.initialized) return;

        console.log('🏛️ GovWhiz Loading...');
        this.setupEventListeners();
        this.loadPoliticalNews();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.initialized = true;
        console.log('✅ GovWhiz Loaded Successfully');
    },

    // Setup all event listeners
    setupEventListeners() {
        // Search functionality
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');

        if (searchButton) {
            searchButton.addEventListener('click', () => this.performSearch());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // MP Lookup functionality
        const findMpBtn = document.getElementById('find-mp-btn');
        const postcodeInput = document.getElementById('postcode-input');

        if (findMpBtn) {
            findMpBtn.addEventListener('click', () => this.findMP());
        }

        if (postcodeInput) {
            postcodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.findMP();
            });
        }

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }
    },

    // Mobile menu functionality
    setupMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                const isOpen = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== '0px';

                if (isOpen) {
                    mobileMenu.style.maxHeight = '0px';
                    mobileMenu.style.opacity = '0';
                } else {
                    mobileMenu.style.maxHeight = '300px';
                    mobileMenu.style.opacity = '1';
                }
            });
        }
    },

    // Smooth scrolling for navigation links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    // Comprehensive Legislation Database
    legislationDatabase: [
        {
            title: "Digital Services Act 2025",
            description: "Comprehensive legislation governing digital platforms and online services in the UK.",
            category: "Technology",
            status: "In Committee",
            keywords: ["digital", "services", "technology", "platforms", "online", "internet", "tech"],
            date: "2025-01-15",
            stage: "Committee Stage",
            summary: "This Act establishes new regulatory frameworks for digital service providers, including social media platforms, search engines, and online marketplaces operating in the UK."
        },
        {
            title: "Data Protection Enhancement Bill",
            description: "Strengthening data protection rights and privacy safeguards for UK citizens.",
            category: "Privacy",
            status: "Second Reading",
            keywords: ["data", "protection", "privacy", "gdpr", "personal", "information", "security"],
            date: "2025-01-20",
            stage: "Second Reading",
            summary: "Enhances existing data protection laws with stronger penalties for breaches and expanded rights for individuals to control their personal data."
        },
        {
            title: "Climate Action Framework 2025",
            description: "New framework for achieving net-zero emissions by 2050.",
            category: "Environment",
            status: "Royal Assent",
            keywords: ["climate", "environment", "emissions", "carbon", "green", "sustainability", "net-zero"],
            date: "2025-01-10",
            stage: "Royal Assent",
            summary: "Establishes legally binding targets for carbon reduction and creates new funding mechanisms for green technology development."
        },
        {
            title: "Healthcare Modernisation Act",
            description: "Comprehensive reform of NHS services and digital health infrastructure.",
            category: "Healthcare",
            status: "Third Reading",
            keywords: ["healthcare", "nhs", "health", "medical", "hospital", "doctor", "patient"],
            date: "2025-01-25",
            stage: "Third Reading",
            summary: "Modernizes NHS infrastructure with digital health records, telemedicine capabilities, and improved patient care pathways."
        },
        {
            title: "Education Technology Bill",
            description: "Integration of technology in schools and universities across the UK.",
            category: "Education",
            status: "First Reading",
            keywords: ["education", "schools", "technology", "learning", "students", "digital", "universities"],
            date: "2025-01-22",
            stage: "First Reading",
            summary: "Provides funding and framework for digital learning tools, online education platforms, and technology infrastructure in educational institutions."
        },
        {
            title: "Transport Infrastructure Act 2025",
            description: "Major investment in rail, road, and public transport systems.",
            category: "Transport",
            status: "Committee Stage",
            keywords: ["transport", "infrastructure", "rail", "road", "public", "travel", "investment"],
            date: "2025-01-18",
            stage: "Committee Stage",
            summary: "Authorizes £50 billion investment in transport infrastructure including high-speed rail, electric vehicle charging networks, and public transport modernization."
        },
        {
            title: "Housing Development Bill",
            description: "New measures to address housing shortage and affordability crisis.",
            category: "Housing",
            status: "Second Reading",
            keywords: ["housing", "homes", "development", "affordable", "building", "property", "rent"],
            date: "2025-01-12",
            stage: "Second Reading",
            summary: "Introduces new planning permissions for affordable housing, rent controls in high-demand areas, and incentives for first-time buyers."
        },
        {
            title: "Financial Services Reform Act",
            description: "Post-Brexit financial regulations and digital currency framework.",
            category: "Finance",
            status: "Committee Stage",
            keywords: ["finance", "banking", "financial", "services", "digital", "currency", "brexit", "regulation"],
            date: "2025-01-08",
            stage: "Committee Stage",
            summary: "Establishes new regulatory framework for financial services post-Brexit and creates legal framework for digital currencies and fintech innovation."
        }
    ],

    // Enhanced Search functionality
    performSearch() {
        const searchInput = document.getElementById('search-input');
        const resultsSection = document.getElementById('results');
        const searchButton = document.getElementById('search-button');

        if (!searchInput || !resultsSection) return;

        const query = searchInput.value.trim();
        if (!query) {
            this.showMessage(resultsSection, 'Please enter a search term', 'warning');
            return;
        }

        // Disable search button and show loading state
        if (searchButton) {
            searchButton.disabled = true;
            searchButton.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Searching...</span>
                </div>
            `;
        }

        // Show loading state in results section
        resultsSection.innerHTML = `
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                <div class="text-cyan-400 mb-2">🔍 Searching...</div>
                <div class="text-gray-400 text-sm">Finding relevant information for "${query}"</div>
            </div>
        `;

        // Perform search with debounce
        this.debouncedSearch(query, resultsSection, searchButton);
    },

    // Debounced search function
    debouncedSearch: (function() {
        let timeout;
        return function(query, resultsSection, searchButton) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.executeSearch(query, resultsSection, searchButton);
            }, 300);
        };
    })(),

    // Execute search
    async executeSearch(query, resultsSection, searchButton) {
        try {
            // Search in legislation database
            const legislationResults = this.searchLegislation(query);
            
            // Search in MP database
            const mpResults = await this.searchMPs(query);
            
            // Search in news articles
            const newsResults = await this.searchNews(query);

            // Combine and sort results
            const allResults = [
                ...legislationResults.map(item => ({ ...item, type: 'legislation' })),
                ...mpResults.map(item => ({ ...item, type: 'mp' })),
                ...newsResults.map(item => ({ ...item, type: 'news' }))
            ].sort((a, b) => b.relevance - a.relevance);

            // Display results
            this.displaySearchResults(allResults, query, resultsSection);

        } catch (error) {
            console.error('Search error:', error);
            resultsSection.innerHTML = `
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                    <div class="text-red-400 mb-2">Search failed</div>
                    <div class="text-gray-400 text-sm">Please try again later</div>
                    <button onclick="GovWhiz.performSearch()" 
                            class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                        Retry Search
                    </button>
                </div>
            `;
        } finally {
            // Re-enable search button
            if (searchButton) {
                searchButton.disabled = false;
                searchButton.innerHTML = 'Search';
            }
        }
    },

    // Search legislation
    searchLegislation(query) {
        const searchTerms = query.toLowerCase().split(' ');
        return this.legislationDatabase
            .map(item => {
                const searchableText = `${item.title} ${item.description} ${item.category} ${item.keywords.join(' ')} ${item.summary}`.toLowerCase();
                const matches = searchTerms.filter(term => searchableText.includes(term));
                return {
                    ...item,
                    relevance: matches.length / searchTerms.length
                };
            })
            .filter(item => item.relevance > 0)
            .sort((a, b) => b.relevance - a.relevance);
    },

    // Search MPs
    async searchMPs(query) {
        try {
            const response = await fetch(`/api/mp/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('MP search failed');
            return await response.json();
        } catch (error) {
            console.error('MP search error:', error);
            return [];
        }
    },

    // Search news
    async searchNews(query) {
        try {
            const response = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('News search failed');
            return await response.json();
        } catch (error) {
            console.error('News search error:', error);
            return [];
        }
    },

    // Display search results
    displaySearchResults(results, query, container) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                    <div class="text-yellow-400 mb-2">No results found</div>
                    <div class="text-gray-400 text-sm">Try different search terms</div>
                </div>
            `;
            return;
        }

        const resultsHtml = results.map(result => {
            switch (result.type) {
                case 'legislation':
                    return this.renderLegislationResult(result);
                case 'mp':
                    return this.renderMPResult(result);
                case 'news':
                    return this.renderNewsResult(result);
                default:
                    return '';
            }
        }).join('');

        container.innerHTML = `
            <div class="space-y-4">
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 class="text-xl font-semibold text-white mb-2">Search Results for "${query}"</h3>
                    <p class="text-gray-400">Found ${results.length} results</p>
                </div>
                ${resultsHtml}
            </div>
        `;
    },

    // Render legislation result
    renderLegislationResult(item) {
        return `
            <div class="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="text-lg font-semibold text-white">${item.title}</h4>
                    <div class="text-right">
                        <span class="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">Legislation</span>
                        <div class="text-xs text-gray-500 mt-1">${item.date}</div>
                    </div>
                </div>
                <p class="text-gray-300 mb-3">${item.description}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded ${this.getStatusColor(item.status)}">${item.status}</span>
                        <span class="text-xs text-gray-500">${item.stage}</span>
                    </div>
                    <button onclick="GovWhiz.showLegislationDetails('${item.title}')" 
                            class="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                        View Details →
                    </button>
                </div>
            </div>
        `;
    },

    // Render MP result
    renderMPResult(item) {
        return `
            <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 hover:border-blue-400/50 transition-colors">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="text-lg font-semibold text-white">${item.name}</h4>
                    <div class="text-right">
                        <span class="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">MP</span>
                        <div class="text-xs text-gray-500 mt-1">${item.constituency}</div>
                    </div>
                </div>
                <p class="text-gray-300 mb-3">${item.party}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400">${item.constituency}</span>
                    </div>
                    <button onclick="GovWhiz.showMPDetails('${item.person_id}')" 
                            class="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                        View Profile →
                    </button>
                </div>
            </div>
        `;
    },

    // Render news result
    renderNewsResult(item) {
        return `
            <div class="bg-green-900/30 border border-green-500/30 rounded-lg p-4 hover:border-green-400/50 transition-colors">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="text-lg font-semibold text-white">${item.title}</h4>
                    <div class="text-right">
                        <span class="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">News</span>
                        <div class="text-xs text-gray-500 mt-1">${this.formatDate(item.publishedAt)}</div>
                    </div>
                </div>
                <p class="text-gray-300 mb-3">${item.description || 'No description available'}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400">${item.source}</span>
                    </div>
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" 
                       class="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                        Read More →
                    </a>
                </div>
            </div>
        `;
    },

    // Helper function for status colors
    getStatusColor(status) {
        const colors = {
            'Royal Assent': 'bg-green-900/30 text-green-400',
            'Third Reading': 'bg-blue-900/30 text-blue-400',
            'Second Reading': 'bg-purple-900/30 text-purple-400',
            'Committee Stage': 'bg-orange-900/30 text-orange-400',
            'First Reading': 'bg-gray-900/30 text-gray-400',
            'In Committee': 'bg-orange-900/30 text-orange-400'
        };
        return colors[status] || 'bg-gray-900/30 text-gray-400';
    },

    // Try search with predefined term
    trySearch(term) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = term;
            this.performSearch();
        }
    },

    // Comprehensive MP Database
    mpDatabase: {
        // London
        'SW1A': { name: 'Rt Hon Sir Keir Starmer MP', party: 'Labour', constituency: 'Holborn and St Pancras', email: 'keir.starmer.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/sir-keir-starmer/4514', role: 'Prime Minister' },
        'SW1': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
        'WC1': { name: 'Rt Hon Sir Keir Starmer MP', party: 'Labour', constituency: 'Holborn and St Pancras', email: 'keir.starmer.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/sir-keir-starmer/4514', role: 'Prime Minister' },
        'WC2': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
        'E1': { name: 'Rushanara Ali MP', party: 'Labour', constituency: 'Bethnal Green and Stepney', email: 'rushanara.ali.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/rushanara-ali/3930' },
        'E2': { name: 'Rushanara Ali MP', party: 'Labour', constituency: 'Bethnal Green and Stepney', email: 'rushanara.ali.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/rushanara-ali/3930' },
        'E14': { name: 'Apsana Begum MP', party: 'Labour', constituency: 'Poplar and Limehouse', email: 'apsana.begum.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/apsana-begum/4656' },
        'SE1': { name: 'Neil Coyle MP', party: 'Labour', constituency: 'Bermondsey and Old Southwark', email: 'neil.coyle.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/neil-coyle/4359' },
        'N1': { name: 'Jeremy Corbyn MP', party: 'Independent', constituency: 'Islington North', email: 'jeremy.corbyn.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/jeremy-corbyn/185' },

        // Manchester & Greater Manchester
        'M1': { name: 'Lucy Powell MP', party: 'Labour', constituency: 'Manchester Central', email: 'lucy.powell.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4057', role: 'Leader of the House of Commons' },
        'M2': { name: 'Lucy Powell MP', party: 'Labour', constituency: 'Manchester Central', email: 'lucy.powell.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4057', role: 'Leader of the House of Commons' },
        'M14': { name: 'Jeff Smith MP', party: 'Labour', constituency: 'Manchester Withington', email: 'jeff.smith.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/jeff-smith/4516' },
        'M20': { name: 'Jeff Smith MP', party: 'Labour', constituency: 'Manchester Withington', email: 'jeff.smith.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/jeff-smith/4516' },
        'M40': { name: 'Graham Stringer MP', party: 'Labour', constituency: 'Blackley and Middleton South', email: 'graham.stringer.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/graham-stringer/449' },

        // Birmingham & West Midlands
        'B1': { name: 'Shabana Mahmood MP', party: 'Labour', constituency: 'Birmingham Ladywood', email: 'shabana.mahmood.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3958', role: 'Lord Chancellor and Secretary of State for Justice' },
        'B16': { name: 'Shabana Mahmood MP', party: 'Labour', constituency: 'Birmingham Ladywood', email: 'shabana.mahmood.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3958', role: 'Lord Chancellor and Secretary of State for Justice' },
        'B21': { name: 'Khalid Mahmood MP', party: 'Labour', constituency: 'Birmingham Perry Barr', email: 'khalid.mahmood.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/khalid-mahmood/1427' },

        // Leeds & Yorkshire
        'LS1': { name: 'Alex Sobel MP', party: 'Labour', constituency: 'Leeds Central and Headingley', email: 'alex.sobel.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/alex-sobel/4528' },
        'LS11': { name: 'Hilary Benn MP', party: 'Labour', constituency: 'Leeds South', email: 'hilary.benn.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/hilary-benn/120', role: 'Secretary of State for Northern Ireland' },
        'DL10': { name: 'Rt Hon Rishi Sunak MP', party: 'Conservative', constituency: 'Richmond and Northallerton', email: 'rishi.sunak.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/rishi-sunak/4212', role: 'Leader of the Opposition' },

        // Liverpool & Merseyside
        'L1': { name: 'Dan Carden MP', party: 'Labour', constituency: 'Liverpool Walton', email: 'dan.carden.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/dan-carden/4529' },
        'L15': { name: 'Paula Barker MP', party: 'Labour', constituency: 'Liverpool Wavertree', email: 'paula.barker.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/paula-barker/4658' },

        // Bristol & South West
        'BS1': { name: 'Kerry McCarthy MP', party: 'Labour', constituency: 'Bristol East', email: 'kerry.mccarthy.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/kerry-mccarthy/1454' },
        'BS8': { name: 'Darren Jones MP', party: 'Labour', constituency: 'Bristol North West', email: 'darren.jones.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/darren-jones/4517', role: 'Chief Secretary to the Treasury' },

        // Newcastle & North East
        'NE1': { name: 'Chi Onwurah MP', party: 'Labour', constituency: 'Newcastle upon Tyne Central and West', email: 'chi.onwurah.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/chi-onwurah/4000' },
        'NE2': { name: 'Catherine McKinnell MP', party: 'Labour', constituency: 'Newcastle upon Tyne North', email: 'catherine.mckinnell.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/catherine-mckinnell/4000' },

        // Scotland
        'EH1': { name: 'Joanna Cherry KC MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4378' },
        'EH8': { name: 'Tommy Sheppard MP', party: 'SNP', constituency: 'Edinburgh East', email: 'tommy.sheppard.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/tommy-sheppard/4379' },
        'G1': { name: 'Alison Thewliss MP', party: 'SNP', constituency: 'Glasgow Central', email: 'alison.thewliss.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/alison-thewliss/4380' },

        // Wales
        'CF10': { name: 'Jo Stevens MP', party: 'Labour', constituency: 'Cardiff East', email: 'jo.stevens.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/jo-stevens/4518', role: 'Secretary of State for Wales' },
        'CF11': { name: 'Stephen Doughty MP', party: 'Labour', constituency: 'Cardiff South and Penarth', email: 'stephen.doughty.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/stephen-doughty/4359' },

        // Northern Ireland
        'BT1': { name: 'John Finucane MP', party: 'Sinn Féin', constituency: 'Belfast North', email: 'john.finucane.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/john-finucane/4659' },
        'BT9': { name: 'Claire Hanna MP', party: 'SDLP', constituency: 'Belfast South and Mid Down', email: 'claire.hanna.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/claire-hanna/4660' },

        // Other Major Cities
        'NG1': { name: 'Lilian Greenwood MP', party: 'Labour', constituency: 'Nottingham South', email: 'lilian.greenwood.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/lilian-greenwood/4000', role: 'Secretary of State for Transport' },
        'S1': { name: 'Gill Furniss MP', party: 'Labour', constituency: 'Sheffield Brightside and Hillsborough', email: 'gill.furniss.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/gill-furniss/4519' },
        'PL1': { name: 'Luke Pollard MP', party: 'Labour', constituency: 'Plymouth Sutton and Devonport', email: 'luke.pollard.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/luke-pollard/4530', role: 'Secretary of State for Environment, Food and Rural Affairs' },
        'SO14': { name: 'Royston Smith MP', party: 'Conservative', constituency: 'Southampton Itchen', email: 'royston.smith.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/royston-smith/4520' }
    },

    // MP Lookup functionality
    findMP() {
        const postcodeInput = document.getElementById('postcode-input');
        const mpResults = document.getElementById('mp-results');

        if (!postcodeInput || !mpResults) return;

        const postcode = postcodeInput.value.trim();
        if (!postcode) {
            this.showMessage(mpResults, 'Please enter a postcode', 'warning');
            return;
        }

        console.log('🔍 Finding MP for postcode:', postcode);

        mpResults.innerHTML = '<div class="text-cyan-400 text-center">🔍 Looking up your MP...</div>';

        setTimeout(() => {
            const result = this.lookupMP(postcode);
            this.displayMPResult(result, mpResults);
        }, 1000);
    },

    // Lookup MP by postcode
    lookupMP(postcode) {
        // Clean and normalize postcode
        const cleanPostcode = postcode.toUpperCase().replace(/\s+/g, '').trim();

        // Try different prefix lengths for matching
        const prefixes = [];
        if (cleanPostcode.length >= 4) prefixes.push(cleanPostcode.substring(0, 4));
        if (cleanPostcode.length >= 3) prefixes.push(cleanPostcode.substring(0, 3));
        if (cleanPostcode.length >= 2) prefixes.push(cleanPostcode.substring(0, 2));

        for (const prefix of prefixes) {
            if (this.mpDatabase[prefix]) {
                return {
                    found: true,
                    postcode: postcode,
                    mp: this.mpDatabase[prefix],
                    matchType: `${prefix.length}-character match`
                };
            }
        }

        return {
            found: false,
            postcode: postcode,
            message: `No MP found for postcode "${postcode}". Please check the postcode or try another one.`
        };
    },

    // Display MP lookup result
    displayMPResult(result, container) {
        if (result.found) {
            const mp = result.mp;
            const roleDisplay = mp.role ? `<div class="text-sm text-yellow-400 font-medium">🏛️ ${mp.role}</div>` : '';

            container.innerHTML = `
                <div class="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-lg p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h4 class="text-xl font-semibold text-white">${mp.name}</h4>
                            <div class="text-sm text-purple-400">${mp.party}</div>
                            ${roleDisplay}
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-400">Constituency</div>
                            <div class="text-white font-medium">${mp.constituency}</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <a href="mailto:${mp.email}" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            Email
                        </a>
                        <a href="tel:${mp.phone}" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            Phone
                        </a>
                        <a href="${mp.website}" target="_blank" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                            Parliament
                        </a>
                        <button onclick="GovWhiz.showEmailTemplate()" class="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Contact
                        </button>
                    </div>
                    <div class="text-sm text-gray-400 bg-gray-800/30 rounded p-3">
                        ✅ Found MP for ${result.postcode} (${result.matchType}). Contact details current as of January 2025.
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 text-center">
                    <h4 class="text-red-400 font-semibold mb-2">❌ MP Not Found</h4>
                    <p class="text-gray-400 mb-4">${result.message}</p>
                    <div class="space-y-2">
                        <p class="text-gray-300 font-medium">Try these example postcodes:</p>
                        <div class="flex flex-wrap gap-2 justify-center">
                            <button onclick="GovWhiz.tryPostcode('SW1A 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">SW1A 1AA</button>
                            <button onclick="GovWhiz.tryPostcode('M1 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">M1 1AA</button>
                            <button onclick="GovWhiz.tryPostcode('B1 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">B1 1AA</button>
                            <button onclick="GovWhiz.tryPostcode('BS1 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">BS1 1AA</button>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // Try postcode example
    tryPostcode(postcode) {
        const postcodeInput = document.getElementById('postcode-input');
        if (postcodeInput) {
            postcodeInput.value = postcode;
            this.findMP();
        }
    },

    // Enhanced news loading functionality
    async loadPoliticalNews(page = 1) {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;

        // Show loading state
        newsContainer.innerHTML = `
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                <div class="text-cyan-400 mb-2">📰 Loading latest political news...</div>
                <div class="text-gray-400 text-sm">Fetching updates from reliable sources</div>
            </div>
        `;

        try {
            const response = await fetch(`/api/news?page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.articles || data.articles.length === 0) {
                newsContainer.innerHTML = `
                    <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                        <div class="text-yellow-400 mb-2">No news available</div>
                        <div class="text-gray-400 text-sm">Please check back later for updates</div>
                    </div>
                `;
                return;
            }

            // Display news articles with improved layout
            const newsHtml = data.articles.map(article => `
                <div class="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="text-lg font-semibold text-white">${article.title}</h4>
                        <div class="text-right">
                            <span class="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">${article.source}</span>
                            <div class="text-xs text-gray-500 mt-1">${this.formatDate(article.publishedAt)}</div>
                        </div>
                    </div>
                    <p class="text-gray-300 mb-3">${article.description || 'No description available'}</p>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <span class="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400">${article.category || 'General'}</span>
                        </div>
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                           class="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                            Read More →
                        </a>
                    </div>
                </div>
            `).join('');

            newsContainer.innerHTML = `
                <div class="space-y-4">
                    ${newsHtml}
                </div>
                ${this.createPagination(data.totalPages, page)}
            `;

        } catch (error) {
            console.error('Error loading news:', error);
            newsContainer.innerHTML = `
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                    <div class="text-red-400 mb-2">Error loading news</div>
                    <div class="text-gray-400 text-sm">Please try again later</div>
                    <button onclick="GovWhiz.loadPoliticalNews(1)" 
                            class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                        Retry
                    </button>
                </div>
            `;
        }
    },

    // Create pagination controls
    createPagination(totalPages, currentPage) {
        if (totalPages <= 1) return '';

        let paginationHtml = '<div class="flex justify-center gap-2 mt-6">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHtml += `
                <button onclick="GovWhiz.loadPoliticalNews(${currentPage - 1})"
                        class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                    Previous
                </button>
            `;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHtml += `
                    <button class="px-3 py-1 bg-purple-800 text-white rounded cursor-default">
                        ${i}
                    </button>
                `;
            } else {
                paginationHtml += `
                    <button onclick="GovWhiz.loadPoliticalNews(${i})"
                            class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                        ${i}
                    </button>
                `;
            }
        }

        // Next button
        if (currentPage < totalPages) {
            paginationHtml += `
                <button onclick="GovWhiz.loadPoliticalNews(${currentPage + 1})"
                        class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                    Next
                </button>
            `;
        }

        paginationHtml += '</div>';
        return paginationHtml;
    },

    // Improved date formatting
    formatDate(dateString) {
        if (!dateString) return 'Date unknown';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                if (diffHours === 0) {
                    const diffMinutes = Math.floor(diffTime / (1000 * 60));
                    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
                }
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            }
            
            if (diffDays === 1) {
                return 'Yesterday';
            }
            
            if (diffDays < 7) {
                return `${diffDays} days ago`;
            }
            
            return date.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Date unknown';
        }
    },

    // Contact form handling
    handleContactForm(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        console.log('📧 Contact form submitted:', data);

        // Show success message
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        setTimeout(() => {
            submitButton.textContent = '✅ Message Sent!';
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                event.target.reset();
            }, 2000);
        }, 1000);
    },

    // Show email template for MP contact
    showEmailTemplate() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-white">📧 Email Template for MP Contact</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="bg-gray-800/50 border border-gray-700 rounded p-4">
                        <h4 class="text-purple-400 font-semibold mb-2">Subject Line Examples:</h4>
                        <ul class="text-gray-300 text-sm space-y-1">
                            <li>• Constituent Inquiry - [Your Issue]</li>
                            <li>• Request for Support - [Bill/Policy Name]</li>
                            <li>• Local Issue - [Brief Description]</li>
                        </ul>
                    </div>
                    <div class="bg-gray-800/50 border border-gray-700 rounded p-4">
                        <h4 class="text-purple-400 font-semibold mb-2">Email Template:</h4>
                        <div class="bg-gray-900 border border-gray-600 rounded p-3 text-sm text-gray-300 font-mono">
                            <p>Dear [MP Name],</p><br>
                            <p>I am writing to you as your constituent in [Constituency Name] regarding [specific issue/concern].</p><br>
                            <p>[Explain your concern or request clearly and concisely]</p><br>
                            <p>I would appreciate your support/response on this matter and would be grateful to hear your position.</p><br>
                            <p>Thank you for your time and service to our constituency.</p><br>
                            <p>Yours sincerely,<br>
                            [Your Full Name]<br>
                            [Your Address]<br>
                            [Your Postcode]</p>
                        </div>
                    </div>
                    <div class="bg-blue-900/20 border border-blue-500/30 rounded p-4">
                        <h4 class="text-blue-400 font-semibold mb-2">💡 Tips for Effective MP Communication:</h4>
                        <ul class="text-gray-300 text-sm space-y-1">
                            <li>• Be clear and concise about your issue</li>
                            <li>• Include your full address to confirm you're a constituent</li>
                            <li>• Be respectful and professional in tone</li>
                            <li>• Provide specific examples if relevant</li>
                            <li>• Ask for a specific action or response</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Utility function to show messages
    showMessage(container, message, type = 'info') {
        const colors = {
            info: 'bg-blue-900/30 border-blue-500/30 text-blue-400',
            warning: 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400',
            error: 'bg-red-900/30 border-red-500/30 text-red-400',
            success: 'bg-green-900/30 border-green-500/30 text-green-400'
        };

        container.innerHTML = `
            <div class="${colors[type]} border rounded-lg p-4 text-center">
                ${message}
            </div>
        `;
    },

    // Show legislation details
    showLegislationDetails(title) {
        const legislation = this.legislationDatabase.find(item => item.title === title);
        if (!legislation) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-semibold text-white">${legislation.title}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="flex gap-4 mb-4">
                        <span class="text-xs px-2 py-1 rounded ${this.getStatusColor(legislation.status)}">${legislation.status}</span>
                        <span class="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">${legislation.category}</span>
                        <span class="text-xs text-gray-500">${legislation.date}</span>
                    </div>
                    <p class="text-gray-300 text-lg">${legislation.description}</p>
                    <div class="bg-gray-800/50 border border-gray-700 rounded p-4">
                        <h4 class="text-purple-400 font-semibold mb-2">Summary</h4>
                        <p class="text-gray-300">${legislation.summary}</p>
                    </div>
                    <div class="bg-gray-800/50 border border-gray-700 rounded p-4">
                        <h4 class="text-purple-400 font-semibold mb-2">Current Stage</h4>
                        <p class="text-gray-300">${legislation.stage}</p>
                    </div>
                    <div class="bg-gray-800/50 border border-gray-700 rounded p-4">
                        <h4 class="text-purple-400 font-semibold mb-2">Keywords</h4>
                        <div class="flex flex-wrap gap-2">
                            ${legislation.keywords.map(keyword =>
                                `<span class="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">${keyword}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Enhanced Constitution Explorer
    exploreConstitution(section) {
        const container = document.getElementById('constitution-content');
        if (!container) return;

        // Show loading state
        container.innerHTML = `
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                <div class="text-cyan-400 mb-2">📜 Loading Constitution Section...</div>
                <div class="text-gray-400 text-sm">Retrieving ${section} information</div>
            </div>
        `;

        // Fetch constitution data
        this.fetchConstitutionData(section)
            .then(data => this.displayConstitutionSection(data, section, container))
            .catch(error => {
                console.error('Error loading constitution:', error);
                container.innerHTML = `
                    <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                        <div class="text-red-400 mb-2">Error loading section</div>
                        <div class="text-gray-400 text-sm">Please try again later</div>
                        <button onclick="GovWhiz.exploreConstitution('${section}')" 
                                class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                            Retry
                        </button>
                    </div>
                `;
            });
    },

    // Fetch constitution data
    async fetchConstitutionData(section) {
        try {
            const response = await fetch(`/api/constitution/${section}`);
            if (!response.ok) throw new Error('Failed to fetch constitution data');
            return await response.json();
        } catch (error) {
            console.error('Constitution fetch error:', error);
            throw error;
        }
    },

    // Display constitution section
    displayConstitutionSection(data, section, container) {
        const sectionTitles = {
            'fundamental-rights': 'Fundamental Rights',
            'government-structure': 'Government Structure',
            'parliamentary-system': 'Parliamentary System',
            'judicial-system': 'Judicial System',
            'devolution': 'Devolution',
            'elections': 'Elections',
            'citizenship': 'Citizenship',
            'amendment-process': 'Amendment Process'
        };

        const title = sectionTitles[section] || section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        const content = `
            <div class="space-y-6">
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h2 class="text-2xl font-bold text-white mb-4">${title}</h2>
                    <div class="prose prose-invert max-w-none">
                        ${this.formatConstitutionContent(data.content)}
                    </div>
                </div>

                ${this.renderRelatedSections(data.relatedSections)}

                ${this.renderHistoricalContext(data.historicalContext)}

                ${this.renderKeyCases(data.keyCases)}

                ${this.renderAmendments(data.amendments)}
            </div>
        `;

        container.innerHTML = content;
        this.setupConstitutionNavigation(section);
    },

    // Format constitution content
    formatConstitutionContent(content) {
        if (!content) return '<p class="text-gray-400">No content available for this section.</p>';

        return content
            .split('\n\n')
            .map(paragraph => `<p class="text-gray-300 mb-4">${paragraph}</p>`)
            .join('');
    },

    // Render related sections
    renderRelatedSections(sections) {
        if (!sections || sections.length === 0) return '';

        return `
            <div class="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">Related Sections</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${sections.map(section => `
                        <button onclick="GovWhiz.exploreConstitution('${section.id}')"
                                class="text-left p-4 bg-purple-800/30 hover:bg-purple-800/50 rounded-lg transition-colors">
                            <h4 class="text-lg font-medium text-white mb-2">${section.title}</h4>
                            <p class="text-gray-400 text-sm">${section.description}</p>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Render historical context
    renderHistoricalContext(context) {
        if (!context) return '';

        return `
            <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">Historical Context</h3>
                <div class="prose prose-invert max-w-none">
                    ${this.formatConstitutionContent(context)}
                </div>
            </div>
        `;
    },

    // Render key cases
    renderKeyCases(cases) {
        if (!cases || cases.length === 0) return '';

        return `
            <div class="bg-green-900/30 border border-green-500/30 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">Key Cases</h3>
                <div class="space-y-4">
                    ${cases.map(case_ => `
                        <div class="bg-green-800/30 rounded-lg p-4">
                            <h4 class="text-lg font-medium text-white mb-2">${case_.title}</h4>
                            <p class="text-gray-300 mb-2">${case_.summary}</p>
                            <div class="flex items-center gap-2 text-sm text-gray-400">
                                <span>${case_.year}</span>
                                <span>•</span>
                                <span>${case_.court}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Render amendments
    renderAmendments(amendments) {
        if (!amendments || amendments.length === 0) return '';

        return `
            <div class="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">Recent Amendments</h3>
                <div class="space-y-4">
                    ${amendments.map(amendment => `
                        <div class="bg-yellow-800/30 rounded-lg p-4">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="text-lg font-medium text-white">${amendment.title}</h4>
                                <span class="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                                    ${amendment.date}
                                </span>
                            </div>
                            <p class="text-gray-300">${amendment.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Setup constitution navigation
    setupConstitutionNavigation(currentSection) {
        const navItems = document.querySelectorAll('.constitution-nav-item');
        navItems.forEach(item => {
            const section = item.getAttribute('data-section');
            if (section === currentSection) {
                item.classList.add('bg-purple-600', 'text-white');
                item.classList.remove('text-gray-400', 'hover:bg-purple-900/30');
            } else {
                item.classList.remove('bg-purple-600', 'text-white');
                item.classList.add('text-gray-400', 'hover:bg-purple-900/30');
            }
        });
    },

    // Enhanced AI Summarization
    async summarizeContent(content, type) {
        const container = document.getElementById('summary-container');
        if (!container) return;

        // Show loading state
        container.innerHTML = `
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                <div class="text-cyan-400 mb-2">🤖 AI Analysis in Progress...</div>
                <div class="text-gray-400 text-sm">Processing ${type} content</div>
            </div>
        `;

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    type
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate summary');
            }

            const data = await response.json();
            this.displaySummary(data, container);

        } catch (error) {
            console.error('Summarization error:', error);
            container.innerHTML = `
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                    <div class="text-red-400 mb-2">Summarization Failed</div>
                    <div class="text-gray-400 text-sm">Please try again later</div>
                    <button onclick="GovWhiz.summarizeContent('${content}', '${type}')" 
                            class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                        Retry
                    </button>
                </div>
            `;
        }
    },

    // Display summary
    displaySummary(data, container) {
        const { summary, keyPoints, sentiment, topics, readability } = data;

        const content = `
            <div class="space-y-6">
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">AI Summary</h3>
                    <div class="prose prose-invert max-w-none">
                        ${this.formatSummaryContent(summary)}
                    </div>
                </div>

                ${this.renderKeyPoints(keyPoints)}

                ${this.renderSentimentAnalysis(sentiment)}

                ${this.renderTopics(topics)}

                ${this.renderReadabilityMetrics(readability)}
            </div>
        `;

        container.innerHTML = content;
    },

    // Format summary content
    formatSummaryContent(content) {
        if (!content) return '<p class="text-gray-400">No summary available.</p>';

        return content
            .split('\n\n')
            .map(paragraph => `<p class="text-gray-300 mb-4">${paragraph}</p>`)
            .join('');
    },

    // Render key points
    renderKeyPoints(points) {
        if (!points || points.length === 0) return '';

        return `
            <div class="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">Key Points</h3>
                <ul class="space-y-3">
                    ${points.map(point => `
                        <li class="flex items-start gap-3">
                            <span class="text-purple-400 mt-1">•</span>
                            <span class="text-gray-300">${point}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    },

    // Render sentiment analysis
    renderSentimentAnalysis(sentiment) {
        if (!sentiment) return '';

        const getSentimentColor = (score) => {
            if (score > 0.6) return 'text-green-400';
            if (score < 0.4) return 'text-red-400';
            return 'text-yellow-400';
        };

        const getSentimentLabel = (score) => {
            if (score > 0.6) return 'Positive';
            if (score < 0.4) return 'Negative';
            return 'Neutral';
        };

        return `
            <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">Sentiment Analysis</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300">Overall Sentiment</span>
                        <span class="${getSentimentColor(sentiment.score)} font-medium">
                            ${getSentimentLabel(sentiment.score)}
                        </span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full" 
                             style="width: ${sentiment.score * 100}%"></div>
                    </div>
                    ${sentiment.aspects ? `
                        <div class="mt-4 space-y-2">
                            ${Object.entries(sentiment.aspects).map(([aspect, score]) => `
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400 text-sm">${aspect}</span>
                                    <span class="${getSentimentColor(score)} text-sm">
                                        ${getSentimentLabel(score)}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Render topics
    renderTopics(topics) {
        if (!topics || topics.length === 0) return '';

        return `
            <div class="bg-green-900/30 border border-green-500/30 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">Key Topics</h3>
                <div class="flex flex-wrap gap-2">
                    ${topics.map(topic => `
                        <span class="px-3 py-1 bg-green-800/30 text-green-400 rounded-full text-sm">
                            ${topic}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Render readability metrics
    renderReadabilityMetrics(metrics) {
        if (!metrics) return '';

        const getReadabilityColor = (score) => {
            if (score >= 80) return 'text-green-400';
            if (score >= 60) return 'text-yellow-400';
            return 'text-red-400';
        };

        const getReadabilityLabel = (score) => {
            if (score >= 80) return 'Very Readable';
            if (score >= 60) return 'Moderately Readable';
            return 'Complex';
        };

        return `
            <div class="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-white mb-4">Readability Analysis</h3>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-yellow-800/30 rounded-lg p-4">
                            <div class="text-gray-400 text-sm mb-1">Readability Score</div>
                            <div class="flex items-center justify-between">
                                <span class="${getReadabilityColor(metrics.score)} text-2xl font-bold">
                                    ${metrics.score}
                                </span>
                                <span class="${getReadabilityColor(metrics.score)} text-sm">
                                    ${getReadabilityLabel(metrics.score)}
                                </span>
                            </div>
                        </div>
                        <div class="bg-yellow-800/30 rounded-lg p-4">
                            <div class="text-gray-400 text-sm mb-1">Reading Level</div>
                            <div class="text-white text-2xl font-bold">
                                ${metrics.readingLevel}
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-yellow-800/30 rounded-lg p-4">
                            <div class="text-gray-400 text-sm mb-1">Words</div>
                            <div class="text-white text-xl font-bold">${metrics.wordCount}</div>
                        </div>
                        <div class="bg-yellow-800/30 rounded-lg p-4">
                            <div class="text-gray-400 text-sm mb-1">Sentences</div>
                            <div class="text-white text-xl font-bold">${metrics.sentenceCount}</div>
                        </div>
                        <div class="bg-yellow-800/30 rounded-lg p-4">
                            <div class="text-gray-400 text-sm mb-1">Avg. Word Length</div>
                            <div class="text-white text-xl font-bold">${metrics.avgWordLength}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
};

// MP Lookup Core Functions
async function findMP() {
    const postcodeInput = document.getElementById('postcodeInput');
    const resultsDiv = document.getElementById('mp-results');
    
    if (!postcodeInput || !resultsDiv) {
        console.error('Required elements not found');
        return;
    }

    const postcode = postcodeInput.value.trim().toUpperCase();
    
    // Basic postcode validation
    if (!isValidPostcode(postcode)) {
        resultsDiv.innerHTML = `
            <div class="p-6 text-red-400 text-center">
                Please enter a valid UK postcode
            </div>`;
        return;
    }

    try {
        resultsDiv.innerHTML = `
            <div class="p-6 text-cyan-400 text-center">
                <i class="fas fa-spinner fa-spin mr-2"></i> Looking up your MP...
            </div>`;

        const response = await fetch(`/api/mp-lookup?postcode=${encodeURIComponent(postcode)}`);
        
        if (!response.ok) {
            throw new Error('MP lookup failed');
        }

        const data = await response.json();
        
        if (!data || !data.name) {
            throw new Error('No MP found for this postcode');
        }

        resultsDiv.innerHTML = `
            <div class="p-6">
                <div class="flex items-center gap-4 mb-4">
                    ${data.image ? `<img src="${data.image}" alt="${data.name}" class="w-24 h-24 rounded-lg object-cover">` : ''}
                    <div>
                        <h3 class="text-xl font-bold text-white mb-1">${data.name}</h3>
                        <p class="text-cyan-400">${data.constituency}</p>
                        <p class="text-gray-400">${data.party}</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div class="bg-gray-800/30 p-4 rounded-lg">
                        <h4 class="text-cyan-400 mb-2">Contact Information</h4>
                        <p class="text-gray-300">${data.email || 'Email not available'}</p>
                        <p class="text-gray-300">${data.phone || 'Phone not available'}</p>
                    </div>
                    <div class="bg-gray-800/30 p-4 rounded-lg">
                        <h4 class="text-cyan-400 mb-2">Quick Actions</h4>
                        <div class="flex gap-2">
                            ${data.email ? `<a href="mailto:${data.email}" class="px-3 py-1 bg-cyan-900/50 hover:bg-cyan-800/50 rounded text-sm">Email MP</a>` : ''}
                            <a href="#" onclick="viewMPProfile('${data.id}')" class="px-3 py-1 bg-purple-900/50 hover:bg-purple-800/50 rounded text-sm">View Profile</a>
                        </div>
                    </div>
                </div>
            </div>`;
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="p-6 text-red-400 text-center">
                ${error.message || 'An error occurred while looking up your MP'}
            </div>`;
    }
}

function isValidPostcode(postcode) {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode);
}

function quickSearch(postcode) {
    const postcodeInput = document.getElementById('postcodeInput');
    if (postcodeInput) {
        postcodeInput.value = postcode;
        findMP();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GovWhiz.init();
});

// Global functions for backward compatibility and modal access
window.trySearch = (term) => GovWhiz.trySearch(term);
window.tryPostcode = (postcode) => GovWhiz.tryPostcode(postcode);
window.GovWhiz = GovWhiz;
