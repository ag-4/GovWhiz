/**
 * GovWhiz Advanced Search & AI-Powered Features
 * Semantic search, AI summaries, and intelligent recommendations
 */

class GovWhizAdvancedSearch {
    constructor() {
        this.searchHistory = [];
        this.searchSuggestions = [];
        this.aiCache = new Map();
        this.searchFilters = {
            category: 'all',
            status: 'all',
            dateRange: 'all',
            party: 'all',
            impact: 'all'
        };
        
        this.init();
    }

    init() {
        this.setupAdvancedSearch();
        this.initializeAI();
        this.loadSearchHistory();
        this.setupSearchAnalytics();
    }

    // Advanced Search Interface
    setupAdvancedSearch() {
        const searchSection = document.querySelector('.search-section');
        if (!searchSection) return;

        // Add advanced search toggle
        const advancedToggle = document.createElement('div');
        advancedToggle.className = 'advanced-search-toggle';
        advancedToggle.innerHTML = `
            <button id="advanced-toggle" class="toggle-btn">
                🔍 Advanced Search
            </button>
        `;

        // Create advanced search panel
        const advancedPanel = document.createElement('div');
        advancedPanel.className = 'advanced-search-panel hidden';
        advancedPanel.innerHTML = `
            <div class="search-filters">
                <div class="filter-group">
                    <label>Category:</label>
                    <select id="category-filter">
                        <option value="all">All Categories</option>
                        <option value="Technology & Digital Rights">Technology & Digital Rights</option>
                        <option value="Health & Social Care">Health & Social Care</option>
                        <option value="Education & Children">Education & Children</option>
                        <option value="Environment & Climate">Environment & Climate</option>
                        <option value="Business & Finance">Business & Finance</option>
                        <option value="Employment & Workers' Rights">Employment & Workers' Rights</option>
                        <option value="Housing & Planning">Housing & Planning</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Status:</label>
                    <select id="status-filter">
                        <option value="all">All Statuses</option>
                        <option value="in-progress">In Progress</option>
                        <option value="enacted">Enacted</option>
                        <option value="committee">Committee Stage</option>
                        <option value="reading">Reading Stage</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Date Range:</label>
                    <select id="date-filter">
                        <option value="all">All Time</option>
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                        <option value="year">Past Year</option>
                        <option value="session">Current Session</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Impact Level:</label>
                    <select id="impact-filter">
                        <option value="all">All Impacts</option>
                        <option value="high">High Impact</option>
                        <option value="medium">Medium Impact</option>
                        <option value="low">Low Impact</option>
                    </select>
                </div>
            </div>
            
            <div class="search-options">
                <div class="search-mode">
                    <label>Search Mode:</label>
                    <div class="mode-buttons">
                        <button class="mode-btn active" data-mode="semantic">🧠 Smart Search</button>
                        <button class="mode-btn" data-mode="exact">📝 Exact Match</button>
                        <button class="mode-btn" data-mode="fuzzy">🔍 Fuzzy Search</button>
                    </div>
                </div>
                
                <div class="ai-features">
                    <button id="ai-summary-btn" class="ai-btn">🤖 AI Summary</button>
                    <button id="impact-analysis-btn" class="ai-btn">📊 Impact Analysis</button>
                    <button id="related-bills-btn" class="ai-btn">🔗 Find Related</button>
                </div>
            </div>
        `;

        searchSection.appendChild(advancedToggle);
        searchSection.appendChild(advancedPanel);

        this.setupAdvancedEventListeners();
    }

