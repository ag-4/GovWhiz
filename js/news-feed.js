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
    }

    async initialize() {
        try {
            await this.fetchLatestNews();
            this.startTicker();
            // Refresh news every 5 minutes
            setInterval(() => this.fetchLatestNews(), 5 * 60 * 1000);
        } catch (error) {
            console.error('Failed to initialize news feed:', error);
            this.showError();
        }
    }

    async fetchLatestNews() {
        try {
            const response = await fetch('/data/latest-news.json');
            if (!response.ok) throw new Error('Failed to fetch news');
            
            const data = await response.json();
            this.newsItems = data.articles;
            this.updateTicker();
        } catch (error) {
            console.error('Error fetching news:', error);
            this.showError();
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

    showError() {
        if (this.newsTickerElement) {
            this.newsTickerElement.innerHTML = `
                <div class="news-ticker-item error">
                    Unable to load latest political updates. Please try again later.
                </div>
            `;
        }
    }
}

// Initialize news feed when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const newsFeed = new NewsFeedManager();
    newsFeed.initialize();
});
