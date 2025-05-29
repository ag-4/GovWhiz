// Lords lookup system for GovWhiz
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('lords-search');
    const searchBtn = document.getElementById('search-lords-btn');
    const resultsContainer = document.getElementById('lords-results');
    const filterSelect = document.getElementById('lords-filter');

    // Sample data - would be replaced with API call in production
    const lordsData = [
        { name: 'Lord Smith of Leigh', type: 'Life Peer', party: 'Labour', appointed: '2019', 
          expertise: ['Local Government', 'Health Services'], email: 'smithl@parliament.uk' },
        { name: 'Baroness Brown of Cambridge', type: 'Life Peer', party: 'Crossbench', appointed: '2015',
          expertise: ['Engineering', 'Climate Change'], email: 'brownj@parliament.uk' },
        { name: 'Lord Bishop of London', type: 'Bishop', party: 'Lords Spiritual', appointed: '2018',
          expertise: ['Religion', 'Education'], email: 'bishop.london@parliament.uk' },
        { name: 'Lord Howard of Lympne', type: 'Life Peer', party: 'Conservative', appointed: '2010',
          expertise: ['Government', 'Law'], email: 'howardm@parliament.uk' }
    ];

    // Search functionality
    function searchLords(query, filter = 'all') {
        query = query.toLowerCase();
        return lordsData.filter(lord => {
            const matchesQuery = lord.name.toLowerCase().includes(query) ||
                               lord.expertise.some(exp => exp.toLowerCase().includes(query));
            const matchesFilter = filter === 'all' || lord.type === filter;
            return matchesQuery && matchesFilter;
        });
    }

    // Display results
    function displayResults(results) {
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No Lords found matching your search criteria</p>';
            return;
        }

        resultsContainer.innerHTML = results.map(lord => `
            <div class="lord-card">
                <h3>${lord.name}</h3>
                <p class="lord-type">${lord.type}</p>
                <p class="lord-party">${lord.party}</p>
                <p class="lord-appointed">Appointed: ${lord.appointed}</p>
                <div class="lord-expertise">
                    <h4>Areas of Expertise:</h4>
                    <ul>${lord.expertise.map(exp => `<li>${exp}</li>`).join('')}</ul>
                </div>
                <a href="mailto:${lord.email}" class="contact-btn">Contact</a>
            </div>
        `).join('');
    }

    // Event listeners
    searchInput?.addEventListener('input', debounce((e) => {
        const results = searchLords(e.target.value, filterSelect.value);
        displayResults(results);
    }, 300));

    searchBtn?.addEventListener('click', () => {
        const results = searchLords(searchInput.value, filterSelect.value);
        displayResults(results);
    });

    filterSelect?.addEventListener('change', () => {
        const results = searchLords(searchInput.value, filterSelect.value);
        displayResults(results);
    });

    // Helper function
    function debounce(func, delay) {
        let debounceTimer;
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        }
    }

    // Initialize with all results
    if (resultsContainer) {
        displayResults(lordsData);
    }
});
