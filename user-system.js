/**
 * GovWhiz User Account & Personalization System
 * Comprehensive user management with preferences and tracking
 */

class GovWhizUserSystem {
    constructor() {
        this.currentUser = null;
        this.userPreferences = {};
        this.trackedBills = new Set();
        this.userInterests = new Set();
        this.notificationSettings = {};
        this.userStats = {};

        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.createUserInterface();
        this.checkAuthStatus();
    }

    // User Authentication
    async login(email, password) {
        try {
            // Simulate authentication (in production, this would call a real auth API)
            const userData = await this.authenticateUser(email, password);

            if (userData) {
                this.currentUser = userData;
                this.saveUserData();
                this.showNotification('✅ Successfully logged in!', 'success');
                this.updateUserInterface();
                return true;
            }
        } catch (error) {
            this.showNotification('❌ Login failed. Please try again.', 'error');
            return false;
        }
    }

    async authenticateUser(email, password) {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For demo purposes, accept any email/password combination
        if (email && password) {
            return {
                id: Date.now().toString(),
                email: email,
                name: email.split('@')[0],
                joinDate: new Date().toISOString(),
                preferences: this.getDefaultPreferences()
            };
        }

        return null;
    }

    async register(userData) {
        try {
            // Simulate user registration
            const newUser = {
                id: Date.now().toString(),
                email: userData.email,
                name: userData.name,
                constituency: userData.constituency,
                interests: userData.interests || [],
                joinDate: new Date().toISOString(),
                preferences: this.getDefaultPreferences()
            };

            this.currentUser = newUser;
            this.saveUserData();
            this.showNotification('🎉 Account created successfully!', 'success');
            this.updateUserInterface();
            return true;
        } catch (error) {
            this.showNotification('❌ Registration failed. Please try again.', 'error');
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        this.trackedBills.clear();
        this.userInterests.clear();
        localStorage.removeItem('govwhiz_user_data');
        this.showNotification('👋 Logged out successfully', 'info');
        this.updateUserInterface();
    }

    // User Preferences Management
    getDefaultPreferences() {
        return {
            notifications: {
                email: true,
                push: true,
                billUpdates: true,
                mpChanges: true,
                weeklyDigest: true
            },
            display: {
                theme: 'auto',
                language: 'en',
                compactMode: false,
                showAdvancedFeatures: false
            },
            privacy: {
                shareActivity: false,
                publicProfile: false,
                analyticsOptIn: true
            },
            interests: [],
            constituency: null
        };
    }

    updatePreferences(newPreferences) {
        this.userPreferences = { ...this.userPreferences, ...newPreferences };
        if (this.currentUser) {
            this.currentUser.preferences = this.userPreferences;
            this.saveUserData();
        }
        this.applyPreferences();
    }

    applyPreferences() {
        // Apply theme
        if (this.userPreferences.display?.theme) {
            document.body.setAttribute('data-theme', this.userPreferences.display.theme);
        }

        // Apply compact mode
        if (this.userPreferences.display?.compactMode) {
            document.body.classList.toggle('compact-mode', this.userPreferences.display.compactMode);
        }

        // Update notification settings
        this.updateNotificationSettings();
    }

    // Bill Tracking System
    trackBill(billTitle) {
        if (!this.currentUser) {
            this.showLoginPrompt('Please log in to track bills');
            return false;
        }

        this.trackedBills.add(billTitle);
        this.saveUserData();
        this.showNotification(`📊 Now tracking: ${billTitle}`, 'success');
        this.updateTrackingUI();
        return true;
    }

    untrackBill(billTitle) {
        this.trackedBills.delete(billTitle);
        this.saveUserData();
        this.showNotification(`📊 Stopped tracking: ${billTitle}`, 'info');
        this.updateTrackingUI();
    }

    getTrackedBills() {
        return Array.from(this.trackedBills);
    }

    // Interest Management
    addInterest(interest) {
        this.userInterests.add(interest);
        if (this.currentUser) {
            this.currentUser.interests = Array.from(this.userInterests);
            this.saveUserData();
        }
        this.updatePersonalizedContent();
    }

    removeInterest(interest) {
        this.userInterests.delete(interest);
        if (this.currentUser) {
            this.currentUser.interests = Array.from(this.userInterests);
            this.saveUserData();
        }
        this.updatePersonalizedContent();
    }

    // Personalized Content
    updatePersonalizedContent() {
        if (!this.currentUser) return;

        // Update welcome message with personalized content
        this.addPersonalizedSection();

        // Filter content based on interests
        this.filterContentByInterests();

        // Update recommendations
        this.updateRecommendations();
    }

    addPersonalizedSection() {
        const resultsSection = document.getElementById('results');
        if (!resultsSection || !this.currentUser) return;

        const personalizedHTML = `
            <div class="personalized-dashboard">
                <div class="user-welcome">
                    <h3>👋 Welcome back, ${this.currentUser.name}!</h3>
                    <p>Here's what's happening in your areas of interest</p>
                </div>

                <div class="user-stats">
                    <div class="stat-card">
                        <span class="stat-number">${this.trackedBills.size}</span>
                        <span class="stat-label">Bills Tracked</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${this.userInterests.size}</span>
                        <span class="stat-label">Interests</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${this.getDaysActive()}</span>
                        <span class="stat-label">Days Active</span>
                    </div>
                </div>

                ${this.trackedBills.size > 0 ? `
                <div class="tracked-bills-section">
                    <h4>📊 Your Tracked Bills</h4>
                    <div class="tracked-bills-grid">
                        ${Array.from(this.trackedBills).map(bill => `
                            <div class="tracked-bill-card" onclick="displayLegislation('${bill}')">
                                <h5>${bill}</h5>
                                <button onclick="event.stopPropagation(); window.userSystem.untrackBill('${bill}')" class="untrack-btn">×</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="quick-actions">
                    <button onclick="window.userSystem.showPreferences()" class="action-btn">⚙️ Preferences</button>
                    <button onclick="window.userSystem.showTrackingManager()" class="action-btn">📊 Manage Tracking</button>
                    <button onclick="window.userSystem.exportData()" class="action-btn">📥 Export Data</button>
                </div>
            </div>
        `;

        // Insert personalized content at the beginning
        const existingContent = resultsSection.innerHTML;
        resultsSection.innerHTML = personalizedHTML + existingContent;
    }

    // User Interface Management
    createUserInterface() {
        this.createUserMenu();
        this.createLoginModal();
        this.createPreferencesModal();
    }

    createUserMenu() {
        const header = document.querySelector('header .container');
        if (!header) return;

        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-controls">
                <div id="user-status" class="user-status">
                    <button id="login-btn" class="user-btn">👤 Login</button>
                </div>
            </div>
        `;

        header.appendChild(userMenu);
    }

    updateUserInterface() {
        const userStatus = document.getElementById('user-status');
        if (!userStatus) return;

        if (this.currentUser) {
            userStatus.innerHTML = `
                <div class="user-info">
                    <span class="user-name">👤 ${this.currentUser.name}</span>
                    <div class="user-dropdown">
                        <button onclick="window.userSystem.showPreferences()" class="dropdown-item">⚙️ Preferences</button>
                        <button onclick="window.userSystem.showDashboard()" class="dropdown-item">📊 Dashboard</button>
                        <button onclick="window.userSystem.logout()" class="dropdown-item">🚪 Logout</button>
                    </div>
                </div>
            `;
        } else {
            userStatus.innerHTML = `
                <button id="login-btn" onclick="window.userSystem.showLoginModal()" class="user-btn">👤 Login</button>
            `;
        }
    }

    // Modal Systems
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'user-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔐 Login to GovWhiz</h3>
                    <button class="close-modal" onclick="this.closest('.user-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="auth-tabs">
                        <button class="auth-tab active" onclick="window.userSystem.switchAuthTab('login')">Login</button>
                        <button class="auth-tab" onclick="window.userSystem.switchAuthTab('register')">Register</button>
                    </div>

                    <form id="login-form" class="auth-form">
                        <input type="email" placeholder="Email" required>
                        <input type="password" placeholder="Password" required>
                        <button type="submit" class="auth-submit">🔐 Login</button>
                    </form>

                    <form id="register-form" class="auth-form hidden">
                        <input type="text" placeholder="Full Name" required>
                        <input type="email" placeholder="Email" required>
                        <input type="password" placeholder="Password" required>
                        <input type="text" placeholder="Constituency (optional)">
                        <div class="interests-selector">
                            <label>Select your interests:</label>
                            <div class="interest-tags">
                                ${this.getInterestOptions().map(interest => `
                                    <label class="interest-tag">
                                        <input type="checkbox" value="${interest}">
                                        <span>${interest}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <button type="submit" class="auth-submit">🎉 Create Account</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupAuthForms();
    }

    setupAuthForms() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('input[type="email"]').value;
                const password = loginForm.querySelector('input[type="password"]').value;
                this.login(email, password).then(success => {
                    if (success) {
                        document.querySelector('.user-modal').remove();
                    }
                });
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const userData = {
                    name: registerForm.querySelector('input[type="text"]').value,
                    email: registerForm.querySelector('input[type="email"]').value,
                    password: registerForm.querySelector('input[type="password"]').value,
                    constituency: registerForm.querySelector('input[placeholder="Constituency (optional)"]').value,
                    interests: Array.from(registerForm.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
                };
                this.register(userData).then(success => {
                    if (success) {
                        document.querySelector('.user-modal').remove();
                    }
                });
            });
        }
    }

