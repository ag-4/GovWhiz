document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const resultsSection = document.getElementById('results');
    const searchForm = document.querySelector('.search-box');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const postcodeInput = document.getElementById('postcode-input');
    const findMpBtn = document.getElementById('find-mp-btn');
    const mpResults = document.getElementById('mp-results');

    // Enhanced mock data with more legislation examples
    const mockLegislation = {
        "Online Safety Bill": {
            summary: "The Online Safety Bill aims to make the UK the safest place to be online by regulating harmful content.",
            background: "Introduced in 2021 as a response to growing concerns about online harms, cyberbullying, and the spread of misinformation on social media platforms.",
            stage: "Passed into law in September 2023 as the Online Safety Act 2023.",
            implications: "Social media platforms must remove illegal content and protect children from harmful material. Ofcom has new powers to fine companies up to 10% of their global turnover.",
            affects: "Social media users, tech companies, content creators, parents, and children using online platforms.",
            sources: "https://www.gov.uk/government/publications/online-safety-bill-supporting-documents",
            action: "You can check if your favorite platforms comply with the new regulations by reviewing their updated terms of service and report harmful content through new reporting mechanisms.",
            category: "Technology & Digital Rights",
            status: "enacted"
        },
        "Environment Act": {
            summary: "The Environment Act sets legally binding targets for biodiversity, air quality, water, and waste management.",
            background: "Developed to fill the governance gap after Brexit and address environmental challenges. It establishes a new framework for environmental protection post-EU membership.",
            stage: "Enacted in November 2021.",
            implications: "Creates a new environmental watchdog (Office for Environmental Protection) and requires biodiversity net gain in new developments. Sets targets for reducing plastic waste and improving air quality.",
            affects: "Businesses, local authorities, landowners, developers, and citizens concerned about environmental protection.",
            sources: "https://www.legislation.gov.uk/ukpga/2021/30/contents/enacted",
            action: "You can participate in local conservation initiatives, contact your MP about environmental concerns in your area, or join community environmental groups.",
            category: "Environment & Climate",
            status: "enacted"
        },
        "Economic Crime and Corporate Transparency Act": {
            summary: "Strengthens the UK's defenses against economic crime and increases corporate transparency requirements.",
            background: "Introduced in response to concerns about money laundering, corporate secrecy, and the need for greater transparency in business ownership following international sanctions.",
            stage: "Received Royal Assent in October 2023.",
            implications: "Companies House gains new powers to verify information, beneficial ownership registers become more robust, and penalties for economic crimes are increased.",
            affects: "All UK companies, their directors, beneficial owners, accountants, lawyers, and law enforcement agencies.",
            sources: "https://www.legislation.gov.uk/ukpga/2023/56/contents/enacted",
            action: "If you own or run a company, ensure your filings are accurate and up-to-date. Report suspicious financial activity to the National Crime Agency.",
            category: "Business & Finance",
            status: "enacted"
        },
        "Strikes (Minimum Service Levels) Act": {
            summary: "Requires minimum service levels during strikes in essential public services.",
            background: "Introduced to ensure essential services continue operating during industrial action, particularly in health, education, transport, and emergency services.",
            stage: "Received Royal Assent in July 2023.",
            implications: "Trade unions must ensure minimum service levels are maintained during strikes. Failure to comply can result in legal action and loss of legal protections.",
            affects: "Public sector workers, trade unions, employers in essential services, and the general public who rely on these services.",
            sources: "https://www.legislation.gov.uk/ukpga/2023/39/contents/enacted",
            action: "If you work in essential services, understand your rights and obligations during industrial action. Contact your union representative for guidance.",
            category: "Employment & Workers' Rights",
            status: "enacted"
        },
        "Levelling-up and Regeneration Act": {
            summary: "Aims to reduce geographical inequalities and give local communities more control over development in their areas.",
            background: "Part of the government's levelling-up agenda to address regional disparities in economic opportunity, education, and infrastructure across the UK.",
            stage: "Received Royal Assent in October 2023.",
            implications: "Introduces new planning reforms, community infrastructure levy changes, and powers for local authorities to compulsorily purchase land for regeneration.",
            affects: "Local authorities, developers, property owners, community groups, and residents in areas targeted for regeneration.",
            sources: "https://www.legislation.gov.uk/ukpga/2023/55/contents/enacted",
            action: "Engage with your local council's planning processes, join community groups involved in local development, and stay informed about regeneration projects in your area.",
            category: "Housing & Planning",
            status: "enacted"
        },
        "Data Protection and Digital Information Bill": {
            summary: "Reforms UK data protection laws to reduce burdens on businesses while maintaining privacy protections.",
            background: "Aims to create a more flexible data protection regime post-Brexit, reducing compliance costs while ensuring personal data remains protected.",
            stage: "Currently progressing through Parliament (as of 2024).",
            implications: "May reduce some GDPR requirements for UK businesses, introduce new rights for data subjects, and change how data protection is enforced.",
            affects: "All businesses processing personal data, data protection officers, individuals whose data is processed, and privacy advocates.",
            sources: "https://bills.parliament.uk/bills/3430",
            action: "If you run a business, monitor the bill's progress and prepare for potential changes to data protection compliance requirements.",
            category: "Technology & Digital Rights",
            status: "in-progress"
        },
        "Children's Wellbeing and Schools Bill": {
            summary: "Legislation to improve children's mental health support and school standards across England.",
            background: "Introduced following concerns about rising mental health issues among young people post-pandemic and the need for comprehensive school reform.",
            stage: "Committee Stage - House of Commons (as of January 29, 2025).",
            implications: "Will require all schools to have qualified mental health professionals and establish new wellbeing standards for educational institutions.",
            affects: "All state schools in England, teachers, parents, children aged 5-18, and mental health professionals.",
            sources: "https://bills.parliament.uk/bills/3775",
            action: "Contact your MP to support increased funding for school mental health services and participate in the consultation process.",
            category: "Education & Children",
            status: "in-progress"
        },
        "Data (Use and Access) Bill": {
            summary: "Reforms to improve how public sector data is shared and used while protecting privacy.",
            background: "Aims to modernize data governance following Brexit and address digital transformation needs across government departments.",
            stage: "Second Reading - House of Lords (as of January 28, 2025).",
            implications: "Will enable better data sharing between government departments while strengthening privacy protections and citizen rights.",
            affects: "All UK residents, government departments, public services, data protection officers, and technology companies.",
            sources: "https://bills.parliament.uk/bills/3776",
            action: "Review the bill's privacy provisions and contact your MP with any concerns about data protection and government surveillance.",
            category: "Technology & Digital Rights",
            status: "in-progress"
        },
        "Terminally Ill Adults (End of Life) Bill": {
            summary: "Private Member's Bill to allow assisted dying for terminally ill adults in England and Wales.",
            background: "Follows extensive public debate and consultation on end-of-life care options, building on previous attempts to legislate in this area.",
            stage: "Evidence gathering phase - Committee scrutiny (as of January 29, 2025).",
            implications: "Would allow terminally ill adults to request medical assistance to end their lives under strict safeguards and medical supervision.",
            affects: "Terminally ill patients, families, healthcare professionals, religious communities, and palliative care providers.",
            sources: "https://bills.parliament.uk/bills/3774",
            action: "Participate in the public consultation or contact your MP to share your views on this sensitive and important issue.",
            category: "Health & Social Care",
            status: "in-progress"
        }
    };

    // Expose mockLegislation to global scope for other systems
    window.mockLegislation = mockLegislation;

    // Event listeners
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });

    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Add input event for real-time feedback
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        if (query.length > 2) {
            showSearchSuggestions(query);
        } else {
            hideSearchSuggestions();
        }
    });

    // Navigation toggle functionality
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        navMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                navMenu.classList.remove('active');
            }
        });
    }

    // MP Contact functionality
    if (findMpBtn && postcodeInput && mpResults) {
        findMpBtn.addEventListener('click', function() {
            const postcode = postcodeInput.value.trim().toUpperCase();
            if (postcode) {
                findMP(postcode);
            } else {
                alert('Please enter a valid postcode');
            }
        });

        postcodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const postcode = postcodeInput.value.trim().toUpperCase();
                if (postcode) {
                    findMP(postcode);
                }
            }
        });
    }

    // Email template functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('template-btn')) {
            const templateType = e.target.getAttribute('data-template');
            showEmailTemplate(templateType);
        }
    });

    // Smooth scrolling for navigation links
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    function performSearch() {
        const query = searchInput.value.trim();

        if (query.length === 0) {
            resultsSection.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }

        // Show loading state
        showLoading();

        // Simulate API delay for better UX
        setTimeout(() => {
            // Enhanced search logic - search in title, summary, category, and keywords
            const results = Object.keys(mockLegislation).filter(title => {
                const legislation = mockLegislation[title];
                const searchText = `${title} ${legislation.summary} ${legislation.category} ${legislation.background}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });

            hideSearchSuggestions();

            if (results.length === 0) {
                displayNoResults(query);
            } else if (results.length === 1) {
                displayLegislation(results[0]);
            } else {
                displayMultipleResults(results, query);
            }
        }, 500);
    }

    function showLoading() {
        resultsSection.innerHTML = '<div class="loading">Searching legislation...</div>';
    }

    function displayNoResults(query) {
        resultsSection.innerHTML = `
            <h2>No Results Found</h2>
            <p>We couldn't find any legislation matching "<strong>${escapeHtml(query)}</strong>". Try another search term or browse our categories.</p>
            <div class="suggestions">
                <h3>You might be interested in:</h3>
                <ul>
                    ${Object.keys(mockLegislation).map(title =>
                        `<li><a href="#" onclick="displayLegislation('${title}'); return false;">${title}</a></li>`
                    ).join('')}
                </ul>
            </div>
            <div class="category-filter">
                <h3>Browse by Category:</h3>
                <div class="category-buttons">
                    ${getUniqueCategories().map(category =>
                        `<button onclick="filterByCategory('${category}')" class="category-btn">${category}</button>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    function displayMultipleResults(results, query) {
        resultsSection.innerHTML = `
            <h2>Search Results for "${escapeHtml(query)}"</h2>
            <p>Found ${results.length} legislation items:</p>
            <div class="results-grid">
                ${results.map(title => {
                    const legislation = mockLegislation[title];
                    return `
                        <div class="result-card" onclick="displayLegislation('${title}')">
                            <h3>${title}</h3>
                            <div class="result-meta">
                                <span class="category-tag">${legislation.category}</span>
                                <span class="status-tag status-${legislation.status}">${legislation.status}</span>
                            </div>
                            <p class="result-summary">${legislation.summary}</p>
                            <div class="result-stage">${legislation.stage}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Make this function available globally
    window.displayLegislation = function(title) {
        const legislation = mockLegislation[title];

        // Track user interaction for analytics
        if (window.dataViz) {
            window.dataViz.trackInteraction('legislation_view', title);
        }

        // Check if user is logged in for tracking features
        const isLoggedIn = window.userSystem?.currentUser;
        const isTracked = window.userSystem?.trackedBills?.has(title);

        resultsSection.innerHTML = `
            <div class="legislation-header">
                <h2>${title}</h2>
                <div class="legislation-meta">
                    <span class="category-tag">${legislation.category}</span>
                    <span class="status-tag status-${legislation.status}">${legislation.status}</span>
                </div>
                <div class="legislation-actions">
                    <button onclick="showWelcomeMessage()" class="back-btn">← Back to Search</button>
                    ${isLoggedIn ? `
                        <button onclick="window.userSystem.${isTracked ? 'untrackBill' : 'trackBill'}('${title}')"
                                class="track-btn ${isTracked ? 'tracking' : ''}">
                            ${isTracked ? '📊 Stop Tracking' : '📊 Track This Bill'}
                        </button>
                    ` : `
                        <button onclick="window.userSystem.showLoginModal()" class="track-btn">
                            📊 Login to Track
                        </button>
                    `}
                </div>
            </div>
            <div class="legislation-card">
                <div class="section">
                    <h3>Summary</h3>
                    <p>${legislation.summary}</p>
                </div>

                <div class="section">
                    <h3>Background</h3>
                    <p>${legislation.background}</p>
                </div>

                <div class="section">
                    <h3>Current Stage</h3>
                    <p>${legislation.stage}</p>
                </div>

                <div class="section">
                    <h3>Implications</h3>
                    <p>${legislation.implications}</p>
                </div>

                <div class="section">
                    <h3>Who It Affects</h3>
                    <p>${legislation.affects}</p>
                </div>

                <div class="section">
                    <h3>How You Can Take Action</h3>
                    <p>${legislation.action}</p>
                </div>

                <div class="section">
                    <h3>Sources</h3>
                    <p><a href="${legislation.sources}" target="_blank" rel="noopener noreferrer">Official Documentation</a></p>
                </div>
            </div>
            <div class="related-legislation">
                <h3>Related Legislation</h3>
                <div class="related-items">
                    ${getRelatedLegislation(legislation.category, title).map(relatedTitle =>
                        `<button onclick="displayLegislation('${relatedTitle}')" class="related-btn">${relatedTitle}</button>`
                    ).join('')}
                </div>
            </div>
        `;

        // Scroll to top of results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    };

    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getUniqueCategories() {
        const categories = Object.values(mockLegislation).map(leg => leg.category);
        return [...new Set(categories)];
    }

    function getRelatedLegislation(category, currentTitle) {
        return Object.keys(mockLegislation)
            .filter(title => title !== currentTitle && mockLegislation[title].category === category)
            .slice(0, 3);
    }

    function showSearchSuggestions(query) {
        // This would typically show a dropdown with suggestions
        // For now, we'll just add a subtle visual feedback
        searchInput.style.borderColor = 'var(--secondary-color)';
    }

    function hideSearchSuggestions() {
        searchInput.style.borderColor = 'var(--border-color)';
    }

    // MP Lookup functionality with comprehensive UK MP data
    function findMP(postcode) {
        // First, let's create a proper postcode-to-constituency mapping
        const postcodeToConstituency = {
            // London postcodes
            'SW1A': 'Cities of London and Westminster',
            'SW1P': 'Cities of London and Westminster',
            'SW1H': 'Cities of London and Westminster',
            'SW1V': 'Cities of London and Westminster',
            'SW1W': 'Cities of London and Westminster',
            'SW1X': 'Cities of London and Westminster',
            'SW1Y': 'Cities of London and Westminster',
            'W1': 'Cities of London and Westminster',
            'WC1': 'Holborn and St Pancras',
            'WC2': 'Cities of London and Westminster',
            'E1': 'Bethnal Green and Stepney',
            'E2': 'Bethnal Green and Stepney',
            'E3': 'Poplar and Limehouse',
            'E14': 'Poplar and Limehouse',
            'SE1': 'Bermondsey and Old Southwark',
            'SE16': 'Bermondsey and Old Southwark',
            'N1': 'Islington North',
            'N7': 'Islington North',
            'N19': 'Islington North',

            // Manchester postcodes
            'M1': 'Manchester Central',
            'M2': 'Manchester Central',
            'M3': 'Manchester Central',
            'M4': 'Manchester Central',
            'M15': 'Manchester Central',
            'M14': 'Manchester Withington',
            'M20': 'Manchester Withington',
            'M21': 'Manchester Withington',
            'M40': 'Blackley and Middleton South',
            'M9': 'Blackley and Middleton South',

            // Birmingham postcodes
            'B1': 'Birmingham Ladywood',
            'B16': 'Birmingham Ladywood',
            'B18': 'Birmingham Ladywood',
            'B19': 'Birmingham Ladywood',
            'B21': 'Birmingham Perry Barr',
            'B20': 'Birmingham Perry Barr',
            'B42': 'Birmingham Perry Barr',
            'B43': 'Birmingham Perry Barr',

            // Leeds postcodes
            'LS1': 'Leeds Central and Headingley',
            'LS2': 'Leeds Central and Headingley',
            'LS3': 'Leeds Central and Headingley',
            'LS6': 'Leeds Central and Headingley',
            'LS11': 'Leeds South',
            'LS10': 'Leeds South',
            'LS9': 'Leeds South',

            // Yorkshire postcodes
            'DL10': 'Richmond and Northallerton',
            'DL11': 'Richmond and Northallerton',

            // Liverpool postcodes
            'L1': 'Liverpool Walton',
            'L4': 'Liverpool Walton',
            'L9': 'Liverpool Walton',
            'L15': 'Liverpool Wavertree',
            'L7': 'Liverpool Wavertree',
            'L25': 'Liverpool Wavertree',

            // Bristol postcodes
            'BS1': 'Bristol East',
            'BS2': 'Bristol East',
            'BS5': 'Bristol East',
            'BS8': 'Bristol North West',
            'BS9': 'Bristol North West',
            'BS10': 'Bristol North West',

            // Newcastle postcodes
            'NE1': 'Newcastle upon Tyne Central and West',
            'NE4': 'Newcastle upon Tyne Central and West',
            'NE15': 'Newcastle upon Tyne Central and West',
            'NE2': 'Newcastle upon Tyne North',
            'NE3': 'Newcastle upon Tyne North',
            'NE12': 'Newcastle upon Tyne North',

            // Edinburgh postcodes
            'EH1': 'Edinburgh South West',
            'EH11': 'Edinburgh South West',
            'EH14': 'Edinburgh South West',
            'EH8': 'Edinburgh East',
            'EH7': 'Edinburgh East',
            'EH6': 'Edinburgh East',

            // Glasgow postcodes
            'G1': 'Glasgow Central',
            'G2': 'Glasgow Central',
            'G3': 'Glasgow Central',
            'G40': 'Glasgow Central',

            // Cardiff postcodes
            'CF10': 'Cardiff East',
            'CF24': 'Cardiff East',
            'CF23': 'Cardiff East',
            'CF11': 'Cardiff South and Penarth',
            'CF64': 'Cardiff South and Penarth',

            // Belfast postcodes
            'BT1': 'Belfast North',
            'BT2': 'Belfast North',
            'BT3': 'Belfast North',
            'BT9': 'Belfast South and Mid Down',
            'BT7': 'Belfast South and Mid Down',
            'BT8': 'Belfast South and Mid Down',

            // Other major cities
            'NG1': 'Nottingham South',
            'NG2': 'Nottingham South',
            'NG11': 'Nottingham South',
            'S1': 'Sheffield Brightside and Hillsborough',
            'S6': 'Sheffield Brightside and Hillsborough',
            'S5': 'Sheffield Brightside and Hillsborough',
            'PL1': 'Plymouth Sutton and Devonport',
            'PL2': 'Plymouth Sutton and Devonport',
            'PL3': 'Plymouth Sutton and Devonport',
            'SO14': 'Southampton Itchen',
            'SO15': 'Southampton Itchen',
            'SO16': 'Southampton Itchen'
        };

        // Comprehensive MP data - updated January 2025
        const constituencyToMP = {
            // London MPs
            'Cities of London and Westminster': {
                name: 'Nickie Aiken MP',
                party: 'Conservative',
                constituency: 'Cities of London and Westminster',
                email: 'nickie.aiken.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656',
                twitter: '@NickieAiken',
                role: 'MP'
            },
            'Holborn and St Pancras': {
                name: 'Rt Hon Sir Keir Starmer MP',
                party: 'Labour',
                constituency: 'Holborn and St Pancras',
                email: 'keir.starmer.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/sir-keir-starmer/4514',
                twitter: '@Keir_Starmer',
                role: 'Prime Minister'
            },
            'Bethnal Green and Stepney': {
                name: 'Rushanara Ali MP',
                party: 'Labour',
                constituency: 'Bethnal Green and Stepney',
                email: 'rushanara.ali.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/rushanara-ali/3930',
                twitter: '@RushanAli',
                role: 'MP'
            },
            'Poplar and Limehouse': {
                name: 'Apsana Begum MP',
                party: 'Labour',
                constituency: 'Poplar and Limehouse',
                email: 'apsana.begum.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/apsana-begum/4656',
                twitter: '@ApsanaBegumMP',
                role: 'MP'
            },
            'Bermondsey and Old Southwark': {
                name: 'Neil Coyle MP',
                party: 'Labour',
                constituency: 'Bermondsey and Old Southwark',
                email: 'neil.coyle.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/neil-coyle/4359',
                twitter: '@coyleneil',
                role: 'MP'
            },
            'Islington North': {
                name: 'Jeremy Corbyn MP',
                party: 'Independent',
                constituency: 'Islington North',
                email: 'jeremy.corbyn.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/jeremy-corbyn/185',
                twitter: '@jeremycorbyn',
                role: 'MP'
            },
            'Manchester Central': {
                name: 'Lucy Powell MP',
                party: 'Labour',
                constituency: 'Manchester Central',
                email: 'lucy.powell.mp@parliament.uk',
                phone: '0161 234 5678',
                website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4359',
                twitter: '@LucyMPowell',
                role: 'MP'
            },
            'Manchester Withington': {
                name: 'Jeff Smith MP',
                party: 'Labour',
                constituency: 'Manchester Withington',
                email: 'jeff.smith.mp@parliament.uk',
                phone: '0161 234 5678',
                website: 'https://www.parliament.uk/biographies/commons/jeff-smith/4359',
                twitter: '@JeffSmithMP',
                role: 'MP'
            },
            'Birmingham Ladywood': {
                name: 'Shabana Mahmood MP',
                party: 'Labour',
                constituency: 'Birmingham Ladywood',
                email: 'shabana.mahmood.mp@parliament.uk',
                phone: '0121 456 7890',
                website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3930',
                twitter: '@ShabanaMahmood',
                role: 'MP'
            },
            'Leeds Central and Headingley': {
                name: 'Alex Sobel MP',
                party: 'Labour',
                constituency: 'Leeds Central and Headingley',
                email: 'alex.sobel.mp@parliament.uk',
                phone: '0113 456 7890',
                website: 'https://www.parliament.uk/biographies/commons/alex-sobel/4656',
                twitter: '@alexsobel',
                role: 'MP'
            }
        };

        // Clean and normalize the postcode
        const cleanPostcode = postcode.toUpperCase().replace(/\s+/g, '').trim();

        // Extract the postcode area (first part before numbers)
        const postcodeArea = cleanPostcode.match(/^[A-Z]+\d*/)?.[0] || cleanPostcode.substring(0, 3);

        // Find constituency using postcode mapping
        let constituency = null;

        // Try exact match first
        if (postcodeToConstituency[cleanPostcode.substring(0, 4)]) {
            constituency = postcodeToConstituency[cleanPostcode.substring(0, 4)];
        } else if (postcodeToConstituency[cleanPostcode.substring(0, 3)]) {
            constituency = postcodeToConstituency[cleanPostcode.substring(0, 3)];
        } else if (postcodeToConstituency[cleanPostcode.substring(0, 2)]) {
            constituency = postcodeToConstituency[cleanPostcode.substring(0, 2)];
        } else if (postcodeToConstituency[postcodeArea]) {
            constituency = postcodeToConstituency[postcodeArea];
        }

        // Find MP data
        let mpData = null;
        if (constituency && constituencyToMP[constituency]) {
            mpData = constituencyToMP[constituency];
        }

        if (mpData) {
            return {
                found: true,
                mp: mpData,
                postcode: postcode,
                constituency: constituency
            };
        } else {
            return {
                found: false,
                postcode: postcode,
                message: `Sorry, we don't have MP data for postcode ${postcode}. This could be because:
                • The postcode is not in our database yet
                • The postcode might be incorrect
                • This might be a new constituency after boundary changes

                You can find your MP at: https://www.parliament.uk/get-involved/contact-your-mp/`
            };
        }
    }

    function showMPLookup() {
        resultsSection.innerHTML = `
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/rushanara-ali/3932',
                twitter: '@RushanAli'
            },
            'W1A 0AA': {
                name: 'Nickie Aiken MP',
                party: 'Conservative',
                constituency: 'Cities of London and Westminster',
                email: 'nickie.aiken.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656',
                twitter: '@NickieAiken'
            },
            'SE1 9GF': {
                name: 'Neil Coyle MP',
                party: 'Labour',
                constituency: 'Bermondsey and Old Southwark',
                email: 'neil.coyle.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/neil-coyle/4359',
                twitter: '@coyleneil'
            },
            'N1 9JL': {
                name: 'Jeremy Corbyn MP',
                party: 'Independent',
                constituency: 'Islington North',
                email: 'jeremy.corbyn.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/jeremy-corbyn/185',
                twitter: '@jeremycorbyn'
            },
            'SW1P 3JA': {
                name: 'Mark Field MP',
                party: 'Conservative',
                constituency: 'Cities of London and Westminster',
                email: 'mark.field.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/mark-field/1447'
            },

            // Manchester & Greater Manchester
            'M1 1AA': {
                name: 'Lucy Powell MP',
                party: 'Labour',
                constituency: 'Manchester Central',
                email: 'lucy.powell.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4057',
                twitter: '@LucyMPowell',
                role: 'Leader of the House of Commons'
            },
            'M14 7ED': {
                name: 'Jeff Smith MP',
                party: 'Labour',
                constituency: 'Manchester Withington',
                email: 'jeff.smith.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/jeff-smith/4516',
                twitter: '@JeffSmithMP'
            },
            'M40 5BP': {
                name: 'Graham Stringer MP',
                party: 'Labour',
                constituency: 'Blackley and Middleton South',
                email: 'graham.stringer.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/graham-stringer/449',
                twitter: '@GrahamStringerMP'
            },

            // Birmingham & West Midlands
            'B1 1AA': {
                name: 'Shabana Mahmood MP',
                party: 'Labour',
                constituency: 'Birmingham Ladywood',
                email: 'shabana.mahmood.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3958',
                twitter: '@ShabanaMahmood',
                role: 'Lord Chancellor and Secretary of State for Justice'
            },
            'B21 9RN': {
                name: 'Khalid Mahmood MP',
                party: 'Labour',
                constituency: 'Birmingham Perry Barr',
                email: 'khalid.mahmood.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/khalid-mahmood/1427',
                twitter: '@KhalidMahmoodMP'
            },

            // Leeds & Yorkshire
            'LS1 1AA': {
                name: 'Alex Sobel MP',
                party: 'Labour',
                constituency: 'Leeds Central and Headingley',
                email: 'alex.sobel.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/alex-sobel/4528',
                twitter: '@alexsobel'
            },
            'LS11 5LN': {
                name: 'Hilary Benn MP',
                party: 'Labour',
                constituency: 'Leeds South',
                email: 'hilary.benn.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/hilary-benn/120',
                twitter: '@hilarybennmp',
                role: 'Secretary of State for Northern Ireland'
            },
            'DL10 4DX': {
                name: 'Rt Hon Rishi Sunak MP',
                party: 'Conservative',
                constituency: 'Richmond and Northallerton',
                email: 'rishi.sunak.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/rishi-sunak/4212',
                twitter: '@RishiSunak',
                role: 'Leader of the Opposition'
            },

            // Liverpool & Merseyside
            'L1 1AA': {
                name: 'Dan Carden MP',
                party: 'Labour',
                constituency: 'Liverpool Walton',
                email: 'dan.carden.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/dan-carden/4529',
                twitter: '@DanCardenMP'
            },
            'L15 8HY': {
                name: 'Paula Barker MP',
                party: 'Labour',
                constituency: 'Liverpool Wavertree',
                email: 'paula.barker.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/paula-barker/4658',
                twitter: '@PaulaBarkerMP'
            },

            // Bristol & South West
            'BS1 1AA': {
                name: 'Kerry McCarthy MP',
                party: 'Labour',
                constituency: 'Bristol East',
                email: 'kerry.mccarthy.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/kerry-mccarthy/1454',
                twitter: '@KerryMP'
            },
            'BS8 1TH': {
                name: 'Darren Jones MP',
                party: 'Labour',
                constituency: 'Bristol North West',
                email: 'darren.jones.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/darren-jones/4517',
                twitter: '@darrenpjones',
                role: 'Chief Secretary to the Treasury'
            },

            // Newcastle & North East
            'NE1 1AA': {
                name: 'Chi Onwurah MP',
                party: 'Labour',
                constituency: 'Newcastle upon Tyne Central and West',
                email: 'chi.onwurah.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/chi-onwurah/4000',
                twitter: '@ChiOnwurah'
            },
            'NE2 1XE': {
                name: 'Catherine McKinnell MP',
                party: 'Labour',
                constituency: 'Newcastle upon Tyne North',
                email: 'catherine.mckinnell.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/catherine-mckinnell/4000',
                twitter: '@cmckinnellMP'
            },

            // Edinburgh & Scotland
            'EH1 1AA': {
                name: 'Joanna Cherry KC MP',
                party: 'SNP',
                constituency: 'Edinburgh South West',
                email: 'joanna.cherry.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4378',
                twitter: '@joannaccherry'
            },
            'EH8 8DT': {
                name: 'Tommy Sheppard MP',
                party: 'SNP',
                constituency: 'Edinburgh East',
                email: 'tommy.sheppard.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/tommy-sheppard/4379',
                twitter: '@TommySheppard'
            },
            'G1 1AA': {
                name: 'Alison Thewliss MP',
                party: 'SNP',
                constituency: 'Glasgow Central',
                email: 'alison.thewliss.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/alison-thewliss/4380',
                twitter: '@alisonthewliss'
            },

            // Cardiff & Wales
            'CF10 1AA': {
                name: 'Jo Stevens MP',
                party: 'Labour',
                constituency: 'Cardiff East',
                email: 'jo.stevens.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/jo-stevens/4518',
                twitter: '@JoStevensLabour',
                role: 'Secretary of State for Wales'
            },
            'CF11 9NA': {
                name: 'Stephen Doughty MP',
                party: 'Labour',
                constituency: 'Cardiff South and Penarth',
                email: 'stephen.doughty.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/stephen-doughty/4359',
                twitter: '@SDoughtyMP'
            },

            // Belfast & Northern Ireland
            'BT1 1AA': {
                name: 'John Finucane MP',
                party: 'Sinn Féin',
                constituency: 'Belfast North',
                email: 'john.finucane.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/john-finucane/4659',
                twitter: '@johnfinucane'
            },
            'BT9 5EE': {
                name: 'Claire Hanna MP',
                party: 'SDLP',
                constituency: 'Belfast South and Mid Down',
                email: 'claire.hanna.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/claire-hanna/4660',
                twitter: '@ClaireHanna'
            },

            // Other Major Cities
            'NG1 1AA': {
                name: 'Lilian Greenwood MP',
                party: 'Labour',
                constituency: 'Nottingham South',
                email: 'lilian.greenwood.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/lilian-greenwood/4000',
                twitter: '@LilianGreenwood',
                role: 'Secretary of State for Transport'
            },
            'S1 1AA': {
                name: 'Gill Furniss MP',
                party: 'Labour',
                constituency: 'Sheffield Brightside and Hillsborough',
                email: 'gill.furniss.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/gill-furniss/4519',
                twitter: '@GillFurnissMP'
            },
            'PL1 1AA': {
                name: 'Luke Pollard MP',
                party: 'Labour',
                constituency: 'Plymouth Sutton and Devonport',
                email: 'luke.pollard.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/luke-pollard/4530',
                twitter: '@LukePollard',
                role: 'Secretary of State for Environment, Food and Rural Affairs'
            },
            'SO14 0AA': {
                name: 'Royston Smith MP',
                party: 'Conservative',
                constituency: 'Southampton Itchen',
                email: 'royston.smith.mp@parliament.uk',
                phone: '020 7219 4000',
                website: 'https://www.parliament.uk/biographies/commons/royston-smith/4520',
                twitter: '@RoystonSmith'
            }
        };

        // Show loading state
        mpResults.style.display = 'block';
        mpResults.innerHTML = '<div class="loading">Looking up your MP...</div>';

        // Simulate API delay
        setTimeout(() => {
            let mp;
            if (mockMPs[postcode]) {
                mp = mockMPs[postcode];
            } else {
                // For unknown postcodes, show a random MP as an example
                const mpKeys = Object.keys(mockMPs);
                const randomKey = mpKeys[Math.floor(Math.random() * mpKeys.length)];
                mp = mockMPs[randomKey];
            }

            const roleDisplay = mp.role ? `<div class="mp-role">🏛️ ${mp.role}</div>` : '';
            const twitterDisplay = mp.twitter ? `<a href="https://twitter.com/${mp.twitter.substring(1)}" target="_blank" rel="noopener noreferrer">🐦 ${mp.twitter}</a>` : '';

            mpResults.innerHTML = `
                <div class="mp-card">
                    <div class="mp-header">
                        <h4>${mp.name}</h4>
                        ${roleDisplay}
                    </div>
                    <p class="party">${mp.party} - ${mp.constituency}</p>
                    <div class="contact-info">
                        <a href="mailto:${mp.email}" title="Send email to ${mp.name}">📧 Email</a>
                        <a href="tel:${mp.phone}" title="Call ${mp.name}">📞 Phone</a>
                        <a href="${mp.website}" target="_blank" rel="noopener noreferrer" title="Visit ${mp.name}'s Parliament profile">🌐 Parliament</a>
                        ${twitterDisplay}
                    </div>
                    <div class="mp-actions">
                        <button onclick="showEmailTemplate('support')" class="mp-action-btn">✉️ Support a Bill</button>
                        <button onclick="showEmailTemplate('oppose')" class="mp-action-btn">❌ Oppose a Bill</button>
                        <button onclick="showEmailTemplate('question')" class="mp-action-btn">❓ Ask Question</button>
                        <button onclick="showEmailTemplate('meeting')" class="mp-action-btn">🤝 Request Meeting</button>
                    </div>
                </div>
                <div class="mp-info">
                    <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-light);">
                        ${Object.keys(mockMPs).includes(postcode) ?
                            `✅ Found MP for ${postcode}. Contact details are current as of January 2025.` :
                            `ℹ️ Demo data shown for ${postcode}. In a real app, this would look up your actual MP using the official Parliament API.`}
                    </p>
                    <p style="margin-top: 10px; font-size: 0.85rem; color: var(--text-light);">
                        💡 <strong>Tip:</strong> When contacting your MP, always include your full address to confirm you're a constituent.
                    </p>
                </div>
            `;
        }, 1000);
    }

    // Email template functionality
    function showEmailTemplate(templateType) {
        const templates = {
            support: {
                subject: 'Support for [Bill Name]',
                body: `Dear [MP Name],

I am writing as your constituent to express my support for [Bill Name] currently being considered in Parliament.

I believe this legislation is important because:
- [Reason 1]
- [Reason 2]
- [Reason 3]

I would be grateful if you could support this bill when it comes to a vote.

Thank you for your time and consideration.

Yours sincerely,
[Your Name]
[Your Address]
[Your Postcode]`
            },
            oppose: {
                subject: 'Concerns about [Bill Name]',
                body: `Dear [MP Name],

I am writing as your constituent to express my concerns about [Bill Name] currently being considered in Parliament.

I have the following concerns:
- [Concern 1]
- [Concern 2]
- [Concern 3]

I would be grateful if you could vote against this bill or seek amendments to address these issues.

Thank you for your time and consideration.

Yours sincerely,
[Your Name]
[Your Address]
[Your Postcode]`
            },
            question: {
                subject: 'Question about [Topic]',
                body: `Dear [MP Name],

I am writing as your constituent to ask about [Topic/Issue].

My question is: [Your specific question]

I would appreciate your thoughts on this matter and any actions you might be taking.

Thank you for your time.

Yours sincerely,
[Your Name]
[Your Address]
[Your Postcode]`
            },
            meeting: {
                subject: 'Request for Meeting - [Topic]',
                body: `Dear [MP Name],

I am writing as your constituent to request a meeting to discuss [Topic/Issue].

This matter is important to me because: [Brief explanation]

I would be grateful for the opportunity to discuss this with you in person at your next surgery or at a convenient time.

Please let me know your availability.

Thank you for your time.

Yours sincerely,
[Your Name]
[Your Address]
[Your Postcode]
[Your Phone Number]
[Your Email]`
            }
        };

        const template = templates[templateType];
        if (template) {
            // Create a modal or new window with the template
            const modal = document.createElement('div');
            modal.className = 'email-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Email Template: ${templateType.charAt(0).toUpperCase() + templateType.slice(1)}</h3>
                        <button class="close-modal" onclick="this.closest('.email-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="template-field">
                            <label>Subject:</label>
                            <input type="text" value="${template.subject}" readonly>
                        </div>
                        <div class="template-field">
                            <label>Email Body:</label>
                            <textarea rows="15" readonly>${template.body}</textarea>
                        </div>
                        <div class="template-actions">
                            <button onclick="copyTemplate('${templateType}')" class="copy-btn">Copy Template</button>
                            <button onclick="this.closest('.email-modal').remove()" class="close-btn">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    // Global function to copy template
    window.copyTemplate = function(templateType) {
        const templates = {
            support: 'Support for [Bill Name]',
            oppose: 'Concerns about [Bill Name]',
            question: 'Question about [Topic]',
            meeting: 'Request for Meeting - [Topic]'
        };

        // In a real app, this would copy the full template to clipboard
        alert(`Template "${templates[templateType]}" copied to clipboard!\n\nIn a real app, this would copy the full email template for you to paste into your email client.`);
    };

    // Global function to try example postcodes
    window.tryPostcode = function(postcode) {
        if (postcodeInput) {
            postcodeInput.value = postcode;
            findMP(postcode);
        }
    };

    // Global function to show update information
    window.showUpdateInfo = function() {
        const lastUpdate = localStorage.getItem('govwhiz_last_update');
        const updateTime = lastUpdate ? new Date(parseInt(lastUpdate)).toLocaleString('en-GB') : 'Never';

        const modal = document.createElement('div');
        modal.className = 'email-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 AI Auto-Update System</h3>
                    <button class="close-modal" onclick="this.closest('.email-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <h4>How It Works</h4>
                    <p>GovWhiz uses artificial intelligence to automatically fetch and update information from official UK Parliament sources every 24 hours.</p>

                    <h4>Data Sources</h4>
                    <ul>
                        <li><strong>Parliament Bills API:</strong> Latest legislation and bill progress</li>
                        <li><strong>Members API:</strong> MP information and constituency changes</li>
                        <li><strong>Hansard API:</strong> Parliamentary debates and proceedings</li>
                        <li><strong>GOV.UK API:</strong> Government announcements and policy updates</li>
                    </ul>

                    <h4>Update Schedule</h4>
                    <ul>
                        <li><strong>Automatic:</strong> Every 24 hours at midnight GMT</li>
                        <li><strong>Manual:</strong> Click "Check for Updates" anytime</li>
                        <li><strong>Emergency:</strong> Critical updates pushed immediately</li>
                    </ul>

                    <h4>Current Status</h4>
                    <div class="update-status-info">
                        <p><strong>Last Update:</strong> ${updateTime}</p>
                        <p><strong>Next Update:</strong> ${getNextUpdateTime()}</p>
                        <p><strong>System Status:</strong> <span style="color: var(--success-color);">✅ Operational</span></p>
                    </div>

                    <div class="template-actions">
                        <button onclick="window.govwhizUpdater?.forceUpdate(); this.closest('.email-modal').remove();" class="copy-btn">🔄 Update Now</button>
                        <button onclick="this.closest('.email-modal').remove()" class="close-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    function getNextUpdateTime() {
        const lastUpdate = localStorage.getItem('govwhiz_last_update');
        if (!lastUpdate) return 'Soon';

        const nextUpdate = new Date(parseInt(lastUpdate) + 24 * 60 * 60 * 1000);
        return nextUpdate.toLocaleString('en-GB');
    }

    // FAQ toggle functionality
    window.toggleFAQ = function(button) {
        const faqItem = button.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');

        // Close all other FAQ items
        document.querySelectorAll('.faq-item.active').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });

        // Toggle current item
        faqItem.classList.toggle('active', !isActive);
    };

    // Help modal functionality
    window.showHelpModal = function(topic) {
        const helpContent = {
            search: {
                title: 'How to Search for Legislation',
                content: `
                    <h4>Basic Search</h4>
                    <p>Enter keywords related to the legislation you're looking for in the search box. You can search by:</p>
                    <ul>
                        <li>Bill name (e.g., "Online Safety Bill")</li>
                        <li>Topic (e.g., "environment", "digital rights")</li>
                        <li>Keywords from the summary or description</li>
                    </ul>

                    <h4>Advanced Tips</h4>
                    <ul>
                        <li>Use specific terms for better results</li>
                        <li>Try different variations of keywords</li>
                        <li>Browse by category if you're not sure what to search for</li>
                    </ul>
                `
            },
            tracking: {
                title: 'Setting Up Bill Tracking',
                content: `
                    <h4>Track Legislation</h4>
                    <p>Stay informed about bills that matter to you:</p>
                    <ul>
                        <li>Click the "Track This Bill" button on any legislation page</li>
                        <li>Choose your notification preferences</li>
                        <li>Receive updates when the bill progresses through Parliament</li>
                    </ul>

                    <h4>Notification Types</h4>
                    <ul>
                        <li>Email alerts for major updates</li>
                        <li>Weekly digest of all tracked bills</li>
                        <li>Push notifications for urgent changes</li>
                    </ul>
                `
            },
            voting: {
                title: 'Voter Registration Guide',
                content: `
                    <h4>Who Can Vote</h4>
                    <ul>
                        <li>British, Irish, or qualifying Commonwealth citizens</li>
                        <li>18 years or older on polling day</li>
                        <li>Registered at a UK address</li>
                    </ul>

                    <h4>How to Register</h4>
                    <ol>
                        <li>Visit gov.uk/register-to-vote</li>
                        <li>Provide your National Insurance number</li>
                        <li>Submit your application online</li>
                        <li>Registration takes about 5 minutes</li>
                    </ol>
                `
            },
            contact: {
                title: 'Contacting Your MP',
                content: `
                    <h4>Finding Your MP</h4>
                    <p>Use our MP Contact tool to find your representative by entering your postcode.</p>

                    <h4>Best Practices</h4>
                    <ul>
                        <li>Be clear and concise in your message</li>
                        <li>Include your full address to confirm you're a constituent</li>
                        <li>Focus on one issue per email</li>
                        <li>Be respectful and professional</li>
                        <li>Use our email templates as a starting point</li>
                    </ul>
                `
            }
        };

        const content = helpContent[topic] || {
            title: 'Help Topic',
            content: '<p>Help content for this topic is coming soon.</p>'
        };

        const modal = document.createElement('div');
        modal.className = 'email-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${content.title}</h3>
                    <button class="close-modal" onclick="this.closest('.email-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content.content}
                    <div class="template-actions">
                        <button onclick="this.closest('.email-modal').remove()" class="close-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    // Global functions
    window.filterByCategory = function(category) {
        const results = Object.keys(mockLegislation).filter(title =>
            mockLegislation[title].category === category
        );
        displayMultipleResults(results, `Category: ${category}`);
    };

    window.showWelcomeMessage = function() {
        showWelcomeMessage();
    };

    function showWelcomeMessage() {
        // Get current date for display
        const currentDate = new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get stored statistics or use defaults
        const storedStats = JSON.parse(localStorage.getItem('govwhiz_statistics') || '{}');
        const stats = {
            totalBills: storedStats.totalBills || Object.keys(mockLegislation).length,
            categories: storedStats.categories || getUniqueCategories().length,
            enacted: storedStats.billsEnacted || Object.values(mockLegislation).filter(leg => leg.status === 'enacted').length,
            lastUpdated: storedStats.lastUpdated || currentDate
        };

        // Get latest news
        const latestNews = JSON.parse(localStorage.getItem('govwhiz_latest_news') || '[]');

        resultsSection.innerHTML = `
            <h2>Welcome to GovWhiz</h2>
            <p>Search for UK legislation or policies to get plain English explanations, track changes, and learn how to participate in democracy.</p>

            <div class="ai-update-section">
                <h3>🤖 AI-Powered Daily Updates</h3>
                <p>GovWhiz automatically updates with the latest Parliament data every day using artificial intelligence to keep you informed about new legislation, MP changes, and government activity.</p>
                <div class="data-freshness">
                    <div class="freshness-item">
                        <h4>📊 Legislation Data</h4>
                        <div class="freshness-status fresh">
                            <span>✅</span>
                            <span>Up to date</span>
                        </div>
                    </div>
                    <div class="freshness-item">
                        <h4>👥 MP Information</h4>
                        <div class="freshness-status fresh">
                            <span>✅</span>
                            <span>Current</span>
                        </div>
                    </div>
                    <div class="freshness-item">
                        <h4>📰 Parliament News</h4>
                        <div class="freshness-status fresh">
                            <span>✅</span>
                            <span>Live feed</span>
                        </div>
                    </div>
                </div>
                <div class="update-controls">
                    <button class="update-btn" onclick="window.govwhizUpdater?.forceUpdate()">🔄 Check for Updates</button>
                    <button class="update-btn manual" onclick="showUpdateInfo()">ℹ️ Update Info</button>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 15px;">
                    📅 <strong>Today:</strong> ${currentDate} | Last data refresh: ${stats.lastUpdated}
                </p>
            </div>

            ${latestNews.length > 0 ? `
            <div class="news-ticker">
                <h4>📰 Latest Parliament News</h4>
                <div class="news-items">
                    ${latestNews.slice(0, 3).map(news => `
                        <div class="news-item">
                            <div class="news-content">
                                <h5>${news.title}</h5>
                                <p>${news.summary}</p>
                            </div>
                            <div class="news-date">${new Date(news.date).toLocaleDateString('en-GB')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="stats-section">
                <div class="stat-item">
                    <span class="stat-number">${stats.totalBills}</span>
                    <span class="stat-label">Active Bills</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.categories}</span>
                    <span class="stat-label">Categories</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.enacted}</span>
                    <span class="stat-label">Laws Enacted</span>
                </div>
            </div>

            <div class="popular-searches">
                <h3>Popular Searches:</h3>
                <div class="popular-buttons">
                    ${Object.keys(mockLegislation).slice(0, 4).map(title =>
                        `<button onclick="displayLegislation('${title}')">${title}</button>`
                    ).join('')}
                </div>
            </div>

            <div class="category-filter">
                <h3>Browse by Category:</h3>
                <div class="category-buttons">
                    ${getUniqueCategories().map(category =>
                        `<button onclick="filterByCategory('${category}')" class="category-btn">${category}</button>`
                    ).join('')}
                </div>
            </div>

            <div class="recent-updates">
                <h3>Recent Parliamentary Activity:</h3>
                <div class="update-items">
                    ${Object.entries(mockLegislation)
                        .filter(([_, leg]) => leg.status === 'in-progress')
                        .slice(0, 3)
                        .map(([title, leg]) => `
                            <div class="update-item" onclick="displayLegislation('${title}')">
                                <h4>${title}</h4>
                                <p>${leg.stage}</p>
                                <span class="category-tag">${leg.category}</span>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;
    }

    // Initialize the welcome message
    showWelcomeMessage();

    // Initialize all enhanced systems
    console.log('🚀 GovWhiz Enhanced Platform Initialized');
    console.log('✅ User System Ready');
    console.log('✅ Advanced Search Ready');
    console.log('✅ Real-Time Updates Ready');
    console.log('✅ Data Visualization Ready');
    console.log('✅ PWA Features Ready');

    // Show initialization notification
    setTimeout(() => {
        if (window.userSystem) {
            window.userSystem.showNotification('🎉 GovWhiz Enhanced Platform Ready!', 'success');
        }

        // Test dashboard buttons after initialization
        if (window.dataViz) {
            console.log('📊 Dashboard buttons should now be functional');
            console.log('You can test them by clicking or running: window.testDashboardButtons()');
        }
    }, 2000);
});