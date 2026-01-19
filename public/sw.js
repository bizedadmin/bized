const CACHE_NAME = 'bized-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Navigation requests (HTML): Network First, fall back to Cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then((response) => {
                            return response || caches.match('/');
                        });
                })
        );
        return;
    }

    // Static assets (Images, CSS, JS): Cache First, fall back to Network
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
