/**
 * GovWhiz Service Worker
 * Enables offline functionality and push notifications
 */

const CACHE_NAME = 'govwhiz-v1.0.0';
const STATIC_CACHE = 'govwhiz-static-v1';
const DYNAMIC_CACHE = 'govwhiz-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/auto-updater.js',
    '/user-system.js',
    '/advanced-search.js',
    '/real-time-system.js',
    '/data-visualization.js',
    '/update-config.json'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Serve from cache
                    return cachedResponse;
                }
                
                // Fetch from network and cache dynamic content
                return fetch(request)
                    .then(networkResponse => {
                        // Check if response is valid
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone response for caching
                        const responseToCache = networkResponse.clone();
                        
                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Push notification event
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    let notificationData = {
        title: 'GovWhiz Update',
        body: 'New parliamentary activity available',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'govwhiz-update',
        data: {
            url: '/'
        }
    };
    
    if (event.data) {
        try {
            notificationData = { ...notificationData, ...event.data.json() };
        } catch (error) {
            console.error('Service Worker: Error parsing push data', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            data: notificationData.data,
            actions: [
                {
                    action: 'view',
                    title: 'View Update',
                    icon: '/favicon.ico'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: '/favicon.ico'
                }
            ],
            requireInteraction: true,
            vibrate: [200, 100, 200]
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        // Open or focus the app
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(clientList => {
                    // Check if app is already open
                    for (const client of clientList) {
                        if (client.url === self.location.origin && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // Open new window
                    if (clients.openWindow) {
                        return clients.openWindow(event.notification.data?.url || '/');
                    }
                })
        );
    }
});

// Background sync event
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'govwhiz-data-sync') {
        event.waitUntil(
            syncData()
        );
    }
});

// Sync data function
async function syncData() {
    try {
        console.log('Service Worker: Syncing data...');
        
        // Get stored sync requests
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        // Process sync requests
        for (const request of requests) {
            if (request.url.includes('/api/')) {
                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        await cache.put(request, response.clone());
                        console.log('Service Worker: Synced', request.url);
                    }
                } catch (error) {
                    console.error('Service Worker: Sync failed for', request.url, error);
                }
            }
        }
        
        // Notify clients of successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                timestamp: Date.now()
            });
        });
        
    } catch (error) {
        console.error('Service Worker: Data sync failed', error);
    }
}

// Message event - handle messages from main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_UPDATE':
            // Force cache update
            caches.delete(STATIC_CACHE)
                .then(() => caches.open(STATIC_CACHE))
                .then(cache => cache.addAll(STATIC_FILES))
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                })
                .catch(error => {
                    event.ports[0].postMessage({ success: false, error });
                });
            break;
            
        case 'GET_CACHE_STATUS':
            // Return cache status
            caches.has(STATIC_CACHE)
                .then(hasCache => {
                    event.ports[0].postMessage({
                        hasCache,
                        cacheNames: [STATIC_CACHE, DYNAMIC_CACHE]
                    });
                });
            break;
            
        default:
            console.log('Service Worker: Unknown message type', event.data.type);
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    console.log('Service Worker: Periodic sync triggered');
    
    if (event.tag === 'govwhiz-daily-update') {
        event.waitUntil(
            performDailyUpdate()
        );
    }
});

// Perform daily update
async function performDailyUpdate() {
    try {
        console.log('Service Worker: Performing daily update...');
        
        // Simulate fetching latest data
        const updateData = {
            timestamp: Date.now(),
            bills: [],
            news: [],
            stats: {}
        };
        
        // Store update data
        const cache = await caches.open(DYNAMIC_CACHE);
        const response = new Response(JSON.stringify(updateData), {
            headers: { 'Content-Type': 'application/json' }
        });
        
        await cache.put('/api/daily-update', response);
        
        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'DAILY_UPDATE_COMPLETE',
                data: updateData
            });
        });
        
        // Show notification
        await self.registration.showNotification('GovWhiz Daily Update', {
            body: 'New parliamentary data is available',
            icon: '/favicon.ico',
            tag: 'daily-update',
            data: { url: '/' }
        });
        
    } catch (error) {
        console.error('Service Worker: Daily update failed', error);
    }
}

// Error event
self.addEventListener('error', event => {
    console.error('Service Worker: Error occurred', event.error);
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});

console.log('Service Worker: Script loaded');