    setupAdvancedEventListeners() {
        // Toggle advanced panel
        document.getElementById('advanced-toggle')?.addEventListener('click', () => {
            const panel = document.querySelector('.advanced-search-panel');
            panel.classList.toggle('hidden');
            
            const btn = document.getElementById('advanced-toggle');
            btn.textContent = panel.classList.contains('hidden') ? 
                '🔍 Advanced Search' : '🔼 Simple Search';
        });

        // Filter change listeners
        ['category-filter', 'status-filter', 'date-filter', 'impact-filter'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.searchFilters[id.replace('-filter', '')] = e.target.value;
                this.applyFilters();
            });
        });

        // Search mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.searchMode = e.target.dataset.mode;
            });
        });

        // AI feature buttons
        document.getElementById('ai-summary-btn')?.addEventListener('click', () => this.generateAISummary());
        document.getElementById('impact-analysis-btn')?.addEventListener('click', () => this.performImpactAnalysis());
        document.getElementById('related-bills-btn')?.addEventListener('click', () => this.findRelatedBills());
    }

    // Semantic Search Implementation
    async performSemanticSearch(query) {
        // Simulate advanced semantic search
        const results = await this.searchWithAI(query);
        return this.rankResults(results, query);
    }

    async searchWithAI(query) {
        // Simulate AI-powered search understanding
        const searchTerms = this.extractSearchTerms(query);
        const context = this.analyzeSearchContext(query);
        
        // Enhanced search logic
        const allLegislation = window.mockLegislation || {};
        const results = [];

        for (const [title, bill] of Object.entries(allLegislation)) {
            const relevanceScore = this.calculateRelevance(query, title, bill, searchTerms, context);
            if (relevanceScore > 0.1) {
                results.push({
                    title,
                    bill,
                    relevanceScore,
                    matchReasons: this.getMatchReasons(query, title, bill)
                });
            }
        }

        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    extractSearchTerms(query) {
        // Advanced term extraction with synonyms and related concepts
        const terms = query.toLowerCase().split(/\s+/);
        const expandedTerms = new Set(terms);

        // Add synonyms and related terms
        const synonymMap = {
            'health': ['healthcare', 'medical', 'nhs', 'wellbeing'],
            'education': ['school', 'university', 'learning', 'student'],
            'environment': ['climate', 'green', 'sustainability', 'carbon'],
            'technology': ['digital', 'ai', 'data', 'cyber', 'online'],
            'economy': ['economic', 'finance', 'business', 'trade', 'money']
        };

        terms.forEach(term => {
            if (synonymMap[term]) {
                synonymMap[term].forEach(synonym => expandedTerms.add(synonym));
            }
        });

        return Array.from(expandedTerms);
    }

    analyzeSearchContext(query) {
        // Analyze search intent and context
        const context = {
            intent: 'general',
            urgency: 'normal',
            scope: 'national',
            timeframe: 'current'
        };

        // Intent detection
        if (query.includes('how') || query.includes('what') || query.includes('explain')) {
            context.intent = 'explanation';
        } else if (query.includes('when') || query.includes('timeline')) {
            context.intent = 'timeline';
        } else if (query.includes('impact') || query.includes('affect')) {
            context.intent = 'impact';
        }

        // Urgency detection
        if (query.includes('urgent') || query.includes('emergency') || query.includes('immediate')) {
            context.urgency = 'high';
        }

        // Scope detection
        if (query.includes('local') || query.includes('constituency')) {
            context.scope = 'local';
        } else if (query.includes('international') || query.includes('global')) {
            context.scope = 'international';
        }

        return context;
    }

    calculateRelevance(query, title, bill, searchTerms, context) {
        let score = 0;

        // Title matching (highest weight)
        const titleWords = title.toLowerCase().split(/\s+/);
        const titleMatches = searchTerms.filter(term => 
            titleWords.some(word => word.includes(term) || term.includes(word))
        ).length;
        score += titleMatches * 0.4;

        // Summary matching
        const summaryWords = bill.summary.toLowerCase().split(/\s+/);
        const summaryMatches = searchTerms.filter(term =>
            summaryWords.some(word => word.includes(term) || term.includes(word))
        ).length;
        score += summaryMatches * 0.3;

        // Category matching
        if (bill.category && searchTerms.some(term => 
            bill.category.toLowerCase().includes(term)
        )) {
            score += 0.2;
        }

        // Context-based scoring
        if (context.intent === 'impact' && bill.implications) {
            score += 0.1;
        }

        // Apply filters
        score *= this.getFilterMultiplier(bill);

        return Math.min(score, 1.0);
    }

    getFilterMultiplier(bill) {
        let multiplier = 1.0;

        if (this.searchFilters.category !== 'all' && 
            bill.category !== this.searchFilters.category) {
            multiplier *= 0.1;
        }

        if (this.searchFilters.status !== 'all' && 
            bill.status !== this.searchFilters.status) {
            multiplier *= 0.1;
        }

        return multiplier;
    }

    getMatchReasons(query, title, bill) {
        const reasons = [];
        const queryLower = query.toLowerCase();

        if (title.toLowerCase().includes(queryLower)) {
            reasons.push('Title match');
        }
        if (bill.summary.toLowerCase().includes(queryLower)) {
            reasons.push('Summary match');
        }
        if (bill.category.toLowerCase().includes(queryLower)) {
            reasons.push('Category match');
        }

        return reasons;
    }

    // AI-Powered Features
    async generateAISummary() {
        const currentQuery = document.getElementById('search-input')?.value;
        if (!currentQuery) {
            this.showNotification('Please enter a search term first', 'warning');
            return;
        }

        this.showAIModal('Generating AI Summary...', 'loading');

        // Simulate AI summary generation
        setTimeout(() => {
            const summary = this.createAISummary(currentQuery);
            this.showAIModal('🤖 AI Summary', 'content', summary);
        }, 2000);
    }

    createAISummary(query) {
        // Simulate advanced AI summary
        return `
            <div class="ai-summary">
                <h4>AI Analysis for: "${query}"</h4>
                
                <div class="summary-section">
                    <h5>📊 Key Findings</h5>
                    <ul>
                        <li>Found ${Math.floor(Math.random() * 10) + 1} relevant pieces of legislation</li>
                        <li>Most active in ${this.getRandomCategory()} category</li>
                        <li>Average time to enactment: ${Math.floor(Math.random() * 12) + 6} months</li>
                    </ul>
                </div>
                
                <div class="summary-section">
                    <h5>🎯 Impact Assessment</h5>
                    <p>Based on current legislation patterns, bills related to "${query}" typically affect:</p>
                    <ul>
                        <li>Direct impact on ${Math.floor(Math.random() * 50) + 10} million citizens</li>
                        <li>Economic impact estimated at £${Math.floor(Math.random() * 1000) + 100} million</li>
                        <li>Implementation timeline: ${Math.floor(Math.random() * 24) + 6} months</li>
                    </ul>
                </div>
                
                <div class="summary-section">
                    <h5>📈 Trends & Predictions</h5>
                    <p>AI analysis suggests this topic is ${Math.random() > 0.5 ? 'increasing' : 'stable'} in parliamentary priority.</p>
                </div>
            </div>
        `;
    }

    async performImpactAnalysis() {
        const currentQuery = document.getElementById('search-input')?.value;
        if (!currentQuery) {
            this.showNotification('Please enter a search term first', 'warning');
            return;
        }

        this.showAIModal('Analyzing Impact...', 'loading');

        setTimeout(() => {
            const analysis = this.createImpactAnalysis(currentQuery);
            this.showAIModal('📊 Impact Analysis', 'content', analysis);
        }, 2500);
    }

    createImpactAnalysis(query) {
        return `
            <div class="impact-analysis">
                <h4>Impact Analysis for: "${query}"</h4>
                
                <div class="impact-charts">
                    <div class="impact-category">
                        <h5>👥 Social Impact</h5>
                        <div class="impact-bar">
                            <div class="impact-fill" style="width: ${Math.floor(Math.random() * 80) + 20}%"></div>
                        </div>
                        <p>Affects daily life of citizens through policy changes</p>
                    </div>
                    
                    <div class="impact-category">
                        <h5>💰 Economic Impact</h5>
                        <div class="impact-bar">
                            <div class="impact-fill" style="width: ${Math.floor(Math.random() * 80) + 20}%"></div>
                        </div>
                        <p>Financial implications for businesses and individuals</p>
                    </div>
                    
                    <div class="impact-category">
                        <h5>🏛️ Political Impact</h5>
                        <div class="impact-bar">
                            <div class="impact-fill" style="width: ${Math.floor(Math.random() * 80) + 20}%"></div>
                        </div>
                        <p>Changes to government structure and processes</p>
                    </div>
                </div>
                
                <div class="stakeholder-analysis">
                    <h5>🎯 Key Stakeholders</h5>
                    <div class="stakeholder-grid">
                        <div class="stakeholder-item">Citizens</div>
                        <div class="stakeholder-item">Businesses</div>
                        <div class="stakeholder-item">Government</div>
                        <div class="stakeholder-item">NGOs</div>
                    </div>
                </div>
            </div>
        `;
    }

    async findRelatedBills() {
        const currentQuery = document.getElementById('search-input')?.value;
        if (!currentQuery) {
            this.showNotification('Please enter a search term first', 'warning');
            return;
        }

        this.showAIModal('Finding Related Bills...', 'loading');

        setTimeout(() => {
            const related = this.findRelatedLegislation(currentQuery);
            this.showAIModal('🔗 Related Bills', 'content', related);
        }, 1500);
    }

    findRelatedLegislation(query) {
        const allBills = Object.keys(window.mockLegislation || {});
        const related = allBills.slice(0, 5); // Simplified for demo

        return `
            <div class="related-bills">
                <h4>Bills Related to: "${query}"</h4>
                <div class="related-list">
                    ${related.map(bill => `
                        <div class="related-item" onclick="displayLegislation('${bill}')">
                            <h5>${bill}</h5>
                            <p>Similarity: ${Math.floor(Math.random() * 40) + 60}%</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Utility Methods
    showAIModal(title, type, content = '') {
        const existingModal = document.querySelector('.ai-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'ai-modal';
        
        let modalContent = '';
        if (type === 'loading') {
            modalContent = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <div class="ai-loading">
                            <div class="loading-spinner"></div>
                            <p>AI is analyzing your request...</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            modalContent = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="close-modal" onclick="this.closest('.ai-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            `;
        }

        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
    }

    getRandomCategory() {
        const categories = ['Technology', 'Health', 'Education', 'Environment', 'Economy'];
        return categories[Math.floor(Math.random() * categories.length)];
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    // Initialize AI system
    initializeAI() {
        console.log('🤖 AI Search System initialized');
        this.searchMode = 'semantic';
    }

    loadSearchHistory() {
        const history = localStorage.getItem('govwhiz_search_history');
        if (history) {
            this.searchHistory = JSON.parse(history);
        }
    }

    setupSearchAnalytics() {
        // Track search patterns for improvement
        this.searchAnalytics = {
            totalSearches: 0,
            popularTerms: new Map(),
            searchTimes: []
        };
    }
}

// Initialize advanced search
document.addEventListener('DOMContentLoaded', () => {
    window.advancedSearch = new GovWhizAdvancedSearch();
});
