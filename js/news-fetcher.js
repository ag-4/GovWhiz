/**
 * AI-Powered News Fetcher for MP Information
 * Handles news retrieval from The Guardian and BBC
 */
class MPNewsFetcher {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 3600000; // 1 hour
        this.guardianEndpoint = '/api/news/guardian';
        this.bbcEndpoint = '/api/news/bbc';
    }

    /**
     * Fetch and analyze news articles about an MP
     */
    async fetchMPNews(mp, constituency) {
        try {
            const cacheKey = `${mp.name}-${constituency}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    return cached.data;
                }
            }

            const [guardianNews, bbcNews] = await Promise.all([
                this.fetchGuardianNews(mp, constituency),
                this.fetchBBCNews(mp, constituency)
            ]);

            const combinedNews = this.processAndRankNews([...guardianNews, ...bbcNews], mp);
            
            this.cache.set(cacheKey, {
                data: combinedNews,
                timestamp: Date.now()
            });

            return combinedNews;
        } catch (error) {
            console.error('News fetch error:', error);
            return [];
        }
    }

    /**
     * Fetch news from The Guardian
     */
    async fetchGuardianNews(mp, constituency) {
        const query = `${mp.name} ${constituency} parliament`;
        const response = await fetch(`${this.guardianEndpoint}?q=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.articles || [];
    }

    /**
     * Fetch news from BBC
     */
    async fetchBBCNews(mp, constituency) {
        const query = `${mp.name} ${constituency} parliament`;
        const response = await fetch(`${this.bbcEndpoint}?q=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.articles || [];
    }

    /**
     * Process and rank news articles by relevance
     */
    processAndRankNews(articles, mp) {
        return articles
            .map(article => ({
                ...article,
                relevanceScore: this.calculateRelevanceScore(article, mp)
            }))
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 10) // Return top 10 most relevant articles
            .map(({ relevanceScore, ...article }) => article);
    }

    /**
     * Calculate relevance score for article
     */
    calculateRelevanceScore(article, mp) {
        let score = 0;
        const searchTerms = [
            mp.name.toLowerCase(),
            mp.constituency.toLowerCase(),
            mp.party.toLowerCase()
        ];

        // Check title relevance
        const title = article.title.toLowerCase();
        searchTerms.forEach(term => {
            if (title.includes(term)) score += 3;
        });

        // Check content relevance
        const content = article.description.toLowerCase();
        searchTerms.forEach(term => {
            if (content.includes(term)) score += 1;
        });

        // Boost recent articles
        const articleDate = new Date(article.publishedAt);
        const daysSincePublished = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
        score *= Math.exp(-daysSincePublished / 30); // Exponential decay over 30 days

        return score;
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mpNewsFetcher = new MPNewsFetcher();
});
