const CACHE_NAME = 'govwhiz-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/styles.css',
  '/static/js/govwhiz-main.js',
  '/static/manifest.json',
  // Add other static assets
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Background Sync for offline support
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/static/images/icon-192.png',
    badge: '/static/images/icon-96.png',
    vibrate: [100, 50, 100],
    data: {
      url: event.data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('GovWhiz Update', options)
  );
});

async function syncMessages() {
  try {
    const messagesQueue = await getMessagesQueue();
    await Promise.all(messagesQueue.map(msg => sendMessage(msg)));
    await clearMessagesQueue();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
