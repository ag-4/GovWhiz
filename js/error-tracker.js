// Error tracking and monitoring system
class ErrorTracker {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.setupHandlers();
    }

    setupHandlers() {
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            this.trackError({
                type: 'runtime',
                message: msg,
                location: { url, lineNo, columnNo },
                stack: error?.stack,
                timestamp: new Date().toISOString()
            });
            return false;
        };

        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                reason: event.reason,
                timestamp: new Date().toISOString()
            });
        });

        // API error handling
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    this.trackError({
                        type: 'api',
                        status: response.status,
                        url: args[0],
                        timestamp: new Date().toISOString()
                    });
                }
                return response;
            } catch (error) {
                this.trackError({
                    type: 'network',
                    message: error.message,
                    url: args[0],
                    timestamp: new Date().toISOString()
                });
                throw error;
            }
        };
    }

    trackError(error) {
        this.errors.unshift(error);
        if (this.errors.length > this.maxErrors) {
            this.errors.pop();
        }
        
        // Log to console
        console.error('[Error Tracker]', error);

        // Send to server if needed
        this.reportError(error);
    }

    async reportError(error) {
        try {
            const response = await fetch('/.netlify/functions/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(error)
            });

            if (!response.ok) {
                console.error('Failed to report error:', error);
            }
        } catch (e) {
            console.error('Error reporting failed:', e);
        }
    }

    getRecentErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
    }
}

// Initialize error tracking
const errorTracker = new ErrorTracker();
