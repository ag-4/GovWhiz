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
        const exampleButtons = document.querySelectorAll('.postcode-example');

        if (findMpBtn) {
            findMpBtn.addEventListener('click', () => this.findMP());
        }

        if (postcodeInput) {
            postcodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.findMP();
            });
            
            // Add real-time validation
            postcodeInput.addEventListener('input', (e) => {
                const postcode = e.target.value.toUpperCase();
                const isValid = this.validatePostcode(postcode);
                e.target.classList.toggle('border-red-500', !isValid);
                e.target.classList.toggle('border-gray-700', isValid);
            });
        }

        // Example postcode buttons
        exampleButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (postcodeInput) {
                    postcodeInput.value = button.textContent;
                    this.findMP();
                }
            });
        });

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
        const lines = ['line1', 'line2', 'line3'].map(id => document.getElementById(id));

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.contains('open');

                if (isOpen) {
                    mobileMenu.style.maxHeight = '0px';
                    mobileMenu.style.opacity = '0';
                    mobileMenu.classList.remove('open');
                    lines[0].style.transform = '';
                    lines[1].style.opacity = '1';
                    lines[2].style.transform = '';
                } else {
                    mobileMenu.style.maxHeight = '300px';
                    mobileMenu.style.opacity = '1';
                    mobileMenu.classList.add('open');
                    lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    lines[1].style.opacity = '0';
                    lines[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
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

    // Validate UK postcode format
    validatePostcode(postcode) {
        const pattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        return pattern.test(postcode.trim());
    },

    // Find MP by postcode
    async findMP() {
        const postcodeInput = document.getElementById('postcode-input');
        const resultsDiv = document.getElementById('mp-results');
        
        if (!postcodeInput || !resultsDiv) return;

        const postcode = postcodeInput.value.trim();
        
        // Validate postcode
        if (!this.validatePostcode(postcode)) {
            resultsDiv.innerHTML = `
                <div class="text-red-400 text-center">
                    <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Please enter a valid UK postcode
                </div>`;
            return;
        }

        // Show loading state
        resultsDiv.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                <span class="ml-3 text-gray-400">Looking up your MP...</span>
            </div>`;

        try {
            const response = await fetch('/api/find_mp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postcode })
            });

            const data = await response.json();

            if (data.found) {
                // Format the party color
                const partyColors = {
                    'Conservative': 'text-blue-400',
                    'Labour': 'text-red-400',
                    'Liberal Democrat': 'text-yellow-400',
                    'Scottish National Party': 'text-yellow-400',
                    'Green': 'text-green-400',
                    'Independent': 'text-gray-400'
                };
                const partyColor = partyColors[data.party] || 'text-gray-400';

                resultsDiv.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-white">${data.name}</h3>
                                <p class="text-sm ${partyColor}">${data.party}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-400">${data.constituency}</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            ${data.email ? `
                            <a href="mailto:${data.email}" class="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-md text-sm transition-colors flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Email
                            </a>
                            ` : ''}
                            ${data.phone ? `
                            <a href="tel:${data.phone}" class="px-3 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 rounded-md text-sm transition-colors flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                Call
                            </a>
                            ` : ''}
                        </div>
                        ${data.profile_url ? `
                        <a href="${data.profile_url}" target="_blank" rel="noopener noreferrer" class="mt-4 block px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 rounded-md text-sm transition-colors text-center">
                            View Full Profile
                        </a>
                        ` : ''}
                    </div>`;
            } else {
                resultsDiv.innerHTML = `
                    <div class="text-red-400 text-center">
                        <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${data.error || 'Could not find MP information for this postcode'}
                    </div>`;
            }
        } catch (error) {
            console.error('Error looking up MP:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 text-center">
                    <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Sorry, there was an error looking up your MP. Please try again later.
                </div>`;
        }
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

        if (!searchInput || !resultsSection) return;

        const query = searchInput.value.trim();
        if (!query) {
            this.showMessage(resultsSection, 'Please enter a search term', 'warning');
            return;
        }

        console.log('🔍 Searching for:', query);

        // Show loading state
        resultsSection.innerHTML = `
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                <div class="text-cyan-400 mb-2">🔍 Searching legislation database...</div>
                <div class="text-gray-400 text-sm">Finding relevant bills and acts for "${query}"</div>
            </div>
        `;

        // Simulate search delay for better UX
        setTimeout(() => {
            const results = this.searchLegislation(query);
            this.displaySearchResults(results, query, resultsSection);
        }, 1000);
    },

    // Search through legislation database
    searchLegislation(query) {
        const searchTerms = query.toLowerCase().split(' ');
        return this.legislationDatabase.filter(item => {
            const searchableText = `${item.title} ${item.description} ${item.category} ${item.keywords.join(' ')} ${item.summary}`.toLowerCase();
            return searchTerms.some(term => searchableText.includes(term));
        });
    },

    // Display search results
    displaySearchResults(results, query, container) {
        if (results.length > 0) {
            const resultsHtml = results.map(item => `
                <div class="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="text-lg font-semibold text-white">${item.title}</h4>
                        <div class="text-right">
                            <span class="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">${item.category}</span>
                            <div class="text-xs text-gray-500 mt-1">${item.date}</div>
                        </div>
                    </div>
                    <p class="text-gray-300 mb-3">${item.description}</p>
                    <div class="text-sm text-gray-400 mb-3">${item.summary}</div>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <span class="text-xs px-2 py-1 rounded ${this.getStatusColor(item.status)}">${item.status}</span>
                            <span class="text-xs text-gray-500">${item.stage}</span>
                        </div>
                        <button onclick="GovWhiz.showLegislationDetails('${item.title}')" class="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                            View Details →
                        </button>
                    </div>
                </div>
            `).join('');

            container.innerHTML = `
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">🔍 Search Results for "${query}" (${results.length} found)</h3>
                    <div class="space-y-4">
                        ${resultsHtml}
                    </div>
                    <div class="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <h4 class="text-blue-400 font-semibold mb-2">💡 Search Tips</h4>
                        <ul class="text-gray-400 text-sm space-y-1">
                            <li>• Try keywords like "healthcare", "technology", "environment", "education"</li>
                            <li>• Search by category: "privacy", "transport", "housing", "finance"</li>
                            <li>• Look for specific acts: "Digital Services", "Climate Action", "Data Protection"</li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">🔍 Search Results for "${query}"</h3>
                    <div class="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6 text-center">
                        <h4 class="text-yellow-400 font-semibold mb-2">📋 No Results Found</h4>
                        <p class="text-gray-400 mb-4">No legislation found matching "${query}". Try these popular searches:</p>
                        <div class="flex flex-wrap gap-2 justify-center">
                            <button onclick="GovWhiz.trySearch('digital services')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">Digital Services</button>
                            <button onclick="GovWhiz.trySearch('healthcare')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">Healthcare</button>
                            <button onclick="GovWhiz.trySearch('climate')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">Climate</button>
                            <button onclick="GovWhiz.trySearch('education')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">Education</button>
                            <button onclick="GovWhiz.trySearch('transport')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">Transport</button>
                        </div>
                    </div>
                </div>
            `;
        }
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

    // Validate UK postcode format
    validatePostcode(postcode) {
        const pattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        return pattern.test(postcode.trim());
    },

    // Find MP by postcode
    async findMP() {
        const postcodeInput = document.getElementById('postcode-input');
        const resultsDiv = document.getElementById('mp-results');
        
        if (!postcodeInput || !resultsDiv) return;

        const postcode = postcodeInput.value.trim();
        
        // Validate postcode
        if (!this.validatePostcode(postcode)) {
            resultsDiv.innerHTML = `
                <div class="text-red-400 text-center">
                    <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Please enter a valid UK postcode
                </div>`;
            return;
        }

        // Show loading state
        resultsDiv.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                <span class="ml-3 text-gray-400">Looking up your MP...</span>
            </div>`;

        try {
            const response = await fetch('/api/find_mp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postcode })
            });

            const data = await response.json();

            if (data.found) {
                // Format the party color
                const partyColors = {
                    'Conservative': 'text-blue-400',
                    'Labour': 'text-red-400',
                    'Liberal Democrat': 'text-yellow-400',
                    'Scottish National Party': 'text-yellow-400',
                    'Green': 'text-green-400',
                    'Independent': 'text-gray-400'
                };
                const partyColor = partyColors[data.party] || 'text-gray-400';

                resultsDiv.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-white">${data.name}</h3>
                                <p class="text-sm ${partyColor}">${data.party}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-400">${data.constituency}</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            ${data.email ? `
                            <a href="mailto:${data.email}" class="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-md text-sm transition-colors flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Email
                            </a>
                            ` : ''}
                            ${data.phone ? `
                            <a href="tel:${data.phone}" class="px-3 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 rounded-md text-sm transition-colors flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                Call
                            </a>
                            ` : ''}
                        </div>
                        ${data.profile_url ? `
                        <a href="${data.profile_url}" target="_blank" rel="noopener noreferrer" class="mt-4 block px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 rounded-md text-sm transition-colors text-center">
                            View Full Profile
                        </a>
                        ` : ''}
                    </div>`;
            } else {
                resultsDiv.innerHTML = `
                    <div class="text-red-400 text-center">
                        <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${data.error || 'Could not find MP information for this postcode'}
                    </div>`;
            }
        } catch (error) {
            console.error('Error looking up MP:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 text-center">
                    <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Sorry, there was an error looking up your MP. Please try again later.
                </div>`;
        }
    },

    // MP Data Cache
    mpData: null,

    // Flask MP Lookup Integration
    async findMPFlask(postcode) {
        console.log('🏛️ Using static MP lookup for:', postcode);

        const mpResults = document.getElementById('mp-results');
        if (!mpResults) return;

        mpResults.innerHTML = '<div class="text-cyan-400 text-center">🔍 Looking up your MP...</div>';

        try {
            // Load MP data if not loaded
            if (!this.mpData) {
                const response = await fetch('/static/data/mp_data.json');
                this.mpData = await response.json();
            }

            const data = this.mpData[postcode.toUpperCase()] || null;

            if (data && data.found) {
                const mockBadge = '<div class="text-xs text-blue-400 mb-2">📋 Demo Data</div>';

                mpResults.innerHTML = `
                    <div class="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-lg p-6">
                        ${mockBadge}
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h4 class="text-xl font-semibold text-white">${data.name}</h4>
                                <div class="text-sm text-purple-400">${data.party}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-gray-400">Constituency</div>
                                <div class="text-white font-medium">${data.constituency}</div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            ${data.email ? `
                                <a href="mailto:${data.email}" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                    Email
                                </a>
                            ` : '<div class="text-gray-500 text-sm">Email not available</div>'}
                            ${data.phone ? `
                                <a href="tel:${data.phone}" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                    Phone
                                </a>
                            ` : '<div class="text-gray-500 text-sm">Phone not available</div>'}
                            ${data.website ? `
                                <a href="${data.website}" target="_blank" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                                    </svg>
                                    Parliament
                                </a>
                            ` : '<div></div>'}
                            <div class="text-xs text-gray-500">
                                🆓 Free UK Gov Data
                            </div>
                        </div>
                        <div class="text-sm text-gray-400 bg-gray-800/30 rounded p-3">
                            ✅ Found MP for ${postcode}.
                            ${new Date().toLocaleString()}
                        </div>
                    </div>
                `;
            } else {
                mpResults.innerHTML = `
                    <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 text-center">
                        <h4 class="text-red-400 font-semibold mb-2">❌ MP Not Found</h4>
                        <p class="text-gray-400">Please check your postcode and try again.</p>
                        <div class="mt-4">
                            <p class="text-gray-300 font-medium mb-2">Try these example postcodes:</p>
                            <div class="flex flex-wrap gap-2 justify-center">
                                <button onclick="tryPostcode('SW1A 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">SW1A 1AA</button>
                                <button onclick="tryPostcode('M1 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">M1 1AA</button>
                                <button onclick="tryPostcode('B1 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">B1 1AA</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error in MP lookup:', error);
            mpResults.innerHTML = `
                <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 text-center">
                    <h4 class="text-red-400 font-semibold mb-2">❌ Lookup Error</h4>
                    <p class="text-gray-400">An error occurred. Please try again.</p>
                </div>
            `;
        }
    }
};

// Initialize the application
GovWhiz.init();
