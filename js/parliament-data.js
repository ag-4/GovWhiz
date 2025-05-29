/**
 * Parliament Data Integration System
 * Handles real-time data fetching from various parliamentary sources
 */

class ParliamentDataSystem {
    constructor() {
        this.sources = {
            parliament: 'https://parliamentlive.tv/api/updates',
            bills: 'https://bills.parliament.uk/api/updates',
            debates: 'https://hansard.parliament.uk/api/updates',
            news: 'https://news.parliament.uk/api/updates'
        };
        
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        this.cache = new Map();
    }

    async fetchData(source) {
        const cachedData = this.cache.get(source);
        if (cachedData && (Date.now() - cachedData.timestamp) < this.cacheDuration) {
            return cachedData.data;
        }

        try {
            const response = await fetch(this.sources[source]);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            this.cache.set(source, {
                timestamp: Date.now(),
                data: data
            });
            
            return data;
        } catch (error) {
            console.warn(`Failed to fetch ${source} data:`, error);
            return this.simulateData(source);
        }
    }

    simulateData(source) {
        const generateRandomData = () => {
            const topics = [
                'Climate Change', 'Healthcare', 'Education', 
                'Immigration', 'Economy', 'Infrastructure',
                'Digital Rights', 'National Security', 'Housing'
            ];

            const stages = [
                'First Reading', 'Second Reading', 'Committee Stage',
                'Report Stage', 'Third Reading', 'Royal Assent'
            ];

            const billTitles = [
                'Online Safety Bill', 'Climate Action Bill',
                'Healthcare Reform Act', 'Education Funding Bill',
                'Digital Economy Act', 'Immigration Reform Bill'
            ];

            return {
                topic: topics[Math.floor(Math.random() * topics.length)],
                stage: stages[Math.floor(Math.random() * stages.length)],
                bill: billTitles[Math.floor(Math.random() * billTitles.length)],
                timestamp: Date.now() - Math.floor(Math.random() * 3600000)
            };
        };

        const count = Math.floor(Math.random() * 5) + 3; // 3-7 items
        const updates = [];

        for (let i = 0; i < count; i++) {
            const data = generateRandomData();
            let update;

            switch (source) {
                case 'parliament':
                    update = {
                        type: 'activity',
                        title: 'Parliamentary Update',
                        message: `Discussion on ${data.topic} in progress`,
                        timestamp: data.timestamp,
                        data: { topic: data.topic, priority: Math.random() > 0.7 ? 'high' : 'normal' }
                    };
                    break;

                case 'bills':
                    update = {
                        type: 'billUpdate',
                        title: data.bill,
                        message: `${data.bill} has moved to ${data.stage}`,
                        timestamp: data.timestamp,
                        data: { topic: data.topic, stage: data.stage, priority: 'high' }
                    };
                    break;

                case 'debates':
                    update = {
                        type: 'debate',
                        title: 'Active Debate',
                        message: `Ongoing debate about ${data.topic}`,
                        timestamp: data.timestamp,
                        data: { topic: data.topic }
                    };
                    break;

                case 'news':
                    update = {
                        type: 'news',
                        title: 'Parliamentary News',
                        message: `New developments in ${data.topic}`,
                        timestamp: data.timestamp,
                        data: { topic: data.topic }
                    };
                    break;
            }

            updates.push(update);
        }

        return updates;
    }

    async fetchAllUpdates() {
        const updates = await Promise.all(
            Object.keys(this.sources).map(source => this.fetchData(source))
        );
        return updates.flat().sort((a, b) => b.timestamp - a.timestamp);
    }
}

// Initialize and export
window.parliamentData = new ParliamentDataSystem();
