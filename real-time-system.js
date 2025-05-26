/**
 * GovWhiz Real-Time System
 * Live updates, notifications, and real-time parliamentary activity
 */

class GovWhizRealTimeSystem {
    constructor() {
        this.isConnected = false;
        this.notifications = [];
        this.liveFeeds = new Map();
        this.updateInterval = null;
        this.notificationQueue = [];
        this.lastActivity = Date.now();

        this.init();
    }

    init() {
        this.setupNotificationSystem();
        this.initializeLiveFeeds();
        this.startRealTimeUpdates();
        this.setupServiceWorker();
        this.createLiveInterface();
    }

    // Notification System
    setupNotificationSystem() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }

        // Setup notification types
        this.notificationTypes = {
            billUpdate: {
                icon: '📊',
                color: 'var(--secondary-color)',
                sound: true
            },
            mpChange: {
                icon: '👥',
                color: 'var(--primary-color)',
                sound: true
            },
            urgentNews: {
                icon: '🚨',
                color: 'var(--danger-color)',
                sound: true
            },
            generalUpdate: {
                icon: 'ℹ️',
                color: 'var(--success-color)',
                sound: false
            }
        };
    }

    showNotification(message, type = 'generalUpdate', options = {}) {
        const notificationConfig = this.notificationTypes[type];

        // In-app notification
        this.createInAppNotification(message, notificationConfig, options);

        // Browser notification (if permission granted)
        if (Notification.permission === 'granted' && options.browser !== false) {
            this.createBrowserNotification(message, notificationConfig);
        }

        // Store notification
        this.storeNotification(message, type, options);
    }

    createInAppNotification(message, config, options) {
        const notification = document.createElement('div');
        notification.className = 'live-notification';
        notification.innerHTML = `
            <div class="notification-content" style="border-left-color: ${config.color}">
                <div class="notification-icon">${config.icon}</div>
                <div class="notification-text">
                    <div class="notification-title">${options.title || 'Update'}</div>
                    <div class="notification-message">${message}</div>
                    <div class="notification-time">${new Date().toLocaleTimeString()}</div>
                </div>
                <button class="notification-close" onclick="this.closest('.live-notification').remove()">×</button>
            </div>
        `;

        // Add to notification container
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, options.duration || 8000);

        // Play sound if enabled
        if (config.sound && options.sound !== false) {
            this.playNotificationSound();
        }
    }

    createBrowserNotification(message, config) {
        const notification = new Notification('GovWhiz Update', {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'govwhiz-update'
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    // Live Feeds System
    initializeLiveFeeds() {
        this.liveFeeds.set('parliament', {
            name: 'Parliamentary Activity',
            lastUpdate: Date.now(),
            data: [],
            active: true
        });

        this.liveFeeds.set('bills', {
            name: 'Bill Progress',
            lastUpdate: Date.now(),
            data: [],
            active: true
        });

        this.liveFeeds.set('debates', {
            name: 'Live Debates',
            lastUpdate: Date.now(),
            data: [],
            active: false
        });

        this.liveFeeds.set('news', {
            name: 'Breaking News',
            lastUpdate: Date.now(),
            data: [],
            active: true
        });
    }

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        this.updateInterval = setInterval(() => {
            this.fetchLiveUpdates();
        }, 30000);

        // Initial fetch
        this.fetchLiveUpdates();
    }

    async fetchLiveUpdates() {
        try {
            // Check if we have fresh data from auto-updater
            const storedData = localStorage.getItem('govwhiz_legislation_data');
            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                    // Update window.mockLegislation with fresh data
                    if (window.mockLegislation) {
                        Object.assign(window.mockLegislation, parsedData);
                    }
                } catch (parseError) {
                    console.warn('Could not parse stored legislation data:', parseError);
                }
            }

            // Simulate fetching live data
            const updates = await this.simulateLiveData();

            if (updates && updates.length > 0) {
                updates.forEach(update => {
                    this.processLiveUpdate(update);
                });

                this.updateLiveInterface();
                this.lastActivity = Date.now();
            }

        } catch (error) {
            console.error('Error fetching live updates:', error);
            // Show user-friendly error in the live panel
            this.showErrorInLivePanel('Unable to fetch latest updates. Retrying...');
        }
    }

    async simulateLiveData() {
        // Simulate various types of live updates
        const updateTypes = [
            {
                type: 'billUpdate',
                probability: 0.3,
                generator: () => ({
                    type: 'billUpdate',
                    title: 'Bill Progress Update',
                    message: `${this.getRandomBill()} has moved to ${this.getRandomStage()}`,
                    timestamp: Date.now(),
                    data: {
                        bill: this.getRandomBill(),
                        stage: this.getRandomStage(),
                        committee: this.getRandomCommittee()
                    }
                })
            },
            {
                type: 'mpChange',
                probability: 0.1,
                generator: () => ({
                    type: 'mpChange',
                    title: 'MP Update',
                    message: `New appointment: ${this.getRandomMP()} appointed to ${this.getRandomRole()}`,
                    timestamp: Date.now(),
                    data: {
                        mp: this.getRandomMP(),
                        role: this.getRandomRole(),
                        type: 'appointment'
                    }
                })
            },
            {
                type: 'debate',
                probability: 0.4,
                generator: () => ({
                    type: 'debate',
                    title: 'Parliamentary Debate',
                    message: `Live debate on ${this.getRandomTopic()} in progress`,
                    timestamp: Date.now(),
                    data: {
                        topic: this.getRandomTopic(),
                        chamber: Math.random() > 0.5 ? 'Commons' : 'Lords',
                        speakers: Math.floor(Math.random() * 10) + 5
                    }
                })
            },
            {
                type: 'news',
                probability: 0.2,
                generator: () => ({
                    type: 'news',
                    title: 'Breaking News',
                    message: `Government announces new initiative on ${this.getRandomTopic()}`,
                    timestamp: Date.now(),
                    data: {
                        topic: this.getRandomTopic(),
                        department: this.getRandomDepartment(),
                        priority: Math.random() > 0.7 ? 'high' : 'normal'
                    }
                })
            }
        ];

        const updates = [];
        updateTypes.forEach(updateType => {
            if (Math.random() < updateType.probability) {
                updates.push(updateType.generator());
            }
        });

        return updates;
    }

    processLiveUpdate(update) {
        // Add to appropriate feed
        const feedKey = this.getFeedKeyForUpdate(update.type);
        const feed = this.liveFeeds.get(feedKey);

        if (feed) {
            feed.data.unshift(update);
            feed.lastUpdate = Date.now();

            // Keep only last 50 items
            if (feed.data.length > 50) {
                feed.data = feed.data.slice(0, 50);
            }
        }

        // Show notification for important updates
        if (this.shouldNotify(update)) {
            this.showNotification(
                update.message,
                update.type,
                {
                    title: update.title,
                    browser: update.data?.priority === 'high'
                }
            );
        }
    }

    getFeedKeyForUpdate(updateType) {
        const mapping = {
            'billUpdate': 'bills',
            'mpChange': 'parliament',
            'debate': 'debates',
            'news': 'news'
        };
        return mapping[updateType] || 'parliament';
    }

    shouldNotify(update) {
        // Check user preferences and update importance
        const userSystem = window.userSystem;
        if (!userSystem?.currentUser) return false;

        const preferences = userSystem.userPreferences?.notifications;
        if (!preferences) return true;

        switch (update.type) {
            case 'billUpdate':
                return preferences.billUpdates !== false;
            case 'mpChange':
                return preferences.mpChanges !== false;
            case 'news':
                return update.data?.priority === 'high';
            default:
                return true;
        }
    }

    // Live Interface
    createLiveInterface() {
        // Add live indicator to header
        this.addLiveIndicator();

        // Create live activity panel
        this.createLiveActivityPanel();

        // Add notification center
        this.createNotificationCenter();
    }

    addLiveIndicator() {
        // Check if live indicator already exists in HTML
        const existingIndicator = document.querySelector('.live-indicator');
        if (existingIndicator) {
            // Use the existing indicator
            return;
        }

        // Only create if it doesn't exist
        const header = document.querySelector('header .container');
        if (!header) return;

        const liveIndicator = document.createElement('div');
        liveIndicator.className = 'live-indicator';
        liveIndicator.innerHTML = `
            <div class="live-status">
                <div class="live-dot"></div>
                <span>Live</span>
            </div>
        `;

        header.appendChild(liveIndicator);
    }

    createLiveActivityPanel() {
        // Add to main content area
        const container = document.querySelector('.container');
        if (!container) return;

        const livePanel = document.createElement('div');
        livePanel.className = 'live-activity-panel';
        livePanel.innerHTML = `
            <div class="live-header">
                <h3>🔴 Live Parliamentary Activity</h3>
                <button class="toggle-live" onclick="window.realTimeSystem.toggleLivePanel()">
                    <span class="toggle-text">Hide</span>
                </button>
            </div>
            <div class="live-content">
                <div class="live-feeds">
                    <div class="feed-tabs">
                        <button class="feed-tab active" data-feed="parliament">Parliament</button>
                        <button class="feed-tab" data-feed="bills">Bills</button>
                        <button class="feed-tab" data-feed="debates">Debates</button>
                        <button class="feed-tab" data-feed="news">News</button>
                    </div>
                    <div class="feed-content" id="live-feed-content">
                        <!-- Live content will be populated here -->
                    </div>
                </div>
            </div>
        `;

        // Insert after search section
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            searchSection.parentNode.insertBefore(livePanel, searchSection.nextSibling);
        }

        this.setupLivePanelEvents();
    }

    setupLivePanelEvents() {
        // Feed tab switching
        document.querySelectorAll('.feed-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                const feedKey = e.target.dataset.feed;
                this.displayFeed(feedKey);
            });
        });

        // Initial feed display
        this.displayFeed('parliament');
    }

    displayFeed(feedKey) {
        const feed = this.liveFeeds.get(feedKey);
        if (!feed) return;

        const content = document.getElementById('live-feed-content');
        if (!content) return;

        if (feed.data.length === 0) {
            content.innerHTML = `
                <div class="no-activity">
                    <p>No recent activity in ${feed.name}</p>
                    <small>Updates will appear here in real-time</small>
                </div>
            `;
            return;
        }

        content.innerHTML = feed.data.map(item => `
            <div class="live-item">
                <div class="live-item-icon">${this.getIconForType(item.type)}</div>
                <div class="live-item-content">
                    <div class="live-item-title">${item.title}</div>
                    <div class="live-item-message">${item.message}</div>
                    <div class="live-item-time">${this.formatTime(item.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    updateLiveInterface() {
        // Update the currently displayed feed
        const activeTab = document.querySelector('.feed-tab.active');
        if (activeTab) {
            this.displayFeed(activeTab.dataset.feed);
        }

        // Update live indicator
        this.updateLiveIndicator();
    }

    updateLiveIndicator() {
        const indicator = document.querySelector('.live-indicator');
        if (indicator) {
            const timeSinceUpdate = Date.now() - this.lastActivity;
            const isRecent = timeSinceUpdate < 60000; // 1 minute

            indicator.classList.toggle('active', isRecent);
        }
    }

    // Utility Methods
    getRandomBill() {
        // Try to get bills from window.mockLegislation first
        if (window.mockLegislation && Object.keys(window.mockLegislation).length > 0) {
            const bills = Object.keys(window.mockLegislation);
            return bills[Math.floor(Math.random() * bills.length)];
        }

        // Fallback to predefined bill names if mockLegislation is not available
        const fallbackBills = [
            'Online Safety Bill',
            'Data Protection and Digital Information Bill',
            'Economic Crime and Corporate Transparency Bill',
            'Levelling-up and Regeneration Bill',
            'Energy Bill',
            'Strikes (Minimum Service Levels) Bill',
            'Public Order Bill',
            'Retained EU Law (Revocation and Reform) Bill',
            'Financial Services and Markets Bill',
            'Procurement Bill'
        ];

        return fallbackBills[Math.floor(Math.random() * fallbackBills.length)];
    }

    getRandomStage() {
        const stages = ['First Reading', 'Second Reading', 'Committee Stage', 'Report Stage', 'Third Reading'];
        return stages[Math.floor(Math.random() * stages.length)];
    }

    getRandomMP() {
        const mps = [
            'Rt Hon Sir Keir Starmer MP',
            'Rt Hon Rishi Sunak MP',
            'Rt Hon Angela Rayner MP',
            'Rt Hon Jeremy Hunt MP',
            'Rt Hon David Lammy MP',
            'Rt Hon James Cleverly MP',
            'Rt Hon Rachel Reeves MP',
            'Rt Hon Kemi Badenoch MP',
            'Rt Hon Yvette Cooper MP',
            'Rt Hon Oliver Dowden MP'
        ];
        return mps[Math.floor(Math.random() * mps.length)];
    }

    getRandomRole() {
        const roles = [
            'Secretary of State',
            'Parliamentary Under-Secretary',
            'Minister of State',
            'Committee Chair',
            'Shadow Minister',
            'Parliamentary Private Secretary',
            'Government Whip',
            'Opposition Whip'
        ];
        return roles[Math.floor(Math.random() * roles.length)];
    }

    getRandomTopic() {
        const topics = [
            'Healthcare Reform',
            'Climate Action',
            'Digital Rights',
            'Education Policy',
            'Economic Recovery',
            'Housing Crisis',
            'Immigration Policy',
            'Energy Security',
            'Cost of Living',
            'Transport Infrastructure',
            'Mental Health Services',
            'Brexit Implementation'
        ];
        return topics[Math.floor(Math.random() * topics.length)];
    }

    getRandomCommittee() {
        const committees = [
            'Health and Social Care Committee',
            'Education Committee',
            'Treasury Committee',
            'Justice Committee',
            'Home Affairs Committee',
            'Foreign Affairs Committee',
            'Defence Committee',
            'Business, Energy and Industrial Strategy Committee',
            'Transport Committee',
            'Environment, Food and Rural Affairs Committee',
            'Digital, Culture, Media and Sport Committee',
            'Work and Pensions Committee'
        ];
        return committees[Math.floor(Math.random() * committees.length)];
    }

    getRandomDepartment() {
        const departments = [
            'Department of Health and Social Care',
            'Department for Education',
            'HM Treasury',
            'Home Office',
            'Foreign, Commonwealth & Development Office',
            'Ministry of Defence',
            'Department for Business and Trade',
            'Department for Transport',
            'Department for Environment, Food & Rural Affairs',
            'Department for Work and Pensions',
            'Ministry of Justice',
            'Department for Energy Security and Net Zero'
        ];
        return departments[Math.floor(Math.random() * departments.length)];
    }

    getIconForType(type) {
        const icons = {
            'billUpdate': '📊',
            'mpChange': '👥',
            'debate': '🗣️',
            'news': '📰'
        };
        return icons[type] || 'ℹ️';
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    }

    playNotificationSound() {
        // Simple notification sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Audio notification not available');
        }
    }

    // Service Worker Setup
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service Worker registered:', registration);
            }).catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        }
    }

    // Public Methods
    toggleLivePanel() {
        const panel = document.querySelector('.live-activity-panel');
        const button = document.querySelector('.toggle-live .toggle-text');

        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
            button.textContent = 'Hide';
        } else {
            panel.classList.add('collapsed');
            button.textContent = 'Show';
        }
    }

    storeNotification(message, type, options) {
        this.notifications.unshift({
            id: Date.now(),
            message,
            type,
            options,
            timestamp: Date.now(),
            read: false
        });

        // Keep only last 100 notifications
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }

        // Save to localStorage
        localStorage.setItem('govwhiz_notifications', JSON.stringify(this.notifications));
    }

    createNotificationCenter() {
        // Add notification center button to header
        const header = document.querySelector('header .container');
        if (!header) return;

        const notificationButton = document.createElement('button');
        notificationButton.className = 'notification-center-btn';
        notificationButton.innerHTML = `
            🔔 <span class="notification-count">0</span>
        `;
        notificationButton.onclick = () => this.showNotificationCenter();

        header.appendChild(notificationButton);
        this.updateNotificationCount();
    }

    updateNotificationCount() {
        const countElement = document.querySelector('.notification-count');
        if (countElement) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            countElement.textContent = unreadCount;
            countElement.style.display = unreadCount > 0 ? 'inline' : 'none';
        }
    }

    showNotificationCenter() {
        // Implementation for notification center modal
        console.log('Notification center opened');
    }

    showErrorInLivePanel(message) {
        const content = document.getElementById('live-feed-content');
        if (content) {
            content.innerHTML = `
                <div class="live-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${message}</div>
                    <button onclick="window.realTimeSystem.fetchLiveUpdates()" class="retry-btn">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    }
}

// Initialize real-time system
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeSystem = new GovWhizRealTimeSystem();
});
