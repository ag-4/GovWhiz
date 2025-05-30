// Unified Parliament Search System
class ParliamentSearch {
    constructor() {
        this.currentTab = 'mp';
        this.setupEventListeners();
        this.api = new APIClient();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        // Search form submissions
        document.getElementById('mpSearchForm').addEventListener('submit', e => this.handleMPSearch(e));
        document.getElementById('lordsSearchForm').addEventListener('submit', e => this.handleLordsSearch(e));
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });

        // Update content visibility
        document.getElementById('mpSearch').classList.toggle('hidden', tab !== 'mp');
        document.getElementById('lordsSearch').classList.toggle('hidden', tab !== 'lords');

        // Clear results
        this.clearResults();
    }

    async handleMPSearch(event) {
        event.preventDefault();
        const postcode = document.getElementById('postcodeInput').value.trim();
        
        if (!this.validatePostcode(postcode)) {
            this.showError('Please enter a valid UK postcode');
            return;
        }

        this.showLoading();
        try {
            const mp = await this.api.lookupMP(postcode);
            if (mp.found) {
                this.displayMPResult(mp);
            } else {
                this.showError(mp.error || 'No MP found for this postcode');
            }
        } catch (error) {
            this.showError('Error looking up MP. Please try again.');
            console.error('MP lookup error:', error);
        }
        this.hideLoading();
    }

    async handleLordsSearch(event) {
        event.preventDefault();
        const query = event.target.querySelector('input').value.trim();
        
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        this.showLoading();
        try {
            const lords = await this.api.searchLords(query);
            this.displayLordsResults(lords);
        } catch (error) {
            this.showError('Error searching Lords. Please try again.');
            console.error('Lords search error:', error);
        }
        this.hideLoading();
    }

    validatePostcode(postcode) {
        const pattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        return pattern.test(postcode);
    }

    displayMPResult(mp) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = `
            <div class="parliament-member">
                ${mp.image ? `<img src="${mp.image}" alt="${mp.name}" class="member-photo">` : ''}
                <div class="member-info">
                    <h3>${mp.name}</h3>
                    <p>${mp.constituency}</p>
                    <p>${mp.party}</p>
                </div>
                <div class="member-actions">
                    <button onclick="contactMP('${mp.email}')" class="member-action">Contact</button>
                    <button onclick="viewProfile('${mp.website}')" class="member-action">Profile</button>
                </div>
            </div>
        `;
    }

    displayLordsResults(lords) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = lords.map(lord => `
            <div class="parliament-member">
                ${lord.image ? `<img src="${lord.image}" alt="${lord.name}" class="member-photo">` : ''}
                <div class="member-info">
                    <h3>${lord.name}</h3>
                    <p>${lord.title}</p>
                    <p>${lord.expertise.join(', ')}</p>
                </div>
                <div class="member-actions">
                    <button onclick="contactLord('${lord.email}')" class="member-action">Contact</button>
                    <button onclick="viewProfile('${lord.profile}')" class="member-action">Profile</button>
                </div>
            </div>
        `).join('');
    }

    showLoading() {
        document.querySelector('.loader').classList.add('active');
    }

    hideLoading() {
        document.querySelector('.loader').classList.remove('active');
    }

    showError(message) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    clearResults() {
        document.getElementById('searchResults').innerHTML = '';
    }
}

// Initialize the search system
const parliamentSearch = new ParliamentSearch();

// Quick search functions
function quickSearch(postcode) {
    document.getElementById('postcodeInput').value = postcode;
    document.getElementById('mpSearchForm').dispatchEvent(new Event('submit'));
}

function filterLords(expertise) {
    document.querySelector('#lordsSearch input').value = expertise;
    document.getElementById('lordsSearchForm').dispatchEvent(new Event('submit'));
}

// Contact functions
function contactMP(email) {
    if (email) {
        contactForm.showModal(email);
    } else {
        alert('Contact information not available');
    }
}

function contactLord(email) {
    if (email) {
        contactForm.showModal(email);
    } else {
        alert('Contact information not available');
    }
}

function viewProfile(url) {
    if (url) {
        window.open(url, '_blank');
    } else {
        alert('Profile not available');
    }
}
