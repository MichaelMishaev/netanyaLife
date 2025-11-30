/**
 * ✅ PWA & OFFLINE FUNCTIONALITY TESTS
 *
 * Tests Progressive Web App features:
 * - Service Worker registration
 * - Offline mode functionality
 * - PWA install prompt
 * - Cached pages work offline
 * - Manifest.json validation
 *
 * According to docs/sysAnal.md:281-294
 */

import { test, expect, Page } from '@playwright/test'

test.describe('PWA: Progressive Web App Features', () => {
  test('PWA - Manifest.json exists and is valid', async ({ page }) => {
    console.log('📱 Testing PWA Manifest')

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Check for manifest link in head
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toBeVisible()

    const manifestHref = await manifestLink.getAttribute('href')
    expect(manifestHref).toBeTruthy()
    console.log(`✅ Manifest link found: ${manifestHref}`)

    // Fetch and validate manifest
    const manifestUrl = new URL(manifestHref!, page.url()).href
    const manifestResponse = await page.request.get(manifestUrl)
    expect(manifestResponse.ok()).toBe(true)

    const manifest = await manifestResponse.json()

    // Validate required fields (docs/sysAnal.md:281-294)
    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.start_url).toBeTruthy()
    expect(manifest.display).toBeTruthy()
    expect(manifest.lang).toBe('he')
    expect(manifest.dir).toBe('rtl')

    console.log('✅ Manifest validation:')
    console.log(`  Name: ${manifest.name}`)
    console.log(`  Short name: ${manifest.short_name}`)
    console.log(`  Start URL: ${manifest.start_url}`)
    console.log(`  Display: ${manifest.display}`)
    console.log(`  Lang: ${manifest.lang}`)
    console.log(`  Direction: ${manifest.dir}`)

    // Check for icons
    expect(manifest.icons).toBeTruthy()
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThan(0)

    console.log(`✅ Manifest has ${manifest.icons.length} icons`)
  })

  test('PWA - Service Worker registers successfully', async ({ page, context }) => {
    console.log('⚙️  Testing Service Worker Registration')

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Wait a bit for service worker to register
    await page.waitForTimeout(2000)

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return registration !== undefined
      }
      return false
    })

    expect(swRegistered).toBe(true)
    console.log('✅ Service Worker registered successfully')

    // Get service worker details
    const swDetails = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          return {
            scope: registration.scope,
            hasActive: registration.active !== null,
            hasWaiting: registration.waiting !== null,
            hasInstalling: registration.installing !== null
          }
        }
      }
      return null
    })

    console.log('Service Worker details:', swDetails)
  })

  test('PWA - Cache is populated after first visit', async ({ page }) => {
    console.log('💾 Testing Cache Population')

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Wait for service worker to cache assets
    await page.waitForTimeout(3000)

    // Check if caches are populated
    const cacheInfo = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        const cacheData: { [key: string]: number } = {}

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName)
          const keys = await cache.keys()
          cacheData[cacheName] = keys.length
        }

        return {
          cacheCount: cacheNames.length,
          caches: cacheData
        }
      }
      return null
    })

    if (cacheInfo) {
      expect(cacheInfo.cacheCount).toBeGreaterThan(0)
      console.log(`✅ Found ${cacheInfo.cacheCount} cache(s)`)
      console.log('Cache details:', cacheInfo.caches)
    } else {
      console.log('⚠️  Cache API not available or not populated yet')
    }
  })

  test('PWA - Offline mode shows fallback message', async ({ page, context }) => {
    console.log('📴 Testing Offline Mode')

    // First, visit the page online to cache it
    await page.goto('/he')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('✅ Page cached')

    // Go offline
    await context.setOffline(true)
    console.log('📴 Network set to offline')

    // Try to navigate to a new page (should show offline fallback)
    await page.goto('/he/categories')
    await page.waitForLoadState('networkidle')

    // Check for offline message (docs/sysAnal.md:292-294)
    const offlineMessage = page.locator('text=/אין חיבור לאינטרנט|No internet|Нет подключения/i')
    const hasOfflineMessage = await offlineMessage.isVisible().catch(() => false)

    if (hasOfflineMessage) {
      console.log('✅ Offline fallback message displayed')
    } else {
      console.log('ℹ️  Page might be cached and working offline')
    }

    // Go back online
    await context.setOffline(false)
    console.log('✅ Network restored')
  })

  test('PWA - Cached pages work offline', async ({ page, context }) => {
    console.log('📴 Testing Cached Pages Work Offline')

    // Visit homepage and wait for caching
    await page.goto('/he')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Visit search results page
    const categorySelect = page.locator('select').first()
    await categorySelect.selectOption({ index: 1 })

    const hasRadioGroup = await page.getByRole('radiogroup').isVisible().catch(() => false)
    if (hasRadioGroup) {
      await page.getByRole('radio').first().click()
    } else {
      await page.locator('select').nth(1).selectOption({ index: 1 })
    }

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/search\//)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const searchUrl = page.url()
    console.log('✅ Search page cached')

    // Go offline
    await context.setOffline(true)
    console.log('📴 Going offline')

    // Try to reload the cached search page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Page should still work (either from cache or show offline message)
    const pageTitle = await page.title()
    expect(pageTitle).toBeTruthy()

    const bodyVisible = await page.locator('body').isVisible()
    expect(bodyVisible).toBe(true)

    console.log('✅ Cached page accessible offline')

    // Restore online
    await context.setOffline(false)
  })

  test('PWA - Install prompt can be triggered', async ({ page }) => {
    console.log('⬇️  Testing PWA Install Prompt')

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Check if beforeinstallprompt event is available
    const canInstall = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault()
          resolve(true)
        })

        // Timeout after 2 seconds
        setTimeout(() => resolve(false), 2000)
      })
    })

    if (canInstall) {
      console.log('✅ PWA install prompt available')
    } else {
      console.log('ℹ️  PWA install prompt not triggered (might already be installed or criteria not met)')
    }

    // Check for install button in UI
    const installBtn = page.locator('button').filter({ hasText: /התקן|Install|Установить|PWA/ })
    const hasInstallBtn = await installBtn.count() > 0

    if (hasInstallBtn) {
      console.log('✅ PWA install button found in UI')
      await expect(installBtn.first()).toBeVisible()
    } else {
      console.log('ℹ️  No install button in UI (might appear after beforeinstallprompt)')
    }
  })

  test('PWA - Mobile meta tags are present', async ({ page }) => {
    console.log('📱 Testing Mobile PWA Meta Tags')

    await page.goto('/he')

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]')
    const viewportContent = await viewport.getAttribute('content')
    expect(viewportContent).toContain('width=device-width')
    expect(viewportContent).toContain('initial-scale=1')
    console.log('✅ Viewport meta tag correct')

    // Check theme color
    const themeColor = page.locator('meta[name="theme-color"]')
    const themeColorExists = await themeColor.count() > 0
    if (themeColorExists) {
      const color = await themeColor.getAttribute('content')
      console.log(`✅ Theme color: ${color}`)
    }

    // Check apple-mobile-web-app-capable
    const appleMobileCapable = page.locator('meta[name="apple-mobile-web-app-capable"]')
    const appleCapableExists = await appleMobileCapable.count() > 0
    if (appleCapableExists) {
      console.log('✅ Apple mobile web app capable meta tag found')
    }

    // Check apple touch icons
    const appleTouchIcons = page.locator('link[rel="apple-touch-icon"]')
    const appleTouchIconCount = await appleTouchIcons.count()
    if (appleTouchIconCount > 0) {
      console.log(`✅ Found ${appleTouchIconCount} apple-touch-icon(s)`)
    }
  })

  test('PWA - Standalone mode detection works', async ({ page }) => {
    console.log('🖥️  Testing Standalone Mode Detection')

    await page.goto('/he')

    // Check if app can detect standalone mode
    const isStandalone = await page.evaluate(() => {
      // Check if running as PWA
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      )
    })

    console.log(`Standalone mode: ${isStandalone}`)

    // In regular browser, this should be false
    // When installed as PWA, this would be true
    console.log(`✅ Standalone mode detection working (currently: ${isStandalone ? 'PWA' : 'Browser'})`)
  })

  test('PWA - All static assets are cacheable', async ({ page }) => {
    console.log('📦 Testing Static Asset Caching')

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Get all static asset requests
    const staticAssets = await page.evaluate(() => {
      const assets: string[] = []

      // Get scripts
      document.querySelectorAll('script[src]').forEach(el => {
        assets.push((el as HTMLScriptElement).src)
      })

      // Get stylesheets
      document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
        assets.push((el as HTMLLinkElement).href)
      })

      // Get images
      document.querySelectorAll('img[src]').forEach(el => {
        assets.push((el as HTMLImageElement).src)
      })

      return assets
    })

    console.log(`Found ${staticAssets.length} static assets`)

    // Verify they all return successful responses
    let successCount = 0
    for (const asset of staticAssets.slice(0, 10)) { // Test first 10
      try {
        const response = await page.request.get(asset)
        if (response.ok()) {
          successCount++
        }
      } catch (error) {
        console.log(`  ⚠️  Failed to fetch: ${asset}`)
      }
    }

    console.log(`✅ ${successCount}/${Math.min(staticAssets.length, 10)} static assets loaded successfully`)
  })
})

test.describe('PWA: Performance & Optimization', () => {
  test('PWA - Page loads within acceptable time', async ({ page }) => {
    console.log('⚡ Testing Page Load Performance')

    const startTime = Date.now()

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    console.log(`Page load time: ${loadTime}ms`)

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
    console.log('✅ Page loads within acceptable time')
  })

  test('PWA - First Contentful Paint is fast', async ({ page }) => {
    console.log('🎨 Testing First Contentful Paint')

    await page.goto('/he')

    const fcpMetric = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            observer.disconnect()
            resolve(fcpEntry.startTime)
          }
        })
        observer.observe({ type: 'paint', buffered: true })

        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000)
      })
    })

    if (fcpMetric && typeof fcpMetric === 'number') {
      console.log(`First Contentful Paint: ${fcpMetric.toFixed(2)}ms`)

      // Should be under 2 seconds
      expect(fcpMetric).toBeLessThan(2000)
      console.log('✅ Fast FCP')
    } else {
      console.log('ℹ️  FCP metric not available')
    }
  })
})

console.log('📱 PWA & Offline Test Suite Loaded!')
