/**
 * BBC Politics News Feed Integration
 * Fetches and displays the latest political news with AI-powered summaries
 */

class NewsFeedManager {
    constructor() {
        this.newsTickerElement = document.getElementById('news-feed');
        this.currentNewsIndex = 0;
        this.newsItems = [];
        this.tickerInterval = null;
        this.errorRetryDelay = 30000; // 30 seconds
        this.offlineStore = null;
        this.errorElement = document.getElementById('news-feed-error');
    }

    async initialize() {
        try {
            await this.setupOfflineStore();
            await this.fetchLatestNews();
            this.startTicker();
            this.displayNews(); // Display initial news
            
            // Setup periodic refresh
            setInterval(() => {
                this.fetchLatestNews();
                this.displayNews();
            }, 5 * 60 * 1000);
            
            // Listen for online/offline events
            window.addEventListener('online', () => this.handleOnlineStatus(true));
            window.addEventListener('offline', () => this.handleOnlineStatus(false));
        } catch (error) {
            console.error('Failed to initialize news feed:', error);
            this.showError('Unable to load news feed. Retrying...');
            setTimeout(() => this.initialize(), this.errorRetryDelay);
        }
    }

    async fetchLatestNews() {
        try {
            const response = await fetch('/data/latest-news.json', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch news');
            
            const data = await response.json();
            this.newsItems = data.articles;
            
            // Store for offline use
            await this.storeOfflineData(data);
            
            this.hideError();
            this.updateTicker();
        } catch (error) {
            console.error('Error fetching news:', error);
            
            // Try to load offline data
            const offlineData = await this.getOfflineData();
            if (offlineData) {
                this.newsItems = offlineData.articles;
                this.updateTicker();
                this.showError('Using offline news data');
            } else {
                this.showError('Unable to load news feed');
            }
        }
    }

    async setupOfflineStore() {
        this.offlineStore = await localforage.createInstance({
            name: 'GovWhiz',
            storeName: 'news_feed'
        });
    }

    async storeOfflineData(data) {
        try {
            await this.offlineStore.setItem('latest_news', {
                timestamp: Date.now(),
                data: data
            });
        } catch (error) {
            console.warn('Failed to store offline news data:', error);
        }
    }

    async getOfflineData() {
        try {
            const stored = await this.offlineStore.getItem('latest_news');
            if (stored && (Date.now() - stored.timestamp) < (24 * 60 * 60 * 1000)) { // 24 hours
                return stored.data;
            }
        } catch (error) {
            console.warn('Failed to retrieve offline news data:', error);
        }
        return null;
    }

    handleOnlineStatus(isOnline) {
        if (isOnline) {
            this.hideError();
            this.fetchLatestNews();
        } else {
            this.showError('Working offline - displaying cached news');
        }
    }

    updateTicker() {
        if (!this.newsTickerElement || !this.newsItems.length) return;

        const currentNews = this.newsItems[this.currentNewsIndex];
        this.newsTickerElement.innerHTML = `
            <div class="news-ticker-item">
                ${currentNews.ai_summary || currentNews.title}
            </div>
        `;
    }

    startTicker() {
        if (this.tickerInterval) clearInterval(this.tickerInterval);
        
        this.tickerInterval = setInterval(() => {
            this.currentNewsIndex = (this.currentNewsIndex + 1) % this.newsItems.length;
            this.updateTicker();
        }, 8000); // Change news every 8 seconds
    }

    showError(message) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
        }
    }

    hideError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
    }

    displayNews() {
        const container = document.getElementById('political-news-container');
        if (!container) return;

        container.innerHTML = this.newsItems.map(news => `
            <article class="bg-white/5 backdrop-blur-lg rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <img src="${news.image || '/images/placeholder-news.jpg'}" alt="${news.title}" class="w-full h-48 object-cover rounded-lg mb-4">
                <div class="mb-3">
                    <span class="inline-block px-3 py-1 text-xs font-semibold text-cyan-400 bg-cyan-900/30 rounded-full">${news.category}</span>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">${news.title}</h3>
                <p class="text-gray-300 mb-4">${news.summary}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">${new Date(news.date).toLocaleDateString()}</span>
                    <a href="${news.url}" target="_blank" class="text-cyan-400 hover:text-cyan-300">Read More →</a>
                </div>
            </article>
        `).join('');
    }

    filterNews(category) {
        if (category === 'all') {
            this.displayNews();
            return;
        }
        
        const container = document.getElementById('political-news-container');
        if (!container) return;

        const filteredNews = this.newsItems.filter(news => 
            news.category.toLowerCase() === category.toLowerCase()
        );

        container.innerHTML = filteredNews.map(news => `
            <article class="bg-white/5 backdrop-blur-lg rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <img src="${news.image || '/images/placeholder-news.jpg'}" alt="${news.title}" class="w-full h-48 object-cover rounded-lg mb-4">
                <div class="mb-3">
                    <span class="inline-block px-3 py-1 text-xs font-semibold text-cyan-400 bg-cyan-900/30 rounded-full">${news.category}</span>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">${news.title}</h3>
                <p class="text-gray-300 mb-4">${news.summary}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">${new Date(news.date).toLocaleDateString()}</span>
                    <a href="${news.url}" target="_blank" class="text-cyan-400 hover:text-cyan-300">Read More →</a>
                </div>
            </article>
        `).join('');
    }
}

// Create global instance
const newsManager = new NewsFeedManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    newsManager.initialize();
});

// Global filter function for the buttons
function filterNews(category) {
    newsManager.filterNews(category);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NewsFeedManager, newsManager };
}
