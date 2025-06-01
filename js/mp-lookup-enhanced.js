/**
 * Enhanced MP Lookup System
 * Includes AI-powered news integration and modern UI features
 */

class EnhancedMPLookupSystem {
    constructor() {
        this.cache = new Map();
        this.postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        this.apiEndpoint = '/api/mp-lookup';
        this.newsEndpoint = '/api/mp-news';
        this.contactEndpoint = '/api/contact';
        
        this.initializeUI();
    }

    initializeUI() {
        // Add ARIA labels for accessibility
        document.querySelectorAll('input, button').forEach(el => {
            if (!el.getAttribute('aria-label')) {
                el.setAttribute('aria-label', el.placeholder || el.textContent);
            }
        });

        // Add keyboard navigation
        const postcodeInput = document.getElementById('postcode-input');
        const findMpBtn = document.getElementById('find-mp-btn');

        if (postcodeInput && findMpBtn) {
            postcodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.findMP();
                }
            });

            // Add real-time validation
            postcodeInput.addEventListener('input', (e) => {
                this.validatePostcodeInput(e.target);
            });
        }
    }

    validatePostcodeInput(input) {
        const value = input.value.toUpperCase();
        const isValid = this.postcodeRegex.test(value);
        
        input.classList.toggle('is-valid', isValid);
        input.classList.toggle('is-invalid', value && !isValid);
        
        // Update aria-invalid attribute for screen readers
        input.setAttribute('aria-invalid', !isValid);
        
        return isValid;
    }

    async findMP() {
        const postcodeInput = document.getElementById('postcode-input');
        const mpResults = document.getElementById('mp-results');
        
        if (!postcodeInput || !mpResults) return;

        const postcode = postcodeInput.value.trim();
        
        if (!this.validatePostcodeInput(postcodeInput)) {
            mpResults.innerHTML = this.createErrorMessage('Please enter a valid UK postcode');
            return;
        }

        try {
            // Show loading state
            this.showLoadingState(mpResults);

            // Get MP data
            const mpData = await this.lookupMP(postcode);
            
            if (mpData.found) {
                // Get relevant news in parallel
                const newsData = await this.getRelevantNews(mpData.mp.name, mpData.constituency);
                mpData.mp.news = newsData;
                
                // Display results
                this.displayMPResults(mpData, mpResults);
            } else {
                mpResults.innerHTML = this.createErrorMessage(mpData.error || 'MP not found');
            }
            
        } catch (error) {
            console.error('Error:', error);
            mpResults.innerHTML = this.createErrorMessage('An error occurred while looking up your MP');
        }
    }

    async lookupMP(postcode) {
        try {
            const response = await fetch(`${this.apiEndpoint}?postcode=${encodeURIComponent(postcode)}`);
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Failed to fetch MP data');
        }
    }

    async getRelevantNews(mpName, constituency) {
        try {
            const response = await fetch(`${this.newsEndpoint}?mp=${encodeURIComponent(mpName)}&constituency=${encodeURIComponent(constituency)}`);
            const data = await response.json();
            return data.articles || [];
        } catch (error) {
            console.error('News fetch error:', error);
            return [];
        }
    }

    showLoadingState(container) {
        container.innerHTML = `
            <div class="loading-container" role="status" aria-live="polite">
                <div class="spinner"></div>
                <p>Looking up your MP...</p>
            </div>
        `;
    }

    displayMPResults(data, container) {
        const { mp } = data;
        const hasNews = mp.news && mp.news.length > 0;
        
        container.innerHTML = `
            <div class="mp-card" role="region" aria-label="MP Information">
                <div class="mp-header">
                    <div class="mp-info">
                        <h2>${mp.name}</h2>
                        <p class="constituency">${data.constituency}</p>
                        <p class="party">${mp.party}</p>
                    </div>
                    ${mp.image ? `<img src="${mp.image}" alt="${mp.name}" class="mp-image">` : ''}
                </div>
                
                <div class="mp-content">
                    <div class="contact-section" role="region" aria-label="Contact Information">
                        <h3>Contact Information</h3>
                        <ul>
                            ${mp.email ? `<li><a href="mailto:${mp.email}" aria-label="Email ${mp.name}"><i class="fas fa-envelope"></i> ${mp.email}</a></li>` : ''}
                            ${mp.phone ? `<li><a href="tel:${mp.phone}" aria-label="Call ${mp.name}"><i class="fas fa-phone"></i> ${mp.phone}</a></li>` : ''}
                            ${mp.website ? `<li><a href="${mp.website}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${mp.name}'s website"><i class="fas fa-globe"></i> Official Website</a></li>` : ''}
                        </ul>
                        
                        <button onclick="showContactForm('${mp.email}')" class="contact-btn" aria-label="Contact your MP">
                            Contact your MP
                        </button>
                    </div>
                    
                    ${hasNews ? `
                        <div class="news-section" role="region" aria-label="Recent News">
                            <h3>Recent News</h3>
                            <div class="news-list">
                                ${mp.news.map(article => `
                                    <article class="news-item">
                                        <h4><a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a></h4>
                                        <p>${article.summary}</p>
                                        <small>${new Date(article.date).toLocaleDateString()} | ${article.source}</small>
                                    </article>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createErrorMessage(message) {
        return `
            <div class="error-message" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <div class="examples">
                    <p>Try these example postcodes:</p>
                    <button onclick="mpLookup.tryPostcode('SW1A 1AA')">SW1A 1AA</button>
                    <button onclick="mpLookup.tryPostcode('M1 1AA')">M1 1AA</button>
                    <button onclick="mpLookup.tryPostcode('B1 1AA')">B1 1AA</button>
                </div>
            </div>
        `;
    }

    async submitContactForm(data) {
        try {
            const response = await fetch(this.contactEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to send message');
            }

            return {
                success: true,
                message: 'Your message has been sent successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'An error occurred while sending your message'
            };
        }
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mpLookup = new EnhancedMPLookupSystem();
});