    switchAuthTab(tabName) {
        // Switch between login and register tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[onclick*="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.add('hidden');
        });
        document.getElementById(`${tabName}-form`).classList.remove('hidden');
    }

    showPreferences() {
        // Show user preferences modal
        this.showNotification('Preferences panel coming soon!', 'info');
    }

    showDashboard() {
        // Show user dashboard
        this.showNotification('Dashboard view coming soon!', 'info');
    }

    exportData() {
        // Export user data
        const data = {
            user: this.currentUser,
            trackedBills: Array.from(this.trackedBills),
            preferences: this.userPreferences,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `govwhiz-user-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('📥 User data exported successfully!', 'success');
    }

    getInterestOptions() {
        return [
            'Healthcare', 'Education', 'Environment', 'Economy', 'Technology',
            'Housing', 'Transport', 'Justice', 'Defence', 'Immigration',
            'Social Care', 'Employment', 'Energy', 'Agriculture', 'Culture'
        ];
    }

    // Data Management
    saveUserData() {
        if (this.currentUser) {
            const userData = {
                user: this.currentUser,
                trackedBills: Array.from(this.trackedBills),
                userInterests: Array.from(this.userInterests),
                preferences: this.userPreferences,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('govwhiz_user_data', JSON.stringify(userData));
        }
    }

    loadUserData() {
        const savedData = localStorage.getItem('govwhiz_user_data');
        if (savedData) {
            try {
                const userData = JSON.parse(savedData);
                this.currentUser = userData.user;
                this.trackedBills = new Set(userData.trackedBills || []);
                this.userInterests = new Set(userData.userInterests || []);
                this.userPreferences = userData.preferences || this.getDefaultPreferences();
                this.applyPreferences();
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    }

    // Utility Methods
    getDaysActive() {
        if (!this.currentUser?.joinDate) return 0;
        const joinDate = new Date(this.currentUser.joinDate);
        const now = new Date();
        return Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.closest('.notification').remove()">×</button>
            </div>
        `;

        // Position notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            background: white;
            color: var(--text-color);
            padding: 15px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-hover);
            border-left: 4px solid var(--secondary-color);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        if (type === 'success') {
            notification.style.borderLeftColor = '#2d6a4f';
        } else if (type === 'error') {
            notification.style.borderLeftColor = '#d62828';
        } else if (type === 'warning') {
            notification.style.borderLeftColor = '#f77f00';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    setupEventListeners() {
        // Global event listeners for user system
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('track-bill-btn')) {
                const billTitle = e.target.dataset.bill;
                this.trackBill(billTitle);
            }
        });
    }

    checkAuthStatus() {
        if (this.currentUser) {
            this.updateUserInterface();
            this.updatePersonalizedContent();
        }
    }

    showLoginPrompt(message) {
        this.showNotification(message + ' - Click here to login', 'warning');
        setTimeout(() => {
            this.showLoginModal();
        }, 2000);
    }

    updateTrackingUI() {
        // Update tracking interface
        if (this.currentUser) {
            this.updatePersonalizedContent();
        }
    }

    updateNotificationSettings() {
        // Update notification preferences
        console.log('Notification settings updated');
    }
}

// Initialize user system
document.addEventListener('DOMContentLoaded', () => {
    window.userSystem = new GovWhizUserSystem();
});
