/**
 * GovWhiz Data Visualization & Analytics Dashboard
 * Interactive charts, graphs, and data insights
 */

class GovWhizDataVisualization {
    constructor() {
        this.charts = new Map();
        this.analyticsData = {};
        this.visualizationTypes = ['bar', 'line', 'pie', 'timeline', 'heatmap'];
        this.currentTheme = 'light';

        this.init();
    }

    init() {
        this.setupAnalyticsDashboard();
        this.initializeChartLibrary();
        this.loadAnalyticsData();
        this.createVisualizationInterface();
    }

    // Analytics Dashboard Setup
    setupAnalyticsDashboard() {
        this.createDashboardSection();
        this.setupDashboardControls();
        this.initializeDefaultCharts();
    }

    createDashboardSection() {
        // Add analytics dashboard to the page
        const container = document.querySelector('.container');
        if (!container) return;

        const dashboardSection = document.createElement('section');
        dashboardSection.className = 'analytics-dashboard';
        dashboardSection.innerHTML = `
            <div class="dashboard-header">
                <h2>📊 Parliamentary Analytics Dashboard</h2>
                <div class="dashboard-controls">
                    <button class="dashboard-btn" onclick="window.dataViz.toggleDashboard()" id="dashboard-toggle-btn">
                        <span class="toggle-text">Hide Dashboard</span>
                    </button>
                    <button class="dashboard-btn" onclick="window.dataViz.refreshData()" id="dashboard-refresh-btn">🔄 Refresh</button>
                    <button class="dashboard-btn" onclick="window.dataViz.exportData()" id="dashboard-export-btn">📥 Export</button>
                </div>
            </div>

            <div class="dashboard-content">
                <div class="dashboard-tabs">
                    <button class="dashboard-tab active" data-tab="overview">📈 Overview</button>
                    <button class="dashboard-tab" data-tab="bills">📊 Bills Analysis</button>
                    <button class="dashboard-tab" data-tab="activity">🏛️ Parliamentary Activity</button>
                    <button class="dashboard-tab" data-tab="trends">📉 Trends</button>
                    <button class="dashboard-tab" data-tab="impact">🎯 Impact Analysis</button>
                </div>

                <div class="dashboard-panels">
                    <div class="dashboard-panel active" id="overview-panel">
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <div class="metric-value" id="total-bills">47</div>
                                <div class="metric-label">Total Bills</div>
                                <div class="metric-change positive">+3 this week</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value" id="active-bills">23</div>
                                <div class="metric-label">Active Bills</div>
                                <div class="metric-change neutral">No change</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value" id="enacted-bills">8</div>
                                <div class="metric-label">Enacted This Session</div>
                                <div class="metric-change positive">+2 this month</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value" id="committee-meetings">156</div>
                                <div class="metric-label">Committee Meetings</div>
                                <div class="metric-change positive">+12 this week</div>
                            </div>
                        </div>

                        <div class="charts-grid">
                            <div class="chart-container">
                                <h4>Bills by Category</h4>
                                <canvas id="bills-category-chart"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>Parliamentary Activity Timeline</h4>
                                <canvas id="activity-timeline-chart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-panel" id="bills-panel">
                        <div class="bills-analysis">
                            <div class="chart-container full-width">
                                <h4>Bill Progress Analysis</h4>
                                <canvas id="bill-progress-chart"></canvas>
                            </div>
                            <div class="bills-stats">
                                <div class="stat-row">
                                    <span>Average time to enactment:</span>
                                    <span class="stat-value">8.5 months</span>
                                </div>
                                <div class="stat-row">
                                    <span>Success rate:</span>
                                    <span class="stat-value">73%</span>
                                </div>
                                <div class="stat-row">
                                    <span>Most active committee:</span>
                                    <span class="stat-value">Health Committee</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-panel" id="activity-panel">
                        <div class="activity-heatmap">
                            <h4>Parliamentary Activity Heatmap</h4>
                            <div id="activity-heatmap-container"></div>
                        </div>
                        <div class="activity-breakdown">
                            <canvas id="activity-breakdown-chart"></canvas>
                        </div>
                    </div>

                    <div class="dashboard-panel" id="trends-panel">
                        <div class="trends-analysis">
                            <h4>Legislative Trends</h4>
                            <canvas id="trends-chart"></canvas>
                        </div>
                        <div class="trend-insights">
                            <div class="insight-card">
                                <h5>📈 Trending Up</h5>
                                <ul>
                                    <li>Technology & Digital Rights (+15%)</li>
                                    <li>Health & Social Care (+8%)</li>
                                    <li>Environment & Climate (+12%)</li>
                                </ul>
                            </div>
                            <div class="insight-card">
                                <h5>📉 Trending Down</h5>
                                <ul>
                                    <li>Business & Finance (-5%)</li>
                                    <li>Housing & Planning (-3%)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-panel" id="impact-panel">
                        <div class="impact-visualization">
                            <h4>Legislation Impact Analysis</h4>
                            <div class="impact-matrix">
                                <canvas id="impact-matrix-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after the search section
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            searchSection.parentNode.insertBefore(dashboardSection, searchSection.nextSibling);
        }

        this.setupDashboardEvents();
    }

    setupDashboardEvents() {
        // Tab switching
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchDashboardTab(e.target.dataset.tab);
            });
        });

        // Dashboard control buttons
        const toggleBtn = document.getElementById('dashboard-toggle-btn');
        const refreshBtn = document.getElementById('dashboard-refresh-btn');
        const exportBtn = document.getElementById('dashboard-export-btn');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleDashboard());
        }
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
    }

    switchDashboardTab(tabName) {
        // Update active tab
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active panel
        document.querySelectorAll('.dashboard-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-panel`).classList.add('active');

