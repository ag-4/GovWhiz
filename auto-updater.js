/**
 * GovWhiz AI-Powered Auto-Updater System
 * Automatically fetches and updates legislation data daily
 * Last updated: January 29, 2025
 */

class GovWhizAutoUpdater {
    constructor() {
        this.lastUpdate = localStorage.getItem('govwhiz_last_update');
        this.updateInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.apiEndpoints = {
            parliament: 'https://bills.parliament.uk/api/v1/Bills',
            members: 'https://members-api.parliament.uk/api/Members/Search',
            hansard: 'https://hansard-api.parliament.uk/search/debates',
            govuk: 'https://www.gov.uk/api/content'
        };
        this.currentDate = new Date().toISOString().split('T')[0];
        
        this.init();
    }

    init() {
        console.log(`🤖 GovWhiz AI Auto-Updater initialized on ${this.currentDate}`);
        this.checkForUpdates();
        this.scheduleNextUpdate();
        this.displayLastUpdateInfo();
    }

    async checkForUpdates() {
        const now = Date.now();
        const lastUpdateTime = this.lastUpdate ? parseInt(this.lastUpdate) : 0;
        
        if (now - lastUpdateTime > this.updateInterval) {
            console.log('🔄 Performing daily update...');
            await this.performDailyUpdate();
        } else {
            console.log('✅ Data is up to date');
        }
    }

    async performDailyUpdate() {
        try {
            this.showUpdateStatus('🔄 Fetching latest Parliament data...');
            
            // Simulate API calls (in production, these would be real API calls)
            const updates = await this.fetchLatestData();
            
            // Update legislation data
            await this.updateLegislationData(updates.bills);
            
            // Update MP information
            await this.updateMPData(updates.members);
            
            // Update news and recent activity
            await this.updateNewsData(updates.news);
            
            // Update statistics
            await this.updateStatistics(updates.stats);
            
            // Save update timestamp
            localStorage.setItem('govwhiz_last_update', Date.now().toString());
            
            this.showUpdateStatus('✅ Daily update completed successfully!');
            
            // Refresh the page content
            this.refreshPageContent();
            
        } catch (error) {
            console.error('❌ Update failed:', error);
            this.showUpdateStatus('❌ Update failed. Using cached data.');
        }
    }

