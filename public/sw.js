// Service Worker for Netanya Local PWA
const CACHE_VERSION = '1.0.0'
const STATIC_CACHE_NAME = `netanya-static-v${CACHE_VERSION}`
const DYNAMIC_CACHE_NAME = `netanya-dynamic-v${CACHE_VERSION}`
const IMAGE_CACHE_NAME = `netanya-images-v${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 100

// Files to cache on install
const STATIC_CACHE = [
  '/offline.html',
  '/manifest.webmanifest',
]

// Cache size limit helper
const limitCacheSize = (cacheName, maxSize) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxSize) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxSize))
      }
    })
  })
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_CACHE).catch((error) => {
        console.error('[SW] Failed to cache static files:', error)
      })
    })
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  const currentCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, IMAGE_CACHE_NAME]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Take control of all pages immediately
  self.clients.claim()
})

// Helper: Determine cache strategy based on request URL
const getCacheStrategy = (url) => {
  // Static assets from Next.js (versioned, immutable)
  if (url.includes('/_next/static/')) {
    return 'cache-first'
  }

  // Images
  if (url.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    return 'cache-first'
  }

  // Fonts and other static assets
  if (url.match(/\.(woff|woff2|ttf|eot)$/)) {
    return 'cache-first'
  }

  // API calls - always get fresh data
  if (url.includes('/api/')) {
    return 'network-only'
  }

  // Pages - network first with fallback
  return 'network-first'
}

// Fetch event - implement different caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url

  // Only handle GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and other schemes
  if (!url.startsWith('http')) {
    return
  }

  const strategy = getCacheStrategy(url)

  // CACHE-FIRST: Static assets (Next.js, images, fonts)
  if (strategy === 'cache-first') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request).then((response) => {
          if (response.status === 200) {
            const cacheName = url.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)
              ? IMAGE_CACHE_NAME
              : STATIC_CACHE_NAME

            const responseToCache = response.clone()
            caches.open(cacheName).then((cache) => {
              cache.put(request, responseToCache)

              // Limit cache sizes
              if (cacheName === IMAGE_CACHE_NAME) {
                limitCacheSize(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_SIZE)
              }
            })
          }
          return response
        })
      })
    )
  }

  // NETWORK-FIRST: Pages and dynamic content
  else if (strategy === 'network-first') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
              limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_SIZE)
            })
          }
          return response
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            // If page navigation and no cache, show offline page
            if (!cachedResponse && request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
            return cachedResponse || new Response('Network error', { status: 503 })
          })
        })
    )
  }

  // NETWORK-ONLY: API calls
  else if (strategy === 'network-only') {
    event.respondWith(fetch(request))
  }
})

// Message event for predictive caching
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls || []
    console.log('[SW] Predictive caching:', urlsToCache)

    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return Promise.all(
          urlsToCache.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.status === 200) {
                  return cache.put(url, response)
                }
              })
              .catch((error) => {
                console.error('[SW] Failed to cache:', url, error)
              })
          )
        )
      })
    )
  }
})
