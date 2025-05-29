document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation
    const tabs = document.querySelectorAll('.service-tab');
    const sections = document.querySelectorAll('.service-section');

    // MP Search Elements
    const postcodeInput = document.getElementById('postcode-input');
    const findMpBtn = document.getElementById('find-mp-btn');
    const postcodeSuggestions = document.getElementById('postcode-suggestions');
    const mpResults = document.getElementById('mp-results');
    const quickPostcodes = document.querySelectorAll('.quick-postcode');

    // Lords Search Elements
    const lordsSearch = document.getElementById('lords-search');
    const searchLordsBtn = document.getElementById('search-lords-btn');
    const lordsSuggestions = document.getElementById('lords-suggestions');
    const lordsResults = document.getElementById('lords-results');
    const expertiseButtons = document.querySelectorAll('.expertise-btn');

    // Housing Rights Elements
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    const emergencyBtn = document.querySelector('.emergency-btn');

    // Regular expression for UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

    // Tab Navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-section`).classList.add('active');
        });
    });

    // MP Search Functionality
    postcodeInput?.addEventListener('input', debounce(async (e) => {
        const postcode = e.target.value.trim().toUpperCase();
        if (postcode.length < 2) {
            postcodeSuggestions.innerHTML = '';
            return;
        }
        await getPostcodeSuggestions(postcode);
    }, 300));

    findMpBtn?.addEventListener('click', () => findMP());

    quickPostcodes.forEach(button => {
        button.addEventListener('click', () => {
            postcodeInput.value = button.dataset.postcode;
            findMP();
        });
    });

    // Lords Search Functionality
    lordsSearch?.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            lordsSuggestions.innerHTML = '';
            return;
        }
        await searchLords(query);
    }, 300));

    searchLordsBtn?.addEventListener('click', () => {
        const query = lordsSearch.value.trim();
        if (query) searchLords(query, true);
    });

    expertiseButtons.forEach(button => {
        button.addEventListener('click', () => {
            searchLordsByExpertise(button.dataset.area);
        });
    });

    // Housing Rights Functionality
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', () => {
            showHousingInfo(button.dataset.topic);
        });
    });

    emergencyBtn?.addEventListener('click', showEmergencySupport);

    // Helper Functions
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function validatePostcode(postcode) {
        return postcodeRegex.test(postcode);
    }

    function showLoading(element) {
        element.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }

    function showError(element, message) {
        element.innerHTML = `
            <div class="error-message">
                <h4>Error</h4>
                <p>${message}</p>
            </div>
        `;
    }

    // MP Search Functions
    async function getPostcodeSuggestions(postcode) {
        try {
            const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}/autocomplete`);
            const data = await response.json();
            
            if (data.result) {
                postcodeSuggestions.innerHTML = data.result
                    .map(pc => `<div class="suggestion" data-postcode="${pc}">${pc}</div>`)
                    .join('') || '<div class="no-results">No matching postcodes found</div>';
            }
        } catch (error) {
            console.error('Error fetching postcode suggestions:', error);
            postcodeSuggestions.innerHTML = '';
        }
    }

    async function findMP() {
        const postcode = postcodeInput.value.trim().toUpperCase();
        
        if (!postcode) {
            showError(mpResults, 'Please enter a postcode');
            return;
        }

        if (!validatePostcode(postcode)) {
            showError(mpResults, 'Please enter a valid UK postcode');
            return;
        }

        showLoading(mpResults);

        try {
            // Get constituency from postcode
            const postcodeResponse = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
            const postcodeData = await postcodeResponse.json();
            
            if (!postcodeData.result?.parliamentary_constituency) {
                throw new Error('Could not find constituency for this postcode');
            }

            const constituency = postcodeData.result.parliamentary_constituency;

            // Get MP details from Parliament API
            const mpResponse = await fetch(`https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${encodeURIComponent(constituency)}`);
            if (!mpResponse.ok) throw new Error('Failed to fetch MP data');
            
            const mpData = await mpResponse.json();
            if (!mpData.items?.length) {
                throw new Error('No MP found for this constituency');
            }

            const mp = mpData.items[0].value;
            displayMPResults(mp, constituency);
        } catch (error) {
            console.error('Error:', error);
            showError(mpResults, error.message || 'An error occurred while searching for your MP');
        }
    }

    function displayMPResults(mp, constituency) {
        const partyColors = {
            'Conservative': '#0087DC',
            'Labour': '#E4003B',
            'Scottish National Party': '#FFF95D',
            'Liberal Democrat': '#FAA61A',
            'Green Party': '#6AB023',
            'Plaid Cymru': '#008142'
        };

        const partyColor = partyColors[mp.latestParty.name] || '#666666';

        mpResults.innerHTML = `
            <div class="result-card">
                <div style="border-left: 4px solid ${partyColor}; padding-left: 1rem;">
                    <h3>${mp.nameDisplayAs}</h3>
                    <p class="party">${mp.latestParty.name}</p>
                    <p class="constituency">MP for ${constituency}</p>
                </div>
                
                <div class="mp-details">
                    <h4>Contact Information</h4>
                    ${mp.contactDetails ? mp.contactDetails.map(contact => `
                        <p><strong>${contact.type}:</strong> 
                            ${contact.type === 'Email' ? 
                                `<a href="mailto:${contact.value}">${contact.value}</a>` :
                                contact.type === 'Phone' ?
                                `<a href="tel:${contact.value}">${contact.value}</a>` :
                                contact.value}
                        </p>
                    `).join('') : '<p>No contact details available</p>'}

                    ${mp.socialLinks?.length ? `
                        <h4>Social Media</h4>
                        ${mp.socialLinks.map(social => `
                            <p><strong>${social.type}:</strong> 
                                <a href="${social.type === 'Twitter' ? 'https://twitter.com/' : ''}${social.value}" 
                                   target="_blank">${social.value}</a>
                            </p>
                        `).join('')}
                    ` : ''}

                    <div class="mp-actions">
                        <a href="https://members.parliament.uk/member/${mp.id}" 
                           target="_blank" 
                           class="primary-btn">View Full Profile</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Lords Search Functions
    async function searchLords(query, displayFull = false) {
        try {
            const response = await fetch(`https://members-api.parliament.uk/api/Members/Search?House=Lords&Name=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (!displayFull) {
                // Show suggestions
                if (data.items?.length) {
                    lordsSuggestions.innerHTML = data.items
                        .map(item => `
                            <div class="suggestion" data-lord-id="${item.value.id}">
                                ${item.value.nameDisplayAs}
                            </div>
                        `)
                        .join('');
                } else {
                    lordsSuggestions.innerHTML = '<div class="no-results">No matching members found</div>';
                }
                return;
            }

            // Display full results
            if (!data.items?.length) {
                showError(lordsResults, 'No members found matching your search');
                return;
            }

            displayLordsResults(data.items.map(item => item.value));
        } catch (error) {
            console.error('Error searching Lords:', error);
            showError(lordsResults, 'An error occurred while searching');
        }
    }

    async function searchLordsByExpertise(expertise) {
        showLoading(lordsResults);

        try {
            const response = await fetch(`https://members-api.parliament.uk/api/Members/Search?House=Lords&Interest=${encodeURIComponent(expertise)}`);
            const data = await response.json();

            if (!data.items?.length) {
                throw new Error(`No members found with expertise in ${expertise}`);
            }

            displayLordsResults(data.items.map(item => item.value));
        } catch (error) {
            console.error('Error:', error);
            showError(lordsResults, error.message || 'An error occurred while searching');
        }
    }

    function displayLordsResults(lords) {
        lordsResults.innerHTML = lords.map(lord => `
            <div class="result-card">
                <h3>${lord.nameDisplayAs}</h3>
                <p>${lord.latestHouseMembership?.membershipStatus?.statusDescription || 'Member of the House of Lords'}</p>
                
                <div class="lord-details">
                    ${lord.parliamentaryPosts?.length ? `
                        <h4>Parliamentary Roles</h4>
                        <ul>
                            ${lord.parliamentaryPosts.map(post => `
                                <li>${post.name} (${new Date(post.startDate).getFullYear()})</li>
                            `).join('')}
                        </ul>
                    ` : ''}

                    ${lord.committeeMemberships?.length ? `
                        <h4>Committee Memberships</h4>
                        <ul>
                            ${lord.committeeMemberships.map(committee => `
                                <li>${committee.name}</li>
                            `).join('')}
                        </ul>
                    ` : ''}

                    <div class="lord-actions">
                        <a href="https://members.parliament.uk/member/${lord.id}" 
                           target="_blank" 
                           class="primary-btn">View Full Profile</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Housing Rights Functions
    function showHousingInfo(topic) {
        const topics = {
            tenant: {
                title: 'Tenant Rights',
                content: `
                    <h3>Your Rights as a Tenant</h3>
                    <div class="rights-detail">
                        <h4>Safety and Repairs</h4>
                        <ul>
                            <li>Your home must be safe and in good repair</li>
                            <li>Landlords must maintain gas and electrical safety</li>
                            <li>Essential repairs must be carried out in reasonable time</li>
                        </ul>

                        <h4>Deposit Protection</h4>
                        <ul>
                            <li>Your deposit must be protected in a government-approved scheme</li>
                            <li>You must receive deposit protection information within 30 days</li>
                            <li>You can challenge unfair deductions</li>
                        </ul>

                        <h4>Rent and Charges</h4>
                        <ul>
                            <li>Your rent cannot be increased without proper notice</li>
                            <li>You can challenge unfair rent increases</li>
                            <li>Hidden fees are prohibited</li>
                        </ul>

                        <h4>Privacy Rights</h4>
                        <ul>
                            <li>Landlords must give 24 hours' notice before visits</li>
                            <li>You have the right to "quiet enjoyment" of your home</li>
                            <li>Your personal data must be protected</li>
                        </ul>
                    </div>
                `
            },
            council: {
                title: 'Council Housing Rights',
                content: `
                    <h3>Council Housing Information</h3>
                    <div class="rights-detail">
                        <h4>Application Rights</h4>
                        <ul>
                            <li>Right to apply for council housing</li>
                            <li>Right to be placed on the waiting list if eligible</li>
                            <li>Right to request priority status</li>
                        </ul>

                        <h4>Emergency Housing</h4>
                        <ul>
                            <li>Right to emergency accommodation if homeless</li>
                            <li>Special provisions for families with children</li>
                            <li>Support for domestic violence victims</li>
                        </ul>

                        <h4>Council Tenant Rights</h4>
                        <ul>
                            <li>Secure tenancy rights</li>
                            <li>Right to repair</li>
                            <li>Right to buy (if eligible)</li>
                            <li>Right to exchange properties</li>
                        </ul>
                    </div>
                `
            },
            benefits: {
                title: 'Housing Benefits',
                content: `
                    <h3>Available Housing Benefits</h3>
                    <div class="rights-detail">
                        <h4>Universal Credit Housing Payment</h4>
                        <ul>
                            <li>Help with rent payments</li>
                            <li>Support for service charges</li>
                            <li>Additional support for disabled people</li>
                        </ul>

                        <h4>Council Tax Reduction</h4>
                        <ul>
                            <li>Up to 100% reduction available</li>
                            <li>Based on income and circumstances</li>
                            <li>Special provisions for pensioners</li>
                        </ul>

                        <h4>Discretionary Housing Payments</h4>
                        <ul>
                            <li>Extra help with housing costs</li>
                            <li>Support for rent deposits</li>
                            <li>Help with rent arrears</li>
                        </ul>
                    </div>
                `
            }
        };

        const info = topics[topic];
        if (!info) return;

        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-btn">&times;</button>
                ${info.content}
            </div>
        `;

        document.body.appendChild(modal);

        // Handle close button
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function showEmergencySupport() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content emergency">
                <button class="close-btn">&times;</button>
                <h3>Emergency Housing Support</h3>
                <div class="emergency-contacts">
                    <div class="contact-section">
                        <h4>Immediate Help</h4>
                        <p><strong>Shelter Emergency Helpline:</strong> <a href="tel:08088004444">0808 800 4444</a></p>
                        <p><strong>Available:</strong> 8am-8pm on weekdays and 9am-5pm on weekends</p>
                    </div>
                    
                    <div class="contact-section">
                        <h4>Local Council</h4>
                        <p>Contact your local council's housing department immediately if you're about to become homeless.</p>
                        <button class="find-council-btn">Find Your Local Council</button>
                    </div>
                    
                    <div class="contact-section">
                        <h4>Additional Support</h4>
                        <ul>
                            <li>Citizens Advice: <a href="tel:03444111444">0344 411 1444</a></li>
                            <li>Crisis: <a href="tel:08082429119">0808 242 9119</a></li>
                            <li>Domestic Violence Helpline: <a href="tel:08082000247">0808 200 0247</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => modal.remove());

        const findCouncilBtn = modal.querySelector('.find-council-btn');
        findCouncilBtn.addEventListener('click', () => {
            window.open('https://www.gov.uk/find-local-council', '_blank');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
});
