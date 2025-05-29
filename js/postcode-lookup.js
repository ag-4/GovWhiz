document.addEventListener('DOMContentLoaded', () => {
    const postcodeInput = document.getElementById('postcode-input');
    const findMpBtn = document.getElementById('find-mp-btn');
    const postcodeSuggestions = document.getElementById('postcodeSuggestions');
    const mpResults = document.getElementById('mp-results');

    // Regular expression for UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

    // Sample data for demonstration
    const sampleData = {
        'SW1A': { constituency: 'Cities of London and Westminster', mp: 'Nickie Aiken', party: 'Conservative', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000' },
        'E1': { constituency: 'Bethnal Green and Bow', mp: 'Rushanara Ali', party: 'Labour', email: 'rushanara.ali.mp@parliament.uk', phone: '020 7219 7200' },
        'M1': { constituency: 'Manchester Central', mp: 'Lucy Powell', party: 'Labour', email: 'lucy.powell.mp@parliament.uk', phone: '020 7219 4402' },
        'B1': { constituency: 'Birmingham, Ladywood', mp: 'Shabana Mahmood', party: 'Labour', email: 'shabana.mahmood.mp@parliament.uk', phone: '020 7219 5044' },
        'G1': { constituency: 'Glasgow Central', mp: 'Alison Thewliss', party: 'Scottish National Party', email: 'alison.thewliss.mp@parliament.uk', phone: '020 7219 8471' },
    };

    postcodeInput.addEventListener('input', debounce(getSuggestions, 300));
    findMpBtn.addEventListener('click', () => findMP());

    function debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        }
    }

    function validatePostcode(postcode) {
        return postcodeRegex.test(postcode);
    }

    function getSuggestions() {
        const postcode = postcodeInput.value.trim().toUpperCase();
        if (postcode.length < 2) {
            postcodeSuggestions.innerHTML = '';
            return;
        }

        // Show loading state for suggestions
        postcodeSuggestions.innerHTML = '<div class="loading">Loading suggestions...</div>';

        // Simulate API delay for demonstration
        setTimeout(() => {
            const suggestions = Object.keys(sampleData)
                .filter(pc => pc.startsWith(postcode))
                .map(pc => `<div class="suggestion" data-postcode="${pc}">${pc}</div>`)
                .join('');

            postcodeSuggestions.innerHTML = suggestions || '<div class="no-results">No suggestions found</div>';
        }, 300);
    }

    async function findMP() {
        const postcode = postcodeInput.value.trim().toUpperCase();
        
        // Clear previous results
        mpResults.innerHTML = '';
        
        if (!postcode) {
            showError('Please enter a postcode');
            return;
        }

        if (!validatePostcode(postcode)) {
            showError('Please enter a valid UK postcode');
            return;
        }

        showLoading();

        try {
            // First API call to get constituency
            const constituencyResponse = await fetch(`https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${encodeURIComponent(postcode)}`);
            if (!constituencyResponse.ok) throw new Error('Failed to fetch constituency data');
            
            const constituencyData = await constituencyResponse.json();
            if (!constituencyData.items?.length) {
                throw new Error('No constituency found for this postcode');
            }

            const constituency = constituencyData.items[0].value;

            // Second API call to get MP details
            const mpResponse = await fetch(`https://members-api.parliament.uk/api/Location/Constituency/${constituency.id}/Members`);
            if (!mpResponse.ok) throw new Error('Failed to fetch MP data');

            const mpData = await mpResponse.json();
            if (!mpData.items?.length) {
                throw new Error('No current MP found for this constituency');
            }

            const mp = mpData.items[0].value;
            
            // Get MP's social media links if available
            const socialLinks = mp.socialLinks || [];
            const twitterHandle = socialLinks.find(s => s.type === 'Twitter')?.value || '';
            const facebookPage = socialLinks.find(s => s.type === 'Facebook')?.value || '';

            // Format and display the results
            mpResults.innerHTML = `
                <div class="mp-card">
                    <div class="mp-header">
                        <h3>Your Constituency</h3>
                        <h2>${mp.latestHouseMembership.membershipFrom}</h2>
                    </div>
                    <div class="mp-details">
                        <h3>Your MP: ${mp.nameDisplayAs}</h3>
                        <div class="mp-info">
                            <p><strong>Party:</strong> ${mp.latestParty.name}</p>
                            <p><strong>Email:</strong> ${mp.contactDetails.find(c => c.type === 'Email')?.value || 'Not available'}</p>
                            <p><strong>Phone:</strong> ${mp.contactDetails.find(c => c.type === 'Phone')?.value || 'Not available'}</p>
                            ${mp.contactDetails.find(c => c.type === 'Address')?.value ? 
                                `<p><strong>Address:</strong> ${mp.contactDetails.find(c => c.type === 'Address').value}</p>` : ''}
                            ${twitterHandle ? `<p><strong>Twitter:</strong> <a href="https://twitter.com/${twitterHandle}" target="_blank">@${twitterHandle}</a></p>` : ''}
                            ${facebookPage ? `<p><strong>Facebook:</strong> <a href="${facebookPage}" target="_blank">View Profile</a></p>` : ''}
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred while fetching MP data');
        }
    }

    function showError(message) {
        mpResults.innerHTML = `<div class="error-message">${message}</div>`;
    }

    function showLoading() {
        mpResults.innerHTML = `
            <div class="loading-message">
                <div class="spinner"></div>
                <p>Searching for your MP...</p>
            </div>
        `;
    }

    postcodeSuggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion')) {
            postcodeInput.value = e.target.dataset.postcode;
            postcodeSuggestions.innerHTML = '';
            findMP();
        }
    });

    // Handle example postcode buttons
    document.querySelectorAll('.postcode-example').forEach(button => {
        button.addEventListener('click', () => {
            const postcode = button.dataset.postcode;
            postcodeInput.value = postcode;
            findMP();
        });
    });

    // Add keyboard navigation
    postcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findMP();
        }
    });
});
