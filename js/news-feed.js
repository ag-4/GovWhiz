/**
 * BBC Politics News Feed Integration
 * Fetches and displays the latest political news with AI-powered summaries
 */

class NewsFeedManager {
    constructor() {
        this.newsItems = [];
        this.activeFilter = 'all';
        this.isLoading = false;
        this.container = null;
        this.filtersContainer = null;
        this.lastUpdate = null;
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
    }

    initialize() {
        this.container = document.getElementById('news-feed');
        this.filtersContainer = document.getElementById('news-filters');
        
        if (!this.container || !this.filtersContainer) {
            console.error('News feed containers not found');
            return;
        }

        // Initialize the feed
        this.fetchLatestNews();

        // Set up auto-refresh
        setInterval(() => this.fetchLatestNews(), this.updateInterval);

        // Make the containers visible
        this.container.style.transform = 'translateX(0)';
        this.filtersContainer.style.transform = 'translateX(0)';
    }

    async fetchLatestNews() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            const response = await fetch('/data/latest_news.json');
            if (!response.ok) throw new Error('Failed to fetch news');

            const data = await response.json();
            
            // Update news items
            this.newsItems = data.articles;
            this.lastUpdate = new Date();

            // Update the UI
            this.displayNews();
            this.updateFilters();

        } catch (error) {
            console.error('Error fetching news:', error);
            this.showError('Unable to load news feed');
        } finally {
            this.isLoading = false;
        }
    }

    displayNews() {
        if (!this.container || !this.newsItems.length) {
            this.showError('No news items available');
            return;
        }

        // Filter items if needed
        const items = this.activeFilter === 'all' 
            ? this.newsItems 
            : this.newsItems.filter(item => item.category.toLowerCase() === this.activeFilter.toLowerCase());

        if (!items.length) {
            this.container.innerHTML = `
                <div class="text-sm font-medium text-cyan-400 mb-4 flex items-center justify-between">
                    <span>Latest News</span>
                    <button class="text-gray-400 hover:text-white transition-colors" onclick="document.getElementById('news-feed').style.transform = 'translateX(120%)'">×</button>
                </div>
                <div class="text-gray-400 text-center">No news items found for this category</div>
            `;
            return;
        }

        this.container.innerHTML = `
            <div class="text-sm font-medium text-cyan-400 mb-4 flex items-center justify-between">
                <span>Latest News</span>
                <button class="text-gray-400 hover:text-white transition-colors" onclick="document.getElementById('news-feed').style.transform = 'translateX(120%)'">×</button>
            </div>
            ${items.map(item => `
                <div class="mb-6 last:mb-0">
                    <span class="inline-block px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full mb-2">${item.category}</span>
                    <h4 class="text-white text-sm font-medium mb-1">${item.title}</h4>
                    <p class="text-gray-400 text-xs mb-2">${item.ai_summary || item.original_summary}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">${this.formatDate(item.published)}</span>
                        <a href="${item.link}" target="_blank" class="text-xs text-cyan-400 hover:text-cyan-300">Read Full Article →</a>
                    </div>
                </div>
            `).join('')}
        `;
    }

    updateFilters() {
        if (!this.filtersContainer || !this.newsItems.length) return;

        // Get unique categories
        const categories = [...new Set(this.newsItems.map(item => item.category))];
        
        this.filtersContainer.innerHTML = `
            <button class="px-3 py-1 text-sm ${this.activeFilter === 'all' ? 'bg-cyan-500' : 'bg-gray-800'} hover:bg-gray-700 rounded-full text-gray-300 transition-colors" 
                    onclick="newsManager.filterNews('all')">
                All
            </button>
            ${categories.map(cat => `
                <button class="px-3 py-1 text-sm ${this.activeFilter === cat.toLowerCase() ? 'bg-cyan-500' : 'bg-gray-800'} hover:bg-gray-700 rounded-full text-gray-300 transition-colors"
                        onclick="newsManager.filterNews('${cat.toLowerCase()}')">
                    ${cat}
                </button>
            `).join('')}
        `;
    }

    filterNews(category) {
        this.activeFilter = category;
        this.displayNews();
        this.updateFilters();
    }

    showLoading() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="text-sm font-medium text-cyan-400 mb-4 flex items-center justify-between">
                <span>Latest News</span>
                <button class="text-gray-400 hover:text-white transition-colors" onclick="document.getElementById('news-feed').style.transform = 'translateX(120%)'">×</button>
            </div>
            <div class="text-cyan-400 text-center">
                <svg class="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Loading latest news...
            </div>
        `;
    }

    showError(message) {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="text-sm font-medium text-cyan-400 mb-4 flex items-center justify-between">
                <span>Latest News</span>
                <button class="text-gray-400 hover:text-white transition-colors" onclick="document.getElementById('news-feed').style.transform = 'translateX(120%)'">×</button>
            </div>
            <div class="text-red-400 text-center">${message}</div>
        `;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async testFeed() {
        console.log('🧪 Testing news feed...');
        try {
            await this.fetchLatestNews();
            console.log(`✅ News feed working - ${this.newsItems.length} items loaded`);
            return true;
        } catch (error) {
            console.error('❌ News feed test failed:', error);
            return false;
        }
    }
}

// Create global instance
const newsManager = new NewsFeedManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    newsManager.initialize();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NewsFeedManager, newsManager };
}
