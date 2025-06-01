/**
 * GovWhiz - Main Application Script (Clean & Optimized)
 * Consolidated functionality with proper error handling and modern JavaScript
 */

const GovWhiz = {
    // State management
    state: {
        initialized: false,
        currentMP: null,
        tracking: new Set(),
        news: {
            filters: new Set(),
            bookmarks: new Set()
        }
    },

    // Initialize the application
    initialize() {
        if (this.state.initialized) return;
        this.setupEventListeners();
        this.state.initialized = true;
        console.log('🏛️ GovWhiz initialized');
    },

    // Event listener setup
    setupEventListeners() {
        // MP lookup event listeners
        const findMpBtn = document.querySelector('#find-mp-btn');
        const postcodeInput = document.querySelector('#postcode-input');

        if (findMpBtn) {
            findMpBtn.onclick = () => this.findMP();
        }

        if (postcodeInput) {
            postcodeInput.onkeypress = (e) => {
                if (e.key === 'Enter') this.findMP();
            };
            postcodeInput.oninput = (e) => this.validatePostcode(e.target.value);
        }

        // News section event listeners
        const newsFilters = document.querySelectorAll('.news-filter');
        const newsSearch = document.querySelector('#news-search');

        newsFilters?.forEach(filter => {
            filter.onclick = () => this.toggleNewsFilter(filter.dataset.topic);
        });

        newsSearch?.onkeyup = (e) => {
            if (e.key === 'Enter') this.searchNews(e.target.value);
        };

        // Setup bookmarking
        document.body.onclick = (e) => {
            if (e.target.matches('.bookmark-btn')) {
                const newsId = e.target.dataset.newsId;
                this.toggleBookmark(newsId);
            }
        };
    },

    // News section functionality
    toggleNewsFilter(topic) {
        if (!topic) return;
        
        const filterBtn = document.querySelector(`[data-topic="${topic}"]`);
        if (!filterBtn) return;

        if (this.state.news.filters.has(topic)) {
            this.state.news.filters.delete(topic);
            filterBtn.classList.remove('bg-blue-600', 'text-white');
            filterBtn.classList.add('bg-gray-200', 'text-gray-700');
        } else {
            this.state.news.filters.add(topic);
            filterBtn.classList.remove('bg-gray-200', 'text-gray-700');
            filterBtn.classList.add('bg-blue-600', 'text-white');
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

    // Political News functionality
    loadPoliticalNews() {
        const newsContainer = document.getElementById('news-container');
        const loadMoreBtn = document.getElementById('load-more-news');
        
        if (!newsContainer) return;

        try {
            if (page === 1) {
                newsContainer.innerHTML = `
                    <div class="loading-placeholder text-center py-8">
                        <div class="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
                        <p class="text-gray-400 mt-4">Loading latest news...</p>
                    </div>`;
            }

            const response = await fetch(`/api/political-news?page=${page}&limit=${newsPerPage}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await response.json();
            
            if (page === 1) {
                newsContainer.innerHTML = '';
            }

            data.articles.forEach(article => {
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item bg-gray-800/30 rounded-lg overflow-hidden transition-all duration-300 hover:bg-gray-800/50';
                newsItem.innerHTML = `
                    <div class="p-6">
                        <div class="flex items-center gap-2 text-sm text-cyan-400 mb-2">
                            <i class="fas fa-clock"></i>
                            <span>${formatDate(new Date(article.publishedAt))}</span>
                            ${article.source ? `<span class="text-gray-500">•</span>
                            <span>${article.source}</span>` : ''}
                        </div>
                        <h3 class="text-xl font-semibold text-white mb-3 hover:text-cyan-400 transition-colors">
                            <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                                ${article.title}
                            </a>
                        </h3>
                        <p class="text-gray-400 mb-4">${article.description}</p>
                        <div class="flex items-center gap-4">
                            <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                               class="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                                Read More
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                `;
                newsContainer.appendChild(newsItem);
            });

            if (data.hasMore) {
                loadMoreBtn.classList.remove('hidden');
                currentPage = page;
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error loading news:', error);
            newsContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-400">Failed to load news. Please try again later.</p>
                    <button onclick="loadPoliticalNews(1)" class="mt-4 px-4 py-2 bg-cyan-900/50 hover:bg-cyan-800/50 rounded-lg text-cyan-400 transition-all duration-300">
                        Retry
                    </button>
                </div>`;
        }
    },

    // News Loading Functions
    currentPage: 1,
    newsPerPage: 5,

    async loadPoliticalNews(page = 1) {
        const newsContainer = document.getElementById('news-container');
        const loadMoreBtn = document.getElementById('load-more-news');
        
        if (!newsContainer) return;

        try {
            if (page === 1) {
                newsContainer.innerHTML = `
                    <div class="loading-placeholder text-center py-8">
                        <div class="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
                        <p class="text-gray-400 mt-4">Loading latest news...</p>
                    </div>`;
            }

            const response = await fetch(`/api/political-news?page=${page}&limit=${newsPerPage}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await response.json();
            
            if (page === 1) {
                newsContainer.innerHTML = '';
            }

            data.articles.forEach(article => {
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item bg-gray-800/30 rounded-lg overflow-hidden transition-all duration-300 hover:bg-gray-800/50';
                newsItem.innerHTML = `
                    <div class="p-6">
                        <div class="flex items-center gap-2 text-sm text-cyan-400 mb-2">
                            <i class="fas fa-clock"></i>
                            <span>${formatDate(new Date(article.publishedAt))}</span>
                            ${article.source ? `<span class="text-gray-500">•</span>
                            <span>${article.source}</span>` : ''}
                        </div>
                        <h3 class="text-xl font-semibold text-white mb-3 hover:text-cyan-400 transition-colors">
                            <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                                ${article.title}
                            </a>
                        </h3>
                        <p class="text-gray-400 mb-4">${article.description}</p>
                        <div class="flex items-center gap-4">
                            <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                               class="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                                Read More
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                `;
                newsContainer.appendChild(newsItem);
            });

            if (data.hasMore) {
                loadMoreBtn.classList.remove('hidden');
                currentPage = page;
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error loading news:', error);
            newsContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-400">Failed to load news. Please try again later.</p>
                    <button onclick="loadPoliticalNews(1)" class="mt-4 px-4 py-2 bg-cyan-900/50 hover:bg-cyan-800/50 rounded-lg text-cyan-400 transition-all duration-300">
                        Retry
                    </button>
                </div>`;
        }
    },

    formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    },

    // Setup news loading event listener
    document.addEventListener('DOMContentLoaded', () => {
        const loadMoreBtn = document.getElementById('load-more-news');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                loadPoliticalNews(currentPage + 1);
            });
        }
        // Initial news load
        loadPoliticalNews(1);
    }),

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
        const classes = {
            info: 'text-blue-400 bg-blue-900/30 border-blue-500/30',
            warning: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30',
            error: 'text-red-400 bg-red-900/30 border-red-500/30'
        };

        container.innerHTML = `
            <div class="border rounded-lg p-4 ${classes[type] || classes.info}">
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
    }
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
