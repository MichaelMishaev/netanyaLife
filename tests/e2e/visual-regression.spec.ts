import { test, expect } from '@playwright/test'

/**
 * Visual Regression Tests
 *
 * These tests capture screenshots of key pages and compare them
 * to baseline images to detect unintended visual changes.
 *
 * Run with: npm run test:e2e -- visual-regression.spec.ts
 * Update snapshots: npm run test:e2e -- visual-regression.spec.ts --update-snapshots
 */

test.describe('Visual Regression Tests', () => {
  test.describe('Home Page', () => {
    test('Hebrew home page matches snapshot', async ({ page }) => {
      await page.goto('/he')
      await page.waitForLoadState('networkidle')

      // Wait for font to load
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('home-he.png', {
        fullPage: true,
        maxDiffPixels: 100, // Allow minor rendering differences
      })
    })

    test('Russian home page matches snapshot', async ({ page }) => {
      await page.goto('/ru')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('home-ru.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })
  })

  test.describe('RTL vs LTR Layout', () => {
    test('Hebrew page uses RTL layout', async ({ page }) => {
      await page.goto('/he')
      const html = page.locator('html')
      await expect(html).toHaveAttribute('dir', 'rtl')
      await expect(html).toHaveAttribute('lang', 'he')

      // Take screenshot of RTL layout
      await expect(page).toHaveScreenshot('layout-rtl.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })

    test('Russian page uses LTR layout', async ({ page }) => {
      await page.goto('/ru')
      const html = page.locator('html')
      await expect(html).toHaveAttribute('dir', 'ltr')
      await expect(html).toHaveAttribute('lang', 'ru')

      // Take screenshot of LTR layout
      await expect(page).toHaveScreenshot('layout-ltr.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })
  })

  test.describe('Add Business Form', () => {
    test('Add business form renders correctly (Hebrew)', async ({ page }) => {
      await page.goto('/he/add-business')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('add-business-he.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })

    test('Add business form renders correctly (Russian)', async ({ page }) => {
      await page.goto('/ru/add-business')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('add-business-ru.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })
  })

  test.describe('Accessibility Panel', () => {
    test('Accessibility panel visual states', async ({ page }) => {
      await page.goto('/he')
      await page.waitForLoadState('networkidle')

      // Default state
      await expect(page).toHaveScreenshot('accessibility-closed.png', {
        maxDiffPixels: 100,
      })

      // Open panel
      const accessibilityButton = page.locator('button[aria-label*="נגישות"], button:has-text("♿")')
      await accessibilityButton.click()
      await page.waitForTimeout(300) // Wait for animation

      await expect(page).toHaveScreenshot('accessibility-open.png', {
        maxDiffPixels: 100,
      })

      // Large font
      await page.locator('button:has-text("גדול"), button:has-text("Большой")').click()
      await page.waitForTimeout(300)

      await expect(page).toHaveScreenshot('accessibility-large-font.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })

      // High contrast (close panel first to see full effect)
      await accessibilityButton.click()
      await page.waitForTimeout(300)
      await accessibilityButton.click()
      await page.locator('button:has-text("ניגודיות"), button:has-text("Контрастность")').click()
      await accessibilityButton.click() // Close panel
      await page.waitForTimeout(300)

      await expect(page).toHaveScreenshot('accessibility-high-contrast.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

    test('Mobile home page (Hebrew)', async ({ page }) => {
      await page.goto('/he')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('mobile-home-he.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })

    test('Mobile add business form', async ({ page }) => {
      await page.goto('/he/add-business')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('mobile-add-business.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })
  })

  test.describe('Admin Panel', () => {
    test('Admin login page', async ({ page }) => {
      await page.goto('/he/admin/login')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('admin-login.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    })
  })

  test.describe('Loading States', () => {
    test('Search results loading skeleton', async ({ page }) => {
      // Intercept and delay the API response to capture loading state
      await page.route('**/api/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        await route.continue()
      })

      const navigation = page.goto('/he/search/plumbers/merkaz')

      // Wait a bit to capture loading state
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('search-loading.png', {
        maxDiffPixels: 100,
      })

      await navigation
    })
  })
})
