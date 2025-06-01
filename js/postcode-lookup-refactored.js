document.addEventListener('DOMContentLoaded', () => {
    const postcodeInput = document.getElementById('postcode-input');
    const findMpBtn = document.getElementById('find-mp-btn');
    const postcodeSuggestions = document.getElementById('postcodeSuggestions');
    const mpResults = document.getElementById('mp-results');

    // Regular expression for UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

    // Event listeners
    postcodeInput.addEventListener('input', debounce(getSuggestions, 300));
    findMpBtn.addEventListener('click', () => findMP());
    postcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
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

    // Debounce helper
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

    function showError(message) {
        mpResults.innerHTML = `
            <div class="error-message p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>${message}</p>
            </div>`;
    }

    function showLoading() {
        mpResults.innerHTML = `
            <div class="loading-message flex items-center justify-center p-8">
                <div class="spinner mr-3"></div>
                <p class="text-gray-600">Searching for your MP...</p>
            </div>`;
    }

    function displayMPResults(data) {
        const mp = data.mp;
        const constituency = data.constituency;

        mpResults.innerHTML = `
            <div class="mp-card bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="mp-header bg-gray-50 p-6 border-b">
                    <h3 class="text-lg text-gray-600">Your Constituency</h3>
                    <h2 class="text-2xl font-bold text-gray-900">${constituency}</h2>
                </div>
                <div class="mp-details p-6">
                    <div class="flex items-start">
                        ${mp.image ? `
                            <img src="${mp.image}" alt="${mp.name}" class="w-32 h-40 object-cover rounded-lg mr-6">
                        ` : ''}
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold mb-4">${mp.name}</h3>
                            <div class="mp-info space-y-3 text-gray-600">
                                <p><strong class="text-gray-700">Party:</strong> ${mp.party}</p>
                                <p>
                                    <strong class="text-gray-700">Email:</strong> 
                                    <a href="mailto:${mp.email}" class="text-blue-600 hover:underline">${mp.email}</a>
                                </p>
                                ${mp.phone ? `
                                    <p>
                                        <strong class="text-gray-700">Phone:</strong>
                                        <a href="tel:${mp.phone}" class="text-blue-600 hover:underline">${mp.phone}</a>
                                    </p>
                                ` : ''}
                                ${mp.website ? `
                                    <p>
                                        <strong class="text-gray-700">Website:</strong>
                                        <a href="${mp.website}" target="_blank" class="text-blue-600 hover:underline">Visit website</a>
                                    </p>
                                ` : ''}
                                ${mp.twitter ? `
                                    <p>
                                        <strong class="text-gray-700">Twitter:</strong>
                                        <a href="https://twitter.com/${mp.twitter}" target="_blank" class="text-blue-600 hover:underline">@${mp.twitter}</a>
                                    </p>
                                ` : ''}
                                ${mp.facebook ? `
                                    <p>
                                        <strong class="text-gray-700">Facebook:</strong>
                                        <a href="${mp.facebook}" target="_blank" class="text-blue-600 hover:underline">View Profile</a>
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
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
            // Use Netlify function to look up MP
            const response = await fetch(`/.netlify/functions/mp-lookup?postcode=${encodeURIComponent(postcode)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to look up MP');
            }
            
            if (!data.found || !data.mp) {
                throw new Error('No MP found for this postcode');
            }

            displayMPResults(data);

        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred while fetching MP data');
        }
    }

    // Suggestion handling
    function getSuggestions() {
        const postcode = postcodeInput.value.trim().toUpperCase();
        if (postcode.length < 2) {
            postcodeSuggestions.innerHTML = '';
            return;
        }

        fetch(`/.netlify/functions/postcode-suggestions?q=${encodeURIComponent(postcode)}`)
            .then(response => response.json())
            .then(data => {
                if (data.suggestions?.length) {
                    const suggestions = data.suggestions
                        .map(pc => `<div class="suggestion px-4 py-2 hover:bg-gray-100 cursor-pointer" data-postcode="${pc}">${pc}</div>`)
                        .join('');
                    postcodeSuggestions.innerHTML = suggestions;
                } else {
                    postcodeSuggestions.innerHTML = '';
                }
            })
            .catch(() => {
                postcodeSuggestions.innerHTML = '';
            });
    }

    // Handle suggestion clicks
    postcodeSuggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion')) {
            postcodeInput.value = e.target.dataset.postcode;
            postcodeSuggestions.innerHTML = '';
            findMP();
        }
    });
});
