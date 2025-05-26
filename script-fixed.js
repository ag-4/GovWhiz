document.addEventListener('DOMContentLoaded', function() {
    // Core DOM elements
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const resultsSection = document.getElementById('results');
    const searchForm = document.querySelector('.search-box');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const postcodeInput = document.getElementById('postcode-input');
    const findMpBtn = document.getElementById('find-mp-btn');
    const mpResults = document.getElementById('mp-results');

    // Debug: Check if elements exist
    console.log('🔍 DOM Elements Check:');
    console.log('Search button:', searchButton ? '✅' : '❌');
    console.log('Search input:', searchInput ? '✅' : '❌');
    console.log('Results section:', resultsSection ? '✅' : '❌');
    console.log('MP elements:', postcodeInput && findMpBtn && mpResults ? '✅' : '❌');
    console.log('Postcode input element:', postcodeInput);
    console.log('Find MP button element:', findMpBtn);
    console.log('MP results element:', mpResults);

    // Check MP lookup functions
    setTimeout(() => {
        console.log('🏛️ MP Lookup Functions Check:');
        console.log('window.findMPFixed:', typeof window.findMPFixed);
        console.log('window.postcodeToConstituency:', typeof window.postcodeToConstituency);
        console.log('window.constituencyToMP:', typeof window.constituencyToMP);

        if (window.postcodeToConstituency) {
            console.log('Postcode database entries:', Object.keys(window.postcodeToConstituency).length);
            console.log('Sample postcodes:', Object.keys(window.postcodeToConstituency).slice(0, 5));
        }
    }, 500);

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
        }
    };

    // Expose mockLegislation to global scope for other systems
    window.mockLegislation = mockLegislation;

    // Event listeners
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchInput) {
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
    }

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

    // MP Contact functionality - Skip if simple MP lookup is available
    if (findMpBtn && postcodeInput && mpResults && !window.findMP) {
        console.log('✅ Setting up MP lookup event listeners (fallback)');

        findMpBtn.addEventListener('click', function() {
            console.log('🏛️ Find MP button clicked (fallback)');
            const postcode = postcodeInput.value.trim().toUpperCase();
            console.log('🏛️ Postcode from input:', postcode);
            if (postcode) {
                findMP(postcode);
            } else {
                alert('Please enter a valid postcode');
            }
        });

        postcodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('🏛️ Enter key pressed in postcode input (fallback)');
                const postcode = postcodeInput.value.trim().toUpperCase();
                console.log('🏛️ Postcode from input:', postcode);
                if (postcode) {
                    findMP(postcode);
                }
            }
        });

        console.log('✅ MP lookup event listeners set up successfully (fallback)');
    } else if (window.findMP) {
        console.log('✅ Simple MP lookup system detected, skipping fallback setup');
    } else {
        console.error('❌ Failed to set up MP lookup event listeners');
        console.error('findMpBtn:', findMpBtn);
        console.error('postcodeInput:', postcodeInput);
        console.error('mpResults:', mpResults);
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
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    function performSearch() {
        console.log('🔍 Search initiated');

        if (!searchInput) {
            console.error('❌ Search input not found');
            return;
        }

        if (!resultsSection) {
            console.error('❌ Results section not found');
            return;
        }

        const query = searchInput.value.trim();
        console.log('🔍 Search query:', query);

        if (query.length === 0) {
            resultsSection.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }

        // Show loading state
        showLoading();

        // Simulate API delay for better UX
        setTimeout(() => {
            console.log('🔍 Processing search...');

            // Enhanced search logic - search in title, summary, category, and keywords
            const results = Object.keys(mockLegislation).filter(title => {
                const legislation = mockLegislation[title];
                const searchText = (title + ' ' + legislation.summary + ' ' + legislation.category + ' ' + legislation.background).toLowerCase();
                return searchText.includes(query.toLowerCase());
            });

            console.log('🔍 Search results found:', results.length);

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
        if (resultsSection) {
            resultsSection.innerHTML = '<div class="loading">Searching legislation...</div>';
        }
    }

    function displayNoResults(query) {
        if (!resultsSection) return;

        resultsSection.innerHTML =
            '<h2>No Results Found</h2>' +
            '<p>We could not find any legislation matching "<strong>' + escapeHtml(query) + '</strong>". Try another search term or browse our categories.</p>' +
            '<div class="suggestions">' +
                '<h3>You might be interested in:</h3>' +
                '<ul>' +
                    Object.keys(mockLegislation).map(title =>
                        '<li><a href="#" onclick="displayLegislation(\'' + title + '\'); return false;">' + title + '</a></li>'
                    ).join('') +
                '</ul>' +
            '</div>' +
            '<div class="category-filter">' +
                '<h3>Browse by Category:</h3>' +
                '<div class="category-buttons">' +
                    getUniqueCategories().map(category =>
                        '<button onclick="filterByCategory(\'' + category + '\')" class="category-btn">' + category + '</button>'
                    ).join('') +
                '</div>' +
            '</div>';
    }

    function displayMultipleResults(results, query) {
        if (!resultsSection) return;

        resultsSection.innerHTML =
            '<h2>Search Results for "' + escapeHtml(query) + '"</h2>' +
            '<p>Found ' + results.length + ' legislation items:</p>' +
            '<div class="results-grid">' +
                results.map(title => {
                    const legislation = mockLegislation[title];
                    return '<div class="result-card" onclick="displayLegislation(\'' + title + '\')">' +
                        '<h3>' + title + '</h3>' +
                        '<div class="result-meta">' +
                            '<span class="category-tag">' + legislation.category + '</span>' +
                            '<span class="status-tag status-' + legislation.status + '">' + legislation.status + '</span>' +
                        '</div>' +
                        '<p class="result-summary">' + legislation.summary + '</p>' +
                        '<div class="result-stage">' + legislation.stage + '</div>' +
                    '</div>';
                }).join('') +
            '</div>';
    }

    // Make this function available globally
    window.displayLegislation = function(title) {
        if (!resultsSection) return;

        const legislation = mockLegislation[title];
        if (!legislation) return;

        // Track user interaction for analytics
        if (window.dataViz) {
            window.dataViz.trackInteraction('legislation_view', title);
        }

        // Check if user is logged in for tracking features
        const isLoggedIn = window.userSystem && window.userSystem.currentUser;
        const isTracked = window.userSystem && window.userSystem.trackedBills && window.userSystem.trackedBills.has(title);

        resultsSection.innerHTML =
            '<div class="legislation-header">' +
                '<h2>' + title + '</h2>' +
                '<div class="legislation-meta">' +
                    '<span class="category-tag">' + legislation.category + '</span>' +
                    '<span class="status-tag status-' + legislation.status + '">' + legislation.status + '</span>' +
                '</div>' +
                '<div class="legislation-actions">' +
                    '<button onclick="showWelcomeMessage()" class="back-btn">← Back to Search</button>' +
                    (isLoggedIn ?
                        '<button onclick="window.userSystem.' + (isTracked ? 'untrackBill' : 'trackBill') + '(\'' + title + '\')" class="track-btn ' + (isTracked ? 'tracking' : '') + '">' +
                            (isTracked ? '📊 Stop Tracking' : '📊 Track This Bill') +
                        '</button>' :
                        '<button onclick="window.userSystem.showLoginModal()" class="track-btn">📊 Login to Track</button>'
                    ) +
                '</div>' +
            '</div>' +
            '<div class="legislation-card">' +
                '<div class="section"><h3>Summary</h3><p>' + legislation.summary + '</p></div>' +
                '<div class="section"><h3>Background</h3><p>' + legislation.background + '</p></div>' +
                '<div class="section"><h3>Current Stage</h3><p>' + legislation.stage + '</p></div>' +
                '<div class="section"><h3>Implications</h3><p>' + legislation.implications + '</p></div>' +
                '<div class="section"><h3>Who It Affects</h3><p>' + legislation.affects + '</p></div>' +
                '<div class="section"><h3>How You Can Take Action</h3><p>' + legislation.action + '</p></div>' +
                '<div class="section"><h3>Sources</h3><p><a href="' + legislation.sources + '" target="_blank" rel="noopener noreferrer">Official Documentation</a></p></div>' +
            '</div>' +
            '<div class="related-legislation">' +
                '<h3>Related Legislation</h3>' +
                '<div class="related-items">' +
                    getRelatedLegislation(legislation.category, title).map(relatedTitle =>
                        '<button onclick="displayLegislation(\'' + relatedTitle + '\')" class="related-btn">' + relatedTitle + '</button>'
                    ).join('') +
                '</div>' +
            '</div>';

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
        if (searchInput) {
            searchInput.style.borderColor = 'var(--secondary-color)';
        }
    }

    function hideSearchSuggestions() {
        if (searchInput) {
            searchInput.style.borderColor = 'var(--border-color)';
        }
    }

    // Initialize the welcome message
    showWelcomeMessage();

    // Global functions for Live Parliamentary Activity
    window.toggleLivePanel = function(button) {
        console.log('🔴 Toggling live panel');
        const content = document.getElementById('live-content');
        if (content) {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            button.textContent = isHidden ? 'Hide' : 'Show';
        }
    };

    window.switchFeed = function(feedType, button) {
        console.log('🔴 Switching feed to:', feedType);

        // Update active tab
        document.querySelectorAll('.feed-tab').forEach(tab => tab.classList.remove('active'));
        button.classList.add('active');

        // Update content based on feed type
        const content = document.getElementById('live-feed-content');
        if (content) {
            let feedContent = '';
            switch(feedType) {
                case 'parliament':
                    feedContent =
                        '<div class="live-update">' +
                            '<div class="update-time">2 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📊 Economic Crime Bill</h4>' +
                                '<p>Committee stage amendments being debated</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">5 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>🏛️ Prime Minister\'s Questions</h4>' +
                                '<p>PMQs session has begun in the House of Commons</p>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'bills':
                    feedContent =
                        '<div class="live-update">' +
                            '<div class="update-time">1 hour ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📋 Online Safety Bill</h4>' +
                                '<p>Third reading scheduled for next Tuesday</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">3 hours ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📋 Data Protection Bill</h4>' +
                                '<p>Committee stage completed, moving to report stage</p>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'debates':
                    feedContent =
                        '<div class="live-update">' +
                            '<div class="update-time">30 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>🗣️ Climate Change Debate</h4>' +
                                '<p>MPs debating net zero targets in Westminster Hall</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">1 hour ago</div>' +
                            '<div class="update-content">' +
                                '<h4>🗣️ Education Funding</h4>' +
                                '<p>Opposition day debate on school funding</p>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'news':
                    feedContent =
                        '<div class="live-update">' +
                            '<div class="update-time">15 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📰 Parliamentary News</h4>' +
                                '<p>New select committee chair appointed</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">45 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📰 Government Announcement</h4>' +
                                '<p>New policy consultation launched</p>' +
                            '</div>' +
                        '</div>';
                    break;
            }
            content.innerHTML = feedContent;
        }
    };

    function showWelcomeMessage() {
        if (!resultsSection) return;

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

        resultsSection.innerHTML =
            '<h2>Welcome to GovWhiz</h2>' +
            '<p>Search for UK legislation or policies to get plain English explanations, track changes, and learn how to participate in democracy.</p>' +
            '<div class="stats-section">' +
                '<div class="stat-item"><span class="stat-number">' + stats.totalBills + '</span><span class="stat-label">Active Bills</span></div>' +
                '<div class="stat-item"><span class="stat-number">' + stats.categories + '</span><span class="stat-label">Categories</span></div>' +
                '<div class="stat-item"><span class="stat-number">' + stats.enacted + '</span><span class="stat-label">Laws Enacted</span></div>' +
            '</div>' +
            '<div class="popular-searches">' +
                '<h3>Popular Searches:</h3>' +
                '<div class="popular-buttons">' +
                    Object.keys(mockLegislation).slice(0, 4).map(title =>
                        '<button onclick="displayLegislation(\'' + title + '\')">' + title + '</button>'
                    ).join('') +
                '</div>' +
            '</div>' +
            '<div class="category-filter">' +
                '<h3>Browse by Category:</h3>' +
                '<div class="category-buttons">' +
                    getUniqueCategories().map(category =>
                        '<button onclick="filterByCategory(\'' + category + '\')" class="category-btn">' + category + '</button>'
                    ).join('') +
                '</div>' +
            '</div>';
    }

    // Global functions
    window.filterByCategory = function(category) {
        const results = Object.keys(mockLegislation).filter(title =>
            mockLegislation[title].category === category
        );
        displayMultipleResults(results, 'Category: ' + category);
    };

    window.showWelcomeMessage = function() {
        showWelcomeMessage();
    };

    // MP Lookup functionality - Enhanced with comprehensive database
    function findMP(postcode) {
        console.log('🏛️ MP lookup initiated for:', postcode);
        console.log('🏛️ mpResults element:', mpResults);
        console.log('🏛️ findMPFixed function available:', typeof window.findMPFixed);

        if (!mpResults) {
            console.error('❌ MP results container not found');
            alert('Error: MP results container not found. Please refresh the page.');
            return;
        }

        mpResults.innerHTML = '<div class="loading">🔍 Looking up your MP...</div>';
        console.log('🏛️ Loading message set');

        setTimeout(() => {
            console.log('🏛️ Processing MP lookup...');

            // Use the comprehensive MP lookup system if available
            if (window.findMPFixed) {
                const result = window.findMPFixed(postcode);

                if (result.found) {
                    const mp = result.mp;
                    const roleDisplay = mp.role ? `<div class="mp-role">🏛️ ${mp.role}</div>` : '';
                    const twitterDisplay = mp.twitter ? `<a href="https://twitter.com/${mp.twitter.substring(1)}" target="_blank" rel="noopener noreferrer">🐦 ${mp.twitter}</a>` : '';

                    mpResults.innerHTML =
                        '<div class="mp-card">' +
                            '<div class="mp-header">' +
                                '<h4>' + mp.name + '</h4>' +
                                roleDisplay +
                            '</div>' +
                            '<p class="party">' + mp.party + ' - ' + mp.constituency + '</p>' +
                            '<div class="contact-info">' +
                                '<a href="mailto:' + mp.email + '" title="Send email to ' + mp.name + '">📧 Email</a>' +
                                '<a href="tel:' + mp.phone + '" title="Call ' + mp.name + '">📞 Phone</a>' +
                                '<a href="' + mp.website + '" target="_blank" rel="noopener noreferrer" title="Visit ' + mp.name + '\'s Parliament profile">🌐 Parliament</a>' +
                                (twitterDisplay ? twitterDisplay : '') +
                            '</div>' +
                            '<div class="mp-actions">' +
                                '<button onclick="showEmailTemplate(\'support\')" class="mp-action-btn">✉️ Support a Bill</button>' +
                                '<button onclick="showEmailTemplate(\'oppose\')" class="mp-action-btn">❌ Oppose a Bill</button>' +
                                '<button onclick="showEmailTemplate(\'question\')" class="mp-action-btn">❓ Ask Question</button>' +
                                '<button onclick="showEmailTemplate(\'meeting\')" class="mp-action-btn">🤝 Request Meeting</button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="mp-info">' +
                            '<p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-light);">' +
                                '✅ Found MP for ' + postcode + ' (' + result.constituency + '). Contact details are current as of January 2025.' +
                            '</p>' +
                            '<p style="margin-top: 10px; font-size: 0.85rem; color: var(--text-light);">' +
                                '💡 <strong>Tip:</strong> When contacting your MP, always include your full address to confirm you\'re a constituent.' +
                            '</p>' +
                        '</div>';

                    console.log('✅ MP found successfully:', mp.name);
                } else {
                    mpResults.innerHTML = `
                        <div class="mp-not-found">
                            <h4>❌ MP Not Found</h4>
                            <p>${result.message}</p>
                            <div class="alternative-options">
                                <h5>Alternative Options:</h5>
                                <ul>
                                    <li><a href="https://www.parliament.uk/get-involved/contact-your-mp/" target="_blank">Official Parliament MP Finder</a></li>
                                    <li><a href="https://www.theyworkforyou.com/" target="_blank">TheyWorkForYou.com</a></li>
                                    <li>Try a different postcode format (e.g., SW1A1AA or SW1A 1AA)</li>
                                </ul>
                            </div>
                        </div>
                    `;

                    console.log('❌ MP not found for postcode:', postcode);
                }
            } else {
                // Fallback to basic system if comprehensive lookup not available
                console.warn('⚠️ Comprehensive MP lookup not available, using fallback');
                mpResults.innerHTML = `
                    <div class="mp-not-found">
                        <h4>⚠️ MP Lookup System Loading</h4>
                        <p>The comprehensive MP lookup system is still loading. Please try again in a moment.</p>
                        <div class="alternative-options">
                            <h5>Alternative Options:</h5>
                            <ul>
                                <li><a href="https://www.parliament.uk/get-involved/contact-your-mp/" target="_blank">Official Parliament MP Finder</a></li>
                                <li><a href="https://www.theyworkforyou.com/" target="_blank">TheyWorkForYou.com</a></li>
                            </ul>
                        </div>
                    </div>
                `;
            }
        }, 500);
    }

    // Email template functionality
    function showEmailTemplate(templateType) {
        const templates = {
            support: {
                subject: 'Support for [Bill Name]',
                body: 'Dear [MP Name],\n\nI am writing as your constituent to express my support for [Bill Name] currently being considered in Parliament.\n\nI believe this legislation is important because:\n- [Reason 1]\n- [Reason 2]\n- [Reason 3]\n\nI would be grateful if you could support this bill when it comes to a vote.\n\nThank you for your time and consideration.\n\nYours sincerely,\n[Your Name]\n[Your Address]\n[Your Postcode]'
            },
            oppose: {
                subject: 'Concerns about [Bill Name]',
                body: 'Dear [MP Name],\n\nI am writing as your constituent to express my concerns about [Bill Name] currently being considered in Parliament.\n\nI have the following concerns:\n- [Concern 1]\n- [Concern 2]\n- [Concern 3]\n\nI would be grateful if you could vote against this bill or seek amendments to address these issues.\n\nThank you for your time and consideration.\n\nYours sincerely,\n[Your Name]\n[Your Address]\n[Your Postcode]'
            },
            question: {
                subject: 'Question about [Topic]',
                body: 'Dear [MP Name],\n\nI am writing as your constituent to ask about [Topic/Issue].\n\nMy question is: [Your specific question]\n\nI would appreciate your thoughts on this matter and any actions you might be taking.\n\nThank you for your time.\n\nYours sincerely,\n[Your Name]\n[Your Address]\n[Your Postcode]'
            },
            meeting: {
                subject: 'Request for Meeting - [Topic]',
                body: 'Dear [MP Name],\n\nI am writing as your constituent to request a meeting to discuss [Topic/Issue].\n\nThis matter is important to me because: [Brief explanation]\n\nI would be grateful for the opportunity to discuss this with you in person at your next surgery or at a convenient time.\n\nPlease let me know your availability.\n\nThank you for your time.\n\nYours sincerely,\n[Your Name]\n[Your Address]\n[Your Postcode]\n[Your Phone Number]\n[Your Email]'
            }
        };

        const template = templates[templateType];
        if (template) {
            // Create a modal with the template
            const modal = document.createElement('div');
            modal.className = 'email-modal';
            modal.innerHTML =
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<h3>Email Template: ' + templateType.charAt(0).toUpperCase() + templateType.slice(1) + '</h3>' +
                        '<button class="close-modal" onclick="this.closest(\'.email-modal\').remove()">×</button>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="template-field">' +
                            '<label>Subject:</label>' +
                            '<input type="text" value="' + template.subject + '" readonly>' +
                        '</div>' +
                        '<div class="template-field">' +
                            '<label>Email Body:</label>' +
                            '<textarea rows="15" readonly>' + template.body + '</textarea>' +
                        '</div>' +
                        '<div class="template-actions">' +
                            '<button onclick="copyTemplate(\'' + templateType + '\')" class="copy-btn">Copy Template</button>' +
                            '<button onclick="this.closest(\'.email-modal\').remove()" class="close-btn">Close</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
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
        alert('Template "' + templates[templateType] + '" copied to clipboard!\n\nIn a real app, this would copy the full email template for you to paste into your email client.');
    };

    // Global function to try example postcodes - Enhanced
    window.tryPostcode = function(postcode) {
        console.log('🏛️ Trying example postcode:', postcode);
        console.log('🏛️ postcodeInput element:', postcodeInput);
        console.log('🏛️ tryPostcodeFixed available:', typeof window.tryPostcodeFixed);

        // Use the enhanced tryPostcodeFixed function if available
        if (window.tryPostcodeFixed) {
            console.log('🏛️ Using tryPostcodeFixed function');
            window.tryPostcodeFixed(postcode);
        } else if (postcodeInput) {
            console.log('🏛️ Using direct method - setting input value and calling findMP');
            postcodeInput.value = postcode;
            findMP(postcode);
        } else {
            console.error('❌ Postcode input not found');
            alert('Error: Postcode input not found. Please refresh the page.');
        }
    };



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
                content: '<h4>Basic Search</h4><p>Enter keywords related to the legislation you\'re looking for in the search box. You can search by:</p><ul><li>Bill name (e.g., "Online Safety Bill")</li><li>Topic (e.g., "environment", "digital rights")</li><li>Keywords from the summary or description</li></ul><h4>Advanced Tips</h4><ul><li>Use specific terms for better results</li><li>Try different variations of keywords</li><li>Browse by category if you\'re not sure what to search for</li></ul>'
            },
            tracking: {
                title: 'Setting Up Bill Tracking',
                content: '<h4>Track Legislation</h4><p>Stay informed about bills that matter to you:</p><ul><li>Click the "Track This Bill" button on any legislation page</li><li>Choose your notification preferences</li><li>Receive updates when the bill progresses through Parliament</li></ul><h4>Notification Types</h4><ul><li>Email alerts for major updates</li><li>Weekly digest of all tracked bills</li><li>Push notifications for urgent changes</li></ul>'
            },
            notifications: {
                title: 'Managing Notifications',
                content: '<h4>Notification Settings</h4><p>Control how you receive updates:</p><ul><li>Email frequency (instant, daily, weekly)</li><li>Push notification preferences</li><li>SMS alerts for urgent updates</li><li>Notification categories (bills, debates, news)</li></ul><h4>Managing Your Alerts</h4><ul><li>View all notifications in your dashboard</li><li>Mark notifications as read</li><li>Unsubscribe from specific bills</li><li>Pause all notifications temporarily</li></ul>'
            },
            process: {
                title: 'How Bills Become Laws',
                content: '<h4>The Legislative Process</h4><p>Understanding how a bill becomes law in the UK:</p><ol><li><strong>First Reading:</strong> Bill is introduced and published</li><li><strong>Second Reading:</strong> General debate on principles</li><li><strong>Committee Stage:</strong> Detailed examination and amendments</li><li><strong>Report Stage:</strong> Further amendments considered</li><li><strong>Third Reading:</strong> Final debate and vote</li><li><strong>House of Lords:</strong> Same process in upper house</li><li><strong>Royal Assent:</strong> Bill becomes law</li></ol>'
            },
            stages: {
                title: 'Parliamentary Stages Explained',
                content: '<h4>Key Stages</h4><p>Each stage serves a specific purpose:</p><ul><li><strong>First Reading:</strong> Formal introduction, no debate</li><li><strong>Second Reading:</strong> Main debate on principles (most bills fail here)</li><li><strong>Committee Stage:</strong> Line-by-line scrutiny by MPs</li><li><strong>Report Stage:</strong> Whole House considers committee amendments</li><li><strong>Third Reading:</strong> Final chance for amendments</li></ul><h4>Timing</h4><p>The process typically takes 6-12 months, but can vary significantly based on complexity and controversy.</p>'
            },
            committees: {
                title: 'Committee System Guide',
                content: '<h4>Types of Committees</h4><ul><li><strong>Public Bill Committees:</strong> Examine specific bills in detail</li><li><strong>Select Committees:</strong> Scrutinize government departments</li><li><strong>Standing Committees:</strong> Handle routine parliamentary business</li></ul><h4>Committee Powers</h4><ul><li>Call witnesses and experts</li><li>Request documents and evidence</li><li>Propose amendments to bills</li><li>Publish reports and recommendations</li></ul>'
            },
            voting: {
                title: 'Voter Registration Guide',
                content: '<h4>How to Register</h4><p>You must be registered to vote in UK elections:</p><ul><li>Visit gov.uk/register-to-vote</li><li>You need your National Insurance number</li><li>Registration takes about 5 minutes</li><li>You can register up to 12 working days before an election</li></ul><h4>Who Can Vote</h4><ul><li>UK, Irish, or Commonwealth citizens</li><li>EU citizens (for some elections)</li><li>Aged 18 or over (16+ in Scotland for some elections)</li><li>Not legally excluded (e.g., prisoners)</li></ul>'
            },
            contact: {
                title: 'Contacting Your MP',
                content: '<h4>Best Practices</h4><ul><li>Always include your full address to prove you\'re a constituent</li><li>Be clear and concise about your issue</li><li>Provide specific examples and evidence</li><li>Be respectful and professional</li><li>Follow up if you don\'t receive a response within 2 weeks</li></ul><h4>Contact Methods</h4><ul><li>Email (most common and effective)</li><li>Letter to their constituency office</li><li>Attend their surgery (appointment usually required)</li><li>Phone their office</li></ul>'
            },
            petitions: {
                title: 'Creating Petitions',
                content: '<h4>UK Parliament Petitions</h4><p>Official petitions on the Parliament website:</p><ul><li>Must be about something the UK Parliament or Government is responsible for</li><li>Need 5 signatures to be published</li><li>10,000 signatures = Government response</li><li>100,000 signatures = Considered for debate</li></ul><h4>Tips for Success</h4><ul><li>Choose a clear, specific title</li><li>Explain the issue and your proposed solution</li><li>Share widely on social media</li><li>Contact relevant MPs and organizations</li></ul>'
            },
            account: {
                title: 'Account Management',
                content: '<h4>Your GovWhiz Account</h4><ul><li>Track unlimited bills with a free account</li><li>Customize your notification preferences</li><li>Save your search history</li><li>Export your tracked bills data</li></ul><h4>Account Settings</h4><ul><li>Update your email and password</li><li>Manage notification preferences</li><li>Set your constituency information</li><li>Choose your areas of interest</li></ul>'
            },
            mobile: {
                title: 'Mobile App Guide',
                content: '<h4>GovWhiz Mobile Features</h4><ul><li>Full search functionality</li><li>Push notifications for tracked bills</li><li>Offline reading of saved legislation</li><li>Quick MP contact tools</li></ul><h4>Download</h4><p>Available on:</p><ul><li>iOS App Store</li><li>Google Play Store</li><li>Progressive Web App (PWA) for all devices</li></ul>'
            },
            troubleshooting: {
                title: 'Troubleshooting',
                content: '<h4>Common Issues</h4><ul><li><strong>Search not working:</strong> Try clearing your browser cache</li><li><strong>Notifications not received:</strong> Check your spam folder and notification settings</li><li><strong>Login problems:</strong> Reset your password or contact support</li><li><strong>Slow loading:</strong> Check your internet connection</li></ul><h4>Browser Support</h4><p>GovWhiz works best on:</p><ul><li>Chrome 90+</li><li>Firefox 88+</li><li>Safari 14+</li><li>Edge 90+</li></ul>'
            }
        };

        const content = helpContent[topic] || {
            title: 'Help Topic',
            content: '<p>Help content for this topic is coming soon.</p>'
        };

        const modal = document.createElement('div');
        modal.className = 'email-modal';
        modal.innerHTML =
            '<div class="modal-content">' +
                '<div class="modal-header">' +
                    '<h3>' + content.title + '</h3>' +
                    '<button class="close-modal" onclick="this.closest(\'.email-modal\').remove()">×</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    content.content +
                    '<div class="template-actions">' +
                        '<button onclick="this.closest(\'.email-modal\').remove()" class="close-btn">Close</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
    };

    // Initialize all enhanced systems
    console.log('🚀 GovWhiz Enhanced Platform Initialized');

    // Initialize systems after DOM is ready
    setTimeout(() => {
        // Initialize Real-Time System
        if (window.RealTimeSystem) {
            window.realTimeSystem = new window.RealTimeSystem();
            console.log('✅ Real-Time System Initialized');
        }

        // Initialize User System
        if (window.UserSystem) {
            window.userSystem = new window.UserSystem();
            console.log('✅ User System Initialized');
        }

        // Initialize Data Visualization
        if (window.DataVisualization) {
            window.dataViz = new window.DataVisualization();
            console.log('✅ Data Visualization Initialized');
        }

        // Initialize Auto Updater
        if (window.GovWhizUpdater) {
            window.govwhizUpdater = new window.GovWhizUpdater();
            console.log('✅ Auto Updater Initialized');
        }

        // Show success notification
        if (window.userSystem) {
            window.userSystem.showNotification('🎉 GovWhiz Enhanced Platform Ready!', 'success');
        }

        console.log('✅ All Enhanced Systems Ready');
    }, 1000);

    // Add Live Parliamentary Activity Panel
    function addLiveParliamentaryActivity() {
        const container = document.querySelector('.container');
        if (!container) return;

        const livePanel = document.createElement('section');
        livePanel.className = 'live-activity-panel';
        livePanel.innerHTML =
            '<div class="live-header">' +
                '<h3>🔴 Live Parliamentary Activity</h3>' +
                '<button class="toggle-live" onclick="toggleLivePanel(this)">Hide</button>' +
            '</div>' +
            '<div class="live-content" id="live-content">' +
                '<div class="live-feeds">' +
                    '<div class="feed-tabs">' +
                        '<button class="feed-tab active" onclick="switchFeed(\'parliament\', this)">Parliament</button>' +
                        '<button class="feed-tab" onclick="switchFeed(\'bills\', this)">Bills</button>' +
                        '<button class="feed-tab" onclick="switchFeed(\'debates\', this)">Debates</button>' +
                        '<button class="feed-tab" onclick="switchFeed(\'news\', this)">News</button>' +
                    '</div>' +
                    '<div class="feed-content" id="live-feed-content">' +
                        '<div class="live-update">' +
                            '<div class="update-time">2 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📊 Economic Crime and Corporate Transparency Bill</h4>' +
                                '<p>Committee stage amendments being debated in Committee Room 14</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">5 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>🏛️ Prime Minister\'s Questions</h4>' +
                                '<p>PMQs session has begun in the House of Commons</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">12 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📋 Online Safety Bill</h4>' +
                                '<p>Third reading scheduled for next Tuesday</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        // Insert after search section
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            searchSection.parentNode.insertBefore(livePanel, searchSection.nextSibling);
        }
    }

    // Add Analytics Dashboard
    function addAnalyticsDashboard() {
        const container = document.querySelector('.container');
        if (!container) return;

        const dashboardSection = document.createElement('section');
        dashboardSection.className = 'analytics-dashboard';
        dashboardSection.innerHTML =
            '<div class="dashboard-header">' +
                '<h2>📊 Parliamentary Analytics Dashboard</h2>' +
                '<div class="dashboard-controls">' +
                    '<button class="dashboard-btn" onclick="toggleDashboard(this)">Hide Dashboard</button>' +
                    '<button class="dashboard-btn" onclick="refreshDashboard()">🔄 Refresh</button>' +
                    '<button class="dashboard-btn" onclick="exportData()">📥 Export</button>' +
                '</div>' +
            '</div>' +
            '<div class="dashboard-content" id="dashboard-content">' +
                '<div class="dashboard-tabs">' +
                    '<button class="dashboard-tab active" onclick="switchDashboardTab(\'overview\', this)">📈 Overview</button>' +
                    '<button class="dashboard-tab" onclick="switchDashboardTab(\'bills\', this)">📊 Bills Analysis</button>' +
                    '<button class="dashboard-tab" onclick="switchDashboardTab(\'activity\', this)">🏛️ Parliamentary Activity</button>' +
                    '<button class="dashboard-tab" onclick="switchDashboardTab(\'trends\', this)">📉 Trends</button>' +
                '</div>' +
                '<div class="dashboard-tab-content" id="dashboard-tab-content">' +
                    '<div class="metrics-grid">' +
                        '<div class="metric-card">' +
                            '<div class="metric-value">47</div>' +
                            '<div class="metric-label">Active Bills</div>' +
                            '<div class="metric-change positive">+3 this week</div>' +
                        '</div>' +
                        '<div class="metric-card">' +
                            '<div class="metric-value">156</div>' +
                            '<div class="metric-label">Parliamentary Sessions</div>' +
                            '<div class="metric-change positive">+8 this month</div>' +
                        '</div>' +
                        '<div class="metric-card">' +
                            '<div class="metric-value">23</div>' +
                            '<div class="metric-label">Committee Meetings</div>' +
                            '<div class="metric-change positive">+12 this week</div>' +
                        '</div>' +
                        '<div class="metric-card">' +
                            '<div class="metric-value">89%</div>' +
                            '<div class="metric-label">Attendance Rate</div>' +
                            '<div class="metric-change neutral">No change</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="charts-section">' +
                        '<div class="chart-container">' +
                            '<h4>Bills by Category</h4>' +
                            '<div class="chart-placeholder">📊 Interactive chart will load here</div>' +
                        '</div>' +
                        '<div class="chart-container">' +
                            '<h4>Parliamentary Activity Timeline</h4>' +
                            '<div class="chart-placeholder">📈 Activity timeline chart will load here</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        // Insert after live activity panel
        const livePanel = document.querySelector('.live-activity-panel');
        if (livePanel) {
            livePanel.parentNode.insertBefore(dashboardSection, livePanel.nextSibling);
        }
    }

    // Global functions for dashboard and live panel
    window.toggleLivePanel = function(button) {
        const content = document.getElementById('live-content');
        if (content) {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            button.textContent = isHidden ? 'Hide' : 'Show';
        }
    };

    window.switchFeed = function(feedType, button) {
        // Update active tab
        document.querySelectorAll('.feed-tab').forEach(tab => tab.classList.remove('active'));
        button.classList.add('active');

        // Update content based on feed type
        const content = document.getElementById('live-feed-content');
        if (content) {
            let feedContent = '';
            switch(feedType) {
                case 'parliament':
                    feedContent =
                        '<div class="live-update">' +
                            '<div class="update-time">2 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📊 Economic Crime Bill</h4>' +
                                '<p>Committee stage amendments being debated</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">5 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>🏛️ Prime Minister\'s Questions</h4>' +
                                '<p>PMQs session has begun in the House of Commons</p>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'bills':
                    feedContent =
                        '<div class="live-update">' +
                            '<div class="update-time">1 hour ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📋 Online Safety Bill</h4>' +
                                '<p>Third reading scheduled for next Tuesday</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">3 hours ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📋 Data Protection Bill</h4>' +
                                '<p>Committee stage completed, moving to report stage</p>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'debates':
                    feedContent =
                        '<div class="live-update">' +
                            '<div class="update-time">30 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>🗣️ Climate Change Debate</h4>' +
                                '<p>MPs debating net zero targets in Westminster Hall</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">1 hour ago</div>' +
                            '<div class="update-content">' +
                                '<h4>🗣️ Education Funding</h4>' +
                                '<p>Opposition day debate on school funding</p>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'news':
                    feedContent =
                        '<div class="live-update">' +
                            '<div class="update-time">15 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📰 Parliamentary News</h4>' +
                                '<p>New select committee chair appointed</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="live-update">' +
                            '<div class="update-time">45 minutes ago</div>' +
                            '<div class="update-content">' +
                                '<h4>📰 Government Announcement</h4>' +
                                '<p>New policy consultation launched</p>' +
                            '</div>' +
                        '</div>';
                    break;
            }
            content.innerHTML = feedContent;
        }
    };

    window.toggleDashboard = function(button) {
        const content = document.getElementById('dashboard-content');
        if (content) {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            button.textContent = isHidden ? 'Hide Dashboard' : 'Show Dashboard';
        }
    };

    window.switchDashboardTab = function(tabType, button) {
        // Update active tab
        document.querySelectorAll('.dashboard-tab').forEach(tab => tab.classList.remove('active'));
        button.classList.add('active');

        // Update content based on tab type
        const content = document.getElementById('dashboard-tab-content');
        if (content) {
            let tabContent = '';
            switch(tabType) {
                case 'overview':
                    tabContent =
                        '<div class="metrics-grid">' +
                            '<div class="metric-card">' +
                                '<div class="metric-value">47</div>' +
                                '<div class="metric-label">Active Bills</div>' +
                                '<div class="metric-change positive">+3 this week</div>' +
                            '</div>' +
                            '<div class="metric-card">' +
                                '<div class="metric-value">156</div>' +
                                '<div class="metric-label">Parliamentary Sessions</div>' +
                                '<div class="metric-change positive">+8 this month</div>' +
                            '</div>' +
                            '<div class="metric-card">' +
                                '<div class="metric-value">23</div>' +
                                '<div class="metric-label">Committee Meetings</div>' +
                                '<div class="metric-change positive">+12 this week</div>' +
                            '</div>' +
                            '<div class="metric-card">' +
                                '<div class="metric-value">89%</div>' +
                                '<div class="metric-label">Attendance Rate</div>' +
                                '<div class="metric-change neutral">No change</div>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'bills':
                    tabContent =
                        '<div class="bills-analysis">' +
                            '<h4>Bill Progress Analysis</h4>' +
                            '<div class="progress-chart">' +
                                '<div class="progress-item">' +
                                    '<span class="stage">First Reading</span>' +
                                    '<div class="progress-bar"><div class="progress-fill" style="width: 85%"></div></div>' +
                                    '<span class="count">15 bills</span>' +
                                '</div>' +
                                '<div class="progress-item">' +
                                    '<span class="stage">Committee Stage</span>' +
                                    '<div class="progress-bar"><div class="progress-fill" style="width: 60%"></div></div>' +
                                    '<span class="count">8 bills</span>' +
                                '</div>' +
                                '<div class="progress-item">' +
                                    '<span class="stage">Third Reading</span>' +
                                    '<div class="progress-bar"><div class="progress-fill" style="width: 30%"></div></div>' +
                                    '<span class="count">4 bills</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'activity':
                    tabContent =
                        '<div class="activity-heatmap">' +
                            '<h4>Parliamentary Activity Heatmap</h4>' +
                            '<div class="heatmap-grid">' +
                                '<div class="heatmap-day high">Mon</div>' +
                                '<div class="heatmap-day medium">Tue</div>' +
                                '<div class="heatmap-day high">Wed</div>' +
                                '<div class="heatmap-day low">Thu</div>' +
                                '<div class="heatmap-day medium">Fri</div>' +
                            '</div>' +
                            '<div class="activity-legend">' +
                                '<span class="legend-item"><div class="legend-color high"></div>High Activity</span>' +
                                '<span class="legend-item"><div class="legend-color medium"></div>Medium Activity</span>' +
                                '<span class="legend-item"><div class="legend-color low"></div>Low Activity</span>' +
                            '</div>' +
                        '</div>';
                    break;
                case 'trends':
                    tabContent =
                        '<div class="trends-analysis">' +
                            '<h4>Legislation Trends</h4>' +
                            '<div class="trend-items">' +
                                '<div class="trend-item">' +
                                    '<span class="trend-topic">Technology & Digital Rights</span>' +
                                    '<span class="trend-indicator up">↗️ +25%</span>' +
                                '</div>' +
                                '<div class="trend-item">' +
                                    '<span class="trend-topic">Environment & Climate</span>' +
                                    '<span class="trend-indicator up">↗️ +18%</span>' +
                                '</div>' +
                                '<div class="trend-item">' +
                                    '<span class="trend-topic">Health & Social Care</span>' +
                                    '<span class="trend-indicator down">↘️ -5%</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
                    break;
            }
            content.innerHTML = tabContent;
        }
    };

    window.refreshDashboard = function() {
        alert('Dashboard data refreshed! 🔄\n\nIn a real application, this would fetch the latest data from Parliament APIs.');
    };

    window.exportData = function() {
        alert('Data export initiated! 📥\n\nIn a real application, this would download a CSV or PDF report of the current data.');
    };

    // User System Functions - Removed duplicate (keeping the enhanced version below)

    window.showSignupModal = function() {
        const modal = document.createElement('div');
        modal.className = 'user-modal';
        modal.innerHTML =
            '<div class="modal-content">' +
                '<div class="modal-header">' +
                    '<h3>📝 Sign Up for GovWhiz</h3>' +
                    '<button class="close-modal" onclick="this.closest(\'.user-modal\').remove()">×</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<form id="signup-form">' +
                        '<div class="form-group">' +
                            '<label for="signup-name">Full Name:</label>' +
                            '<input type="text" id="signup-name" required>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="signup-email">Email:</label>' +
                            '<input type="email" id="signup-email" required>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="signup-password">Password:</label>' +
                            '<input type="password" id="signup-password" required>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="signup-postcode">Postcode (optional):</label>' +
                            '<input type="text" id="signup-postcode" placeholder="e.g., SW1A 1AA">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>Areas of Interest:</label>' +
                            '<div class="checkbox-group">' +
                                '<label><input type="checkbox" value="technology"> Technology & Digital Rights</label>' +
                                '<label><input type="checkbox" value="environment"> Environment & Climate</label>' +
                                '<label><input type="checkbox" value="health"> Health & Social Care</label>' +
                                '<label><input type="checkbox" value="education"> Education</label>' +
                                '<label><input type="checkbox" value="economy"> Economy & Finance</label>' +
                            '</div>' +
                        '</div>' +
                        '<div class="form-actions">' +
                            '<button type="submit" class="auth-submit">Create Account</button>' +
                            '<button type="button" onclick="showLoginModal(); this.closest(\'.user-modal\').remove();" class="auth-link">Already have an account? Login</button>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        // Handle signup form submission
        document.getElementById('signup-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const postcode = document.getElementById('signup-postcode').value;
            const interests = Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.value);

            // Simulate signup process
            if (name && email && password) {
                // Update UI to show logged in state
                updateUserInterface(email, name);
                modal.remove();
                alert('🎉 Account created successfully!\n\nWelcome to GovWhiz! You can now track bills, receive notifications, and access personalized features.');
            }
        });
    };

    function updateUserInterface(email, name) {
        const userStatus = document.getElementById('user-status');
        if (userStatus) {
            const displayName = name || email.split('@')[0];
            userStatus.innerHTML =
                '<div class="user-info">' +
                    '<span class="user-name">👤 ' + displayName + '</span>' +
                    '<div class="user-dropdown">' +
                        '<button onclick="showUserMenu()" class="user-menu-btn">▼</button>' +
                        '<div class="user-menu" id="user-menu" style="display: none;">' +
                            '<a href="#" onclick="showDashboard()">📊 Dashboard</a>' +
                            '<a href="#" onclick="showTrackedBills()">📋 Tracked Bills</a>' +
                            '<a href="#" onclick="showSettings()">⚙️ Settings</a>' +
                            '<a href="#" onclick="logout()">🚪 Logout</a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }
    }

    window.showUserMenu = function() {
        const menu = document.getElementById('user-menu');
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    };

    window.showDashboard = function() {
        alert('📊 User Dashboard\n\nThis would show your personalized dashboard with tracked bills, notifications, and activity summary.');
    };

    window.showTrackedBills = function() {
        alert('📋 Tracked Bills\n\nThis would show all the bills you\'re currently tracking with their latest status updates.');
    };

    window.showSettings = function() {
        alert('⚙️ User Settings\n\nThis would open your account settings where you can manage notifications, update your profile, and set preferences.');
    };

    window.logout = function() {
        const userStatus = document.getElementById('user-status');
        if (userStatus) {
            userStatus.innerHTML = '<button id="login-btn" class="user-btn" onclick="showLoginModal()">👤 Login</button>';
        }
        alert('👋 Logged out successfully!\n\nYou\'ve been logged out of GovWhiz. You can still browse legislation but won\'t receive personalized features.');
    };

    // User System Functions
    window.showLoginModal = function() {
        console.log('👤 Opening login modal');
        const modal = document.createElement('div');
        modal.className = 'user-modal';
        modal.innerHTML =
            '<div class="modal-content">' +
                '<div class="modal-header">' +
                    '<h3>👤 Login to GovWhiz</h3>' +
                    '<button class="close-modal" onclick="this.closest(\'.user-modal\').remove()">×</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<form id="login-form">' +
                        '<div class="form-group">' +
                            '<label for="login-email">Email:</label>' +
                            '<input type="email" id="login-email" required>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="login-password">Password:</label>' +
                            '<input type="password" id="login-password" required>' +
                        '</div>' +
                        '<div class="form-actions">' +
                            '<button type="submit" class="auth-submit">Login</button>' +
                            '<button type="button" onclick="showSignupModal(); this.closest(\'.user-modal\').remove();" class="auth-link">Need an account? Sign up</button>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        // Handle login form submission
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (email && password) {
                updateUserInterface(email);
                modal.remove();
                alert('✅ Successfully logged in!\n\nWelcome to GovWhiz. You can now track bills and receive personalized notifications.');
            }
        });
    };

    window.showSignupModal = function() {
        console.log('📝 Opening signup modal');
        const modal = document.createElement('div');
        modal.className = 'user-modal';
        modal.innerHTML =
            '<div class="modal-content">' +
                '<div class="modal-header">' +
                    '<h3>📝 Sign Up for GovWhiz</h3>' +
                    '<button class="close-modal" onclick="this.closest(\'.user-modal\').remove()">×</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<form id="signup-form">' +
                        '<div class="form-group">' +
                            '<label for="signup-name">Full Name:</label>' +
                            '<input type="text" id="signup-name" required>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="signup-email">Email:</label>' +
                            '<input type="email" id="signup-email" required>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="signup-password">Password:</label>' +
                            '<input type="password" id="signup-password" required>' +
                        '</div>' +
                        '<div class="form-actions">' +
                            '<button type="submit" class="auth-submit">Create Account</button>' +
                            '<button type="button" onclick="showLoginModal(); this.closest(\'.user-modal\').remove();" class="auth-link">Already have an account? Login</button>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        // Handle signup form submission
        document.getElementById('signup-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            if (name && email && password) {
                updateUserInterface(email, name);
                modal.remove();
                alert('🎉 Account created successfully!\n\nWelcome to GovWhiz! You can now track bills, receive notifications, and access personalized features.');
            }
        });
    };

    function updateUserInterface(email, name) {
        const userStatus = document.getElementById('user-status');
        if (userStatus) {
            const displayName = name || email.split('@')[0];
            userStatus.innerHTML =
                '<div class="user-info">' +
                    '<span class="user-name">👤 ' + displayName + '</span>' +
                    '<button onclick="logout()" class="user-btn">🚪 Logout</button>' +
                '</div>';
        }
    }

    window.logout = function() {
        console.log('🚪 Logging out');
        const userStatus = document.getElementById('user-status');
        if (userStatus) {
            userStatus.innerHTML = '<button id="login-btn" class="user-btn" onclick="showLoginModal()">👤 Login</button>';
        }
        alert('👋 Logged out successfully!');
    };

    // Initialize login button if user is not logged in
    setTimeout(() => {
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', window.showLoginModal);
            console.log('👤 Login button initialized');
        }
    }, 500);
});
