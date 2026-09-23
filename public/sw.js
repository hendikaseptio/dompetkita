const CACHE_NAME = 'dompetkita-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
    OFFLINE_URL,
    '/manifest.webmanifest',
    '/favicon.svg',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icon-maskable-192x192.png',
    '/icons/icon-maskable-512x512.png',
];

// Install event: Pre-cache shell assets & skip waiting
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting()),
    );
});

// Activate event: Clean up old caches & claim clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((name) => {
                        if (name !== CACHE_NAME) {
                            return caches.delete(name);
                        }
                    }),
                );
            })
            .then(() => self.clients.claim()),
    );
});

// Fetch event: Network-first for navigation, stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Do not intercept non-GET requests (POST, PUT, DELETE, etc.)
    if (request.method !== 'GET') {
        return;
    }

    // Skip Chrome extension requests and non-http(s)
    if (!request.url.startsWith('http')) {
        return;
    }

    const url = new URL(request.url);

    // Navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                const offlineResponse = await cache.match(OFFLINE_URL);
                return (
                    offlineResponse ||
                    new Response('Offline', {
                        status: 503,
                        statusText: 'Offline',
                    })
                );
            }),
        );
        return;
    }

    // Static assets (images, icons, fonts, manifest)
    const isStaticAsset =
        url.pathname.startsWith('/icons/') ||
        url.pathname.startsWith('/build/assets/') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.ico') ||
        url.pathname === '/manifest.webmanifest';

    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                return cachedResponse || fetchPromise;
            }),
        );
        return;
    }

    // Default: Network with fallback
    event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// Listen for message events (e.g. force skipWaiting)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
