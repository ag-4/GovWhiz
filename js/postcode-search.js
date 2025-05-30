// Postcode search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsDiv = document.getElementById('results');

    // Handle example postcode searches
    window.trySearch = function(searchTerm) {
        if (searchInput) {
            searchInput.value = searchTerm;
            handleSearch();
        }
    };

    function handleSearch() {
        if (!searchInput.value.trim()) {
            showError('Please enter a search term');
            return;
        }

        // Show loading state
        resultsDiv.innerHTML = `
            <div class="flex items-center justify-center space-x-2">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                <span class="text-cyan-400">Searching...</span>
            </div>
        `;

        // Simulated API call (replace with actual API integration)
        setTimeout(() => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const results = getLegislationResults(searchTerm);
            displayResults(results);
        }, 1000);
    }

    function getLegislationResults(searchTerm) {
        // Sample data - replace with actual API integration
        const legislationData = {
            'data protection': [
                { title: 'Data Protection Act 2018', type: 'Act', status: 'In force' },
                { title: 'UK GDPR', type: 'Regulation', status: 'In force' },
                { title: 'Privacy and Electronic Communications Regulations', type: 'Regulation', status: 'In force' }
            ],
            'climate change': [
                { title: 'Climate Change Act 2008', type: 'Act', status: 'In force' },
                { title: 'Environment Act 2021', type: 'Act', status: 'In force' },
                { title: 'Net Zero Strategy', type: 'Policy', status: 'Active' }
            ],
            'housing': [
                { title: 'Housing Act 2004', type: 'Act', status: 'In force' },
                { title: 'Rental Reform Bill', type: 'Bill', status: 'In progress' },
                { title: 'Building Safety Act 2022', type: 'Act', status: 'In force' }
            ],
            'education': [
                { title: 'Education Act 2011', type: 'Act', status: 'In force' },
                { title: 'Higher Education Act 2004', type: 'Act', status: 'In force' },
                { title: 'Skills and Post-16 Education Act 2022', type: 'Act', status: 'In force' }
            ]
        };

        return legislationData[searchTerm] || [];
    }

    function displayResults(results) {
        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="text-gray-400 text-center">
                    No results found. Try another search term or browse popular topics.
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="border-b border-gray-700/50 last:border-0 py-3">
                <div class="font-medium text-white">${result.title}</div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs px-2 py-1 rounded-full bg-indigo-900/50 text-indigo-300">${result.type}</span>
                    <span class="text-xs px-2 py-1 rounded-full bg-cyan-900/50 text-cyan-300">${result.status}</span>
                </div>
            </div>
        `).join('');

        resultsDiv.innerHTML = resultsHTML;
    }

    function showError(message) {
        resultsDiv.innerHTML = `
            <div class="text-red-400 text-center">
                ${message}
            </div>
        `;
    }

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
});
