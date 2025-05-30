// Performance monitoring and optimization
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            apiCalls: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            loadTimes: []
        };
        this.init();
    }

    init() {
        this.observeNetworkRequests();
        this.observeErrors();
        this.collectMetrics();
    }

    observeNetworkRequests() {
        if (window.PerformanceObserver) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
                        this.metrics.apiCalls++;
                        this.metrics.loadTimes.push(entry.duration);
                    }
                });
            });
            observer.observe({ entryTypes: ['resource'] });
        }
    }

    observeErrors() {
        window.addEventListener('error', (event) => {
            this.metrics.errors++;
            this.logError(event);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errors++;
            this.logError(event);
        });
    }

    logError(error) {
        console.error('[Performance Monitor]', {
            timestamp: new Date().toISOString(),
            type: error.type,
            message: error.message || error.reason,
            stack: error.error?.stack
        });
    }

    collectMetrics() {
        setInterval(() => {
            const averageLoadTime = this.metrics.loadTimes.length ?
                this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length :
                0;

            const report = {
                timestamp: new Date().toISOString(),
                metrics: {
                    ...this.metrics,
                    averageLoadTime
                }
            };

            // Send metrics to server or console
            console.log('[Performance Report]', report);

            // Reset metrics for next interval
            this.metrics.apiCalls = 0;
            this.metrics.loadTimes = [];
        }, 60000); // Collect metrics every minute
    }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();