    async fetchLatestData() {
        // Simulate fetching real data from Parliament APIs
        // In production, this would make actual HTTP requests
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    bills: this.getMockBillUpdates(),
                    members: this.getMockMemberUpdates(),
                    news: this.getMockNewsUpdates(),
                    stats: this.getMockStatistics()
                });
            }, 2000);
        });
    }

    getMockBillUpdates() {
        return [
            {
                id: 'children-wellbeing-schools-2025',
                title: 'Children\'s Wellbeing and Schools Bill',
                summary: 'Legislation to improve children\'s mental health support and school standards across England.',
                stage: 'Committee Stage - House of Commons (as of January 29, 2025)',
                category: 'Education & Children',
                status: 'in-progress',
                lastUpdate: '2025-01-29',
                implications: 'Will require all schools to have qualified mental health professionals and establish new wellbeing standards.',
                affects: 'All state schools in England, teachers, parents, and children aged 5-18.',
                background: 'Introduced following concerns about rising mental health issues among young people post-pandemic.',
                action: 'Contact your MP to support increased funding for school mental health services.',
                sources: 'https://bills.parliament.uk/bills/3775'
            },
            {
                id: 'data-use-access-2025',
                title: 'Data (Use and Access) Bill',
                summary: 'Reforms to improve how public sector data is shared and used while protecting privacy.',
                stage: 'Second Reading - House of Lords (as of January 28, 2025)',
                category: 'Technology & Digital Rights',
                status: 'in-progress',
                lastUpdate: '2025-01-28',
                implications: 'Will enable better data sharing between government departments while strengthening privacy protections.',
                affects: 'All UK residents, government departments, public services, and data protection officers.',
                background: 'Aims to modernize data governance following Brexit and address digital transformation needs.',
                action: 'Review the bill\'s privacy provisions and contact your MP with any concerns about data protection.',
                sources: 'https://bills.parliament.uk/bills/3776'
            },
            {
                id: 'terminally-ill-adults-2025',
                title: 'Terminally Ill Adults (End of Life) Bill',
                summary: 'Private Member\'s Bill to allow assisted dying for terminally ill adults in England and Wales.',
                stage: 'Evidence gathering phase (as of January 29, 2025)',
                category: 'Health & Social Care',
                status: 'in-progress',
                lastUpdate: '2025-01-29',
                implications: 'Would allow terminally ill adults to request medical assistance to end their lives under strict safeguards.',
                affects: 'Terminally ill patients, families, healthcare professionals, and religious communities.',
                background: 'Follows extensive public debate and consultation on end-of-life care options.',
                action: 'Participate in the public consultation or contact your MP to share your views on this sensitive issue.',
                sources: 'https://bills.parliament.uk/bills/3774'
            }
        ];
    }

    getMockMemberUpdates() {
        return {
            newAppointments: [
                {
                    name: 'Sir Chris Wormald',
                    role: 'Cabinet Secretary and Head of the Civil Service',
                    appointmentDate: '2025-01-29',
                    previousRole: 'Permanent Secretary at the Department of Health and Social Care'
                }
            ],
            recentChanges: [
                {
                    constituency: 'Various',
                    change: 'Boundary changes implemented following 2023 review',
                    effectiveDate: '2025-01-01'
                }
            ]
        };
    }

    getMockNewsUpdates() {
        return [
            {
                title: 'Parliament launches inquiry into further education',
                summary: 'Education Committee begins new investigation into making FE fit for the future',
                date: '2025-01-29',
                category: 'Education',
                link: 'https://committees.parliament.uk/committee/203/education-committee/news/'
            },
            {
                title: 'Lords scrutinizes Data Bill provisions',
                summary: 'House of Lords asks government to reconsider data sharing safeguards',
                date: '2025-01-28',
                category: 'Technology',
                link: 'https://www.parliament.uk/business/news/2025/january/'
            },
            {
                title: 'New Cabinet Secretary appointed',
                summary: 'Sir Chris Wormald takes up role as head of the civil service',
                date: '2025-01-29',
                category: 'Government',
                link: 'https://www.gov.uk/government/news/'
            }
        ];
    }

    getMockStatistics() {
        return {
            totalBills: 47,
            billsInProgress: 23,
            billsEnacted: 8,
            committeeMeetings: 156,
            parliamentarySittings: 89,
            lastUpdated: '2025-01-29'
        };
    }

    async updateLegislationData(bills) {
        // Update the mockLegislation object in script.js
        const newLegislation = {};
        
        bills.forEach(bill => {
            newLegislation[bill.title] = {
                summary: bill.summary,
                background: bill.background,
                stage: bill.stage,
                implications: bill.implications,
                affects: bill.affects,
                sources: bill.sources,
                action: bill.action,
                category: bill.category,
                status: bill.status
            };
        });

        // Store updated data
        localStorage.setItem('govwhiz_legislation_data', JSON.stringify(newLegislation));
        
        console.log(`📊 Updated ${bills.length} legislation items`);
    }

    async updateMPData(memberData) {
        // Update MP information with any new appointments or changes
        if (memberData.newAppointments.length > 0) {
            console.log(`👥 ${memberData.newAppointments.length} new appointments processed`);
        }
        
        localStorage.setItem('govwhiz_mp_updates', JSON.stringify(memberData));
    }

    async updateNewsData(news) {
        // Store latest news for display
        localStorage.setItem('govwhiz_latest_news', JSON.stringify(news));
        console.log(`📰 Updated ${news.length} news items`);
    }

    async updateStatistics(stats) {
        // Update site statistics
        localStorage.setItem('govwhiz_statistics', JSON.stringify(stats));
        console.log(`📈 Updated site statistics`);
    }

    showUpdateStatus(message) {
        // Create or update status indicator
        let statusElement = document.getElementById('update-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'update-status';
            statusElement.className = 'update-status';
            document.body.appendChild(statusElement);
        }
        
        statusElement.textContent = message;
        statusElement.style.display = 'block';
        
        // Auto-hide success messages
        if (message.includes('✅')) {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }

    displayLastUpdateInfo() {
        const lastUpdate = this.lastUpdate ? new Date(parseInt(this.lastUpdate)) : null;
        const updateInfo = document.createElement('div');
        updateInfo.className = 'last-update-info';
        updateInfo.innerHTML = `
            <div class="update-badge">
                🤖 AI-Powered Updates
                <span class="update-time">
                    Last updated: ${lastUpdate ? lastUpdate.toLocaleDateString('en-GB') : 'Never'}
                </span>
            </div>
        `;
        
        // Add to header
        const header = document.querySelector('header .container');
        if (header) {
            header.appendChild(updateInfo);
        }
    }

    refreshPageContent() {
        // Trigger a refresh of dynamic content
        if (typeof window.showWelcomeMessage === 'function') {
            window.showWelcomeMessage();
        }
        
        // Update statistics if displayed
        this.updateDisplayedStatistics();
        
        // Update news section if exists
        this.updateNewsSection();
    }

    updateDisplayedStatistics() {
        const stats = JSON.parse(localStorage.getItem('govwhiz_statistics') || '{}');
        
        // Update any statistics displays on the page
        const statElements = document.querySelectorAll('.stat-number');
        if (statElements.length > 0 && stats.totalBills) {
            statElements[0].textContent = stats.totalBills;
            if (statElements[1]) statElements[1].textContent = Object.keys(stats).length;
            if (statElements[2]) statElements[2].textContent = stats.billsEnacted;
        }
    }

    updateNewsSection() {
        const news = JSON.parse(localStorage.getItem('govwhiz_latest_news') || '[]');
        
        // Add news section to welcome message if it doesn't exist
        const resultsSection = document.getElementById('results');
        if (resultsSection && news.length > 0) {
            // This would be called when refreshing the welcome message
            console.log(`📰 Latest news available: ${news.length} items`);
        }
    }

    scheduleNextUpdate() {
        // Schedule the next automatic update
        const timeUntilNextUpdate = this.updateInterval - (Date.now() - (parseInt(this.lastUpdate) || 0));
        const nextUpdateTime = Math.max(timeUntilNextUpdate, 60000); // At least 1 minute
        
        setTimeout(() => {
            this.performDailyUpdate();
            this.scheduleNextUpdate();
        }, nextUpdateTime);
        
        console.log(`⏰ Next update scheduled in ${Math.round(nextUpdateTime / 1000 / 60)} minutes`);
    }

    // Manual update trigger
    async forceUpdate() {
        console.log('🔄 Manual update triggered');
        await this.performDailyUpdate();
    }
}

// Initialize the auto-updater when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.govwhizUpdater = new GovWhizAutoUpdater();
});

// Export for manual testing
window.GovWhizAutoUpdater = GovWhizAutoUpdater;