        // Load specific chart data for the tab
        this.loadTabData(tabName);
    }

    // Chart Creation and Management
    initializeChartLibrary() {
        // Simple chart implementation (in production, would use Chart.js or D3.js)
        this.chartColors = {
            primary: '#1d3557',
            secondary: '#457b9d',
            accent: '#f1faee',
            success: '#2d6a4f',
            warning: '#f77f00',
            danger: '#d62828'
        };
    }

    createChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');

        // Simple chart rendering (placeholder for real chart library)
        switch (type) {
            case 'pie':
                this.drawPieChart(ctx, data, options);
                break;
            case 'bar':
                this.drawBarChart(ctx, data, options);
                break;
            case 'line':
                this.drawLineChart(ctx, data, options);
                break;
            default:
                this.drawBarChart(ctx, data, options);
        }

        this.charts.set(canvasId, { type, data, options });
    }

    drawPieChart(ctx, data, options) {
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        let total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -Math.PI / 2;

        const colors = [
            this.chartColors.primary,
            this.chartColors.secondary,
            this.chartColors.success,
            this.chartColors.warning,
            this.chartColors.danger
        ];

        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Add labels
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, labelX, labelY);

            currentAngle += sliceAngle;
        });
    }

    drawBarChart(ctx, data, options) {
        const canvas = ctx.canvas;
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const maxValue = Math.max(...data.map(item => item.value));
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length * 0.2;

        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barSpacing);
            const y = canvas.height - padding - barHeight;

            // Draw bar
            ctx.fillStyle = this.chartColors.secondary;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, canvas.height - 10);

            // Draw value
            ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
        });
    }

    drawLineChart(ctx, data, options) {
        const canvas = ctx.canvas;
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const maxValue = Math.max(...data.map(item => item.value));
        const stepX = chartWidth / (data.length - 1);

        ctx.beginPath();
        ctx.strokeStyle = this.chartColors.primary;
        ctx.lineWidth = 3;

        data.forEach((item, index) => {
            const x = padding + index * stepX;
            const y = canvas.height - padding - (item.value / maxValue) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Draw points
            ctx.fillStyle = this.chartColors.secondary;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        ctx.stroke();
    }

    // Data Loading and Processing
    loadAnalyticsData() {
        // Simulate loading analytics data
        this.analyticsData = {
            billsByCategory: [
                { label: 'Technology', value: 12 },
                { label: 'Health', value: 8 },
                { label: 'Education', value: 6 },
                { label: 'Environment', value: 9 },
                { label: 'Economy', value: 7 },
                { label: 'Other', value: 5 }
            ],
            activityTimeline: [
                { label: 'Jan', value: 45 },
                { label: 'Feb', value: 52 },
                { label: 'Mar', value: 48 },
                { label: 'Apr', value: 61 },
                { label: 'May', value: 55 },
                { label: 'Jun', value: 67 }
            ],
            billProgress: [
                { label: 'First Reading', value: 15 },
                { label: 'Second Reading', value: 12 },
                { label: 'Committee', value: 8 },
                { label: 'Report Stage', value: 6 },
                { label: 'Third Reading', value: 4 },
                { label: 'Royal Assent', value: 2 }
            ]
        };
    }

    initializeDefaultCharts() {
        // Wait for DOM to be ready
        setTimeout(() => {
            this.createChart('bills-category-chart', 'pie', this.analyticsData.billsByCategory);
            this.createChart('activity-timeline-chart', 'line', this.analyticsData.activityTimeline);
            this.createChart('bill-progress-chart', 'bar', this.analyticsData.billProgress);
        }, 100);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'bills':
                this.loadBillsAnalysis();
                break;
            case 'activity':
                this.loadActivityData();
                break;
            case 'trends':
                this.loadTrendsData();
                break;
            case 'impact':
                this.loadImpactData();
                break;
        }
    }

    loadBillsAnalysis() {
        // Update bills analysis charts
        setTimeout(() => {
            this.createChart('bill-progress-chart', 'bar', this.analyticsData.billProgress);
        }, 100);
    }

    loadActivityData() {
        // Create activity heatmap
        this.createActivityHeatmap();

        // Activity breakdown chart
        const activityData = [
            { label: 'Debates', value: 45 },
            { label: 'Committees', value: 32 },
            { label: 'Questions', value: 28 },
            { label: 'Statements', value: 15 }
        ];

        setTimeout(() => {
            this.createChart('activity-breakdown-chart', 'pie', activityData);
        }, 100);
    }

    createActivityHeatmap() {
        const container = document.getElementById('activity-heatmap-container');
        if (!container) return;

        // Simple heatmap implementation
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const hours = Array.from({length: 12}, (_, i) => i + 9); // 9 AM to 8 PM

        let heatmapHTML = '<div class="heatmap-grid">';

        // Header row
        heatmapHTML += '<div class="heatmap-cell header"></div>';
        days.forEach(day => {
            heatmapHTML += `<div class="heatmap-cell header">${day}</div>`;
        });

        // Data rows
        hours.forEach(hour => {
            heatmapHTML += `<div class="heatmap-cell header">${hour}:00</div>`;
            days.forEach(() => {
                const intensity = Math.random();
                const className = intensity > 0.7 ? 'high' : intensity > 0.4 ? 'medium' : 'low';
                heatmapHTML += `<div class="heatmap-cell ${className}" title="Activity: ${Math.round(intensity * 100)}%"></div>`;
            });
        });

        heatmapHTML += '</div>';
        container.innerHTML = heatmapHTML;
    }

    loadTrendsData() {
        const trendsData = [
            { label: 'Q1', value: 23 },
            { label: 'Q2', value: 31 },
            { label: 'Q3', value: 28 },
            { label: 'Q4', value: 35 }
        ];

        setTimeout(() => {
            this.createChart('trends-chart', 'line', trendsData);
        }, 100);
    }

    loadImpactData() {
        const impactData = [
            { label: 'High Impact', value: 8 },
            { label: 'Medium Impact', value: 23 },
            { label: 'Low Impact', value: 16 }
        ];

        setTimeout(() => {
            this.createChart('impact-matrix-chart', 'pie', impactData);
        }, 100);
    }

    // Public Methods
    toggleDashboard() {
        const dashboard = document.querySelector('.analytics-dashboard');
        const button = document.querySelector('.dashboard-controls .toggle-text');

        if (!dashboard) {
            console.error('Dashboard element not found');
            return;
        }

        if (dashboard.classList.contains('collapsed')) {
            dashboard.classList.remove('collapsed');
            if (button) button.textContent = 'Hide Dashboard';
            console.log('📊 Dashboard shown');
        } else {
            dashboard.classList.add('collapsed');
            if (button) button.textContent = 'Show Dashboard';
            console.log('📊 Dashboard hidden');
        }
    }

    refreshData() {
        console.log('📊 Refreshing dashboard data...');

        // Show loading state
        const refreshBtn = document.getElementById('dashboard-refresh-btn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '🔄 Refreshing...';
        }

        // Simulate data refresh with delay
        setTimeout(() => {
            this.loadAnalyticsData();
            this.updateAllCharts();

            // Reset button
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '🔄 Refresh';
            }

            // Show success notification
            if (window.userSystem) {
                window.userSystem.showNotification('📊 Dashboard data refreshed successfully!', 'success');
            } else {
                // Fallback notification
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1001;
                    background: white;
                    color: #333;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-left: 4px solid #2d6a4f;
                `;
                notification.textContent = '📊 Dashboard data refreshed successfully!';
                document.body.appendChild(notification);

                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 3000);
            }

            console.log('📊 Dashboard refresh complete');
        }, 1500);
    }

    updateAllCharts() {
        // Redraw all charts with new data
        this.charts.forEach((chart, canvasId) => {
            this.createChart(canvasId, chart.type, chart.data, chart.options);
        });
    }

    exportData() {
        console.log('📥 Exporting analytics data...');

        try {
            // Show loading state
            const exportBtn = document.getElementById('dashboard-export-btn');
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = '📥 Exporting...';
            }

            // Prepare export data
            const dataToExport = {
                timestamp: new Date().toISOString(),
                analytics: this.analyticsData,
                metadata: {
                    totalBills: 47,
                    activeBills: 23,
                    enactedBills: 8,
                    committeeMeetings: 156,
                    exportedBy: 'GovWhiz Analytics Dashboard',
                    version: '2.0.0'
                },
                userInteractions: this.userInteractions || []
            };

            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `govwhiz-analytics-${new Date().toISOString().split('T')[0]}.json`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Reset button
            setTimeout(() => {
                if (exportBtn) {
                    exportBtn.disabled = false;
                    exportBtn.innerHTML = '📥 Export';
                }
            }, 1000);

            // Show success notification
            if (window.userSystem) {
                window.userSystem.showNotification('📥 Analytics data exported successfully!', 'success');
            } else {
                // Fallback notification
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1001;
                    background: white;
                    color: #333;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-left: 4px solid #2d6a4f;
                `;
                notification.textContent = '📥 Analytics data exported successfully!';
                document.body.appendChild(notification);

                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 3000);
            }

            console.log('📥 Export complete');

        } catch (error) {
            console.error('Export failed:', error);

            // Reset button
            const exportBtn = document.getElementById('dashboard-export-btn');
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = '📥 Export';
            }

            // Show error notification
            if (window.userSystem) {
                window.userSystem.showNotification('❌ Export failed. Please try again.', 'error');
            } else {
                alert('Export failed. Please try again.');
            }
        }
    }

    createVisualizationInterface() {
        // Add visualization controls to the interface
        console.log('📊 Data Visualization System initialized');

        // Debug function for testing buttons
        window.testDashboardButtons = () => {
            console.log('Testing dashboard buttons...');
            console.log('Toggle button:', document.getElementById('dashboard-toggle-btn'));
            console.log('Refresh button:', document.getElementById('dashboard-refresh-btn'));
            console.log('Export button:', document.getElementById('dashboard-export-btn'));
            console.log('Dashboard element:', document.querySelector('.analytics-dashboard'));
            console.log('DataViz instance:', window.dataViz);
        };
    }

    trackInteraction(type, data) {
        // Track user interactions for analytics
        if (!this.userInteractions) {
            this.userInteractions = [];
        }

        this.userInteractions.push({
            type,
            data,
            timestamp: Date.now()
        });

        // Keep only last 100 interactions
        if (this.userInteractions.length > 100) {
            this.userInteractions = this.userInteractions.slice(-100);
        }

        console.log(`📊 Tracked interaction: ${type}`, data);
    }
}

// Initialize data visualization system
document.addEventListener('DOMContentLoaded', () => {
    window.dataViz = new GovWhizDataVisualization();
});
