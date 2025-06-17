/**
 * Haven Word Church - Service Worker
 * Provides offline functionality and caching for PWA
 */

const CACHE_NAME = 'haven-word-church-v1.0.0';
const STATIC_CACHE_NAME = 'haven-word-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'haven-word-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/havenword.jpeg',
  '/logo512.png',
  '/apple-touch-icon.png',
  // Add more static assets as needed
];

// Routes to cache dynamically
const CACHEABLE_ROUTES = [
  '/',
  '/about',
  '/events',
  '/sermons',
  '/ministries',
  '/blog',
  '/contact',
  '/member/login'
];

// API endpoints to cache
const CACHEABLE_API_ROUTES = [
  '/api/events',
  '/api/sermons',
  '/api/blog',
  '/api/ministries'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/);
}

/**
 * Check if request is for API
 */
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

/**
 * Check if request is for navigation (page)
 */
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

/**
 * Handle static asset requests - Cache First strategy
 */
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    // Return offline fallback if available
    return caches.match('/offline.html') || new Response('Offline');
  }
}

/**
 * Handle API requests - Network First strategy with cache fallback
 */
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && CACHEABLE_API_ROUTES.some(route => 
        request.url.includes(route))) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline API response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This content is not available offline'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle navigation requests - Network First with offline fallback
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Navigation network failed, trying cache');
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try to get homepage from cache as fallback
    const homepageResponse = await caches.match('/');
    if (homepageResponse) {
      return homepageResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html') || new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Haven Word Church - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          h1 { margin-bottom: 20px; }
          p { margin-bottom: 20px; opacity: 0.9; }
          button {
            background: white;
            color: #3b82f6;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🙏 Haven Word Church</h1>
          <h2>You're Offline</h2>
          <p>It looks like you're not connected to the internet. Some content may not be available.</p>
          <p>Please check your connection and try again.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

/**
 * Handle other requests - Network First
 */
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForms());
  } else if (event.tag === 'prayer-request') {
    event.waitUntil(syncPrayerRequests());
  } else if (event.tag === 'rsvp-form') {
    event.waitUntil(syncRSVPForms());
  }
});

/**
 * Sync offline contact forms when online
 */
async function syncContactForms() {
  try {
    // Get offline contact forms from IndexedDB
    const offlineForms = await getOfflineData('contact-forms');
    
    for (const form of offlineForms) {
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form.data)
        });
        
        // Remove synced form from offline storage
        await removeOfflineData('contact-forms', form.id);
        console.log('[SW] Contact form synced successfully');
      } catch (error) {
        console.error('[SW] Failed to sync contact form:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Contact form sync failed:', error);
  }
}

/**
 * Sync offline prayer requests when online
 */
async function syncPrayerRequests() {
  try {
    const offlineRequests = await getOfflineData('prayer-requests');
    
    for (const request of offlineRequests) {
      try {
        await fetch('/api/prayer-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });
        
        await removeOfflineData('prayer-requests', request.id);
        console.log('[SW] Prayer request synced successfully');
      } catch (error) {
        console.error('[SW] Failed to sync prayer request:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Prayer request sync failed:', error);
  }
}

/**
 * Sync offline RSVP forms when online
 */
async function syncRSVPForms() {
  try {
    const offlineRSVPs = await getOfflineData('rsvp-forms');
    
    for (const rsvp of offlineRSVPs) {
      try {
        await fetch('/api/events/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rsvp.data)
        });
        
        await removeOfflineData('rsvp-forms', rsvp.id);
        console.log('[SW] RSVP form synced successfully');
      } catch (error) {
        console.error('[SW] Failed to sync RSVP form:', error);
      }
    }
  } catch (error) {
    console.error('[SW] RSVP form sync failed:', error);
  }
}

/**
 * Get offline data from IndexedDB (placeholder - implement with IndexedDB)
 */
async function getOfflineData(storeName) {
  // This would be implemented with IndexedDB
  // For now, return empty array
  return [];
}

/**
 * Remove offline data from IndexedDB (placeholder)
 */
async function removeOfflineData(storeName, id) {
  // This would be implemented with IndexedDB
  console.log(`[SW] Would remove ${id} from ${storeName}`);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have a new message from Haven Word Church',
    icon: '/havenword.jpeg',
    badge: '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/open-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-192.png'
      }
    ]
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data.url = payload.url || options.data.url;
  }

  event.waitUntil(
    self.registration.showNotification('Haven Word Church', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'update-content') {
    event.waitUntil(updateCachedContent());
  }
});

/**
 * Update cached content in background
 */
async function updateCachedContent() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    
    // Update frequently changing content
    const urlsToUpdate = [
      '/api/events/upcoming',
      '/api/sermons/latest',
      '/api/blog/recent'
    ];
    
    for (const url of urlsToUpdate) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('[SW] Updated cached content:', url);
        }
      } catch (error) {
        console.error('[SW] Failed to update cached content:', url, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background content update failed:', error);
  }
}

console.log('[SW] Service worker script loaded');