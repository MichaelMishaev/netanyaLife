'use client'

import { useEffect } from 'react'

export default function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope)

          // Check for updates periodically (every hour)
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        })

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker updated, reloading page...')
        window.location.reload()
      })
    }

    // Predictive caching: Cache popular routes on idle
    if ('requestIdleCallback' in window && 'serviceWorker' in navigator) {
      requestIdleCallback(() => {
        const popularRoutes = [
          '/he',
          '/ru',
          '/he/search',
          '/ru/search',
        ]

        // Send message to service worker to cache these routes
        navigator.serviceWorker.ready.then((registration) => {
          registration.active?.postMessage({
            type: 'CACHE_URLS',
            urls: popularRoutes,
          })
        })
      })
    }
  }, [])

  return null
}
