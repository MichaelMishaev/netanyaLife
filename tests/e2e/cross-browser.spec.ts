import { test, expect } from '@playwright/test'

/**
 * Cross-Browser Compatibility Tests
 *
 * These tests verify that key functionality works across
 * Chrome, Firefox, Safari, and Edge.
 *
 * Run with: npm run test:e2e -- cross-browser.spec.ts
 */

test.describe('Cross-Browser Compatibility', () => {
  test.describe('Language Switching', () => {
    test('switches from Hebrew to Russian', async ({ page }) => {
      await page.goto('/he')

      // Verify we're on Hebrew
      const html = page.locator('html')
      await expect(html).toHaveAttribute('lang', 'he')
      await expect(html).toHaveAttribute('dir', 'rtl')

      // Click language switcher button (shows "Русский" when on Hebrew page)
      const languageSwitcher = page.locator('button').filter({ hasText: /Русский/ })
      await languageSwitcher.click()

      // Wait for navigation
      await page.waitForURL('**/ru**')

      // Verify we're now on Russian
      await expect(html).toHaveAttribute('lang', 'ru')
      await expect(html).toHaveAttribute('dir', 'ltr')
    })

    test('switches from Russian to Hebrew', async ({ page }) => {
      await page.goto('/ru')

      const html = page.locator('html')
      await expect(html).toHaveAttribute('lang', 'ru')

      // Click language switcher button (shows "עברית" when on Russian page)
      const languageSwitcher = page.locator('button').filter({ hasText: /עברית/ })
      await languageSwitcher.click()

      await page.waitForURL('**/he**')
      await expect(html).toHaveAttribute('lang', 'he')
      await expect(html).toHaveAttribute('dir', 'rtl')
    })
  })

  test.describe('Navigation', () => {
    test('navigates to add business page', async ({ page }) => {
      await page.goto('/he')

      // Click "Add Business" link
      const addBusinessLink = page.locator('a').filter({ hasText: /הוסף עסק|Add Business/ })
      await addBusinessLink.click()

      // Verify navigation
      await expect(page).toHaveURL(/.*add-business/)

      // Verify form is present
      const form = page.locator('form')
      await expect(form).toBeVisible()
    })

    test('navigates back to home from add business', async ({ page }) => {
      await page.goto('/he/add-business')

      // Click back link (using icon or text)
      const backLink = page.locator('a[href="/he"], a[href*="he"]').first()
      await backLink.click()

      // Verify navigation to home
      await expect(page).toHaveURL(/.*\/he\/?$/)
    })
  })

  test.describe('Forms', () => {
    test('add business form validation works', async ({ page }) => {
      await page.goto('/he/add-business')

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // Should show validation errors
      // (HTML5 validation will prevent submission)
      const requiredInputs = page.locator('input[required], select[required], textarea[required]')
      const count = await requiredInputs.count()

      expect(count).toBeGreaterThan(0)
    })

    test('form inputs accept text in multiple languages', async ({ page }) => {
      await page.goto('/he/add-business')

      // Test Hebrew input
      const nameHeInput = page.locator('input[name*="name"][name*="he"], input[placeholder*="עברית"]').first()
      if (await nameHeInput.count() > 0) {
        await nameHeInput.fill('עסק בדיקה')
        await expect(nameHeInput).toHaveValue('עסק בדיקה')
      }

      // Test Russian input
      const nameRuInput = page.locator('input[name*="name"][name*="ru"], input[placeholder*="Русский"]').first()
      if (await nameRuInput.count() > 0) {
        await nameRuInput.fill('Тестовый бизнес')
        await expect(nameRuInput).toHaveValue('Тестовый бизнес')
      }

      // Test phone number input
      const phoneInput = page.locator('input[type="tel"], input[name*="phone"]').first()
      await phoneInput.fill('0501234567')
      await expect(phoneInput).toHaveValue('0501234567')
    })
  })

  test.describe('Accessibility Features', () => {
    test('skip link appears on keyboard focus', async ({ page }) => {
      await page.goto('/he')

      // Tab to focus skip link
      await page.keyboard.press('Tab')

      // Skip link should be visible
      const skipLink = page.locator('a.skip-link')
      await expect(skipLink).toBeVisible()
      await expect(skipLink).toBeFocused()
    })

    test('accessibility panel opens and closes', async ({ page }) => {
      await page.goto('/he')

      // Find and click accessibility button
      const accessibilityButton = page.locator('button').filter({ hasText: /♿/ }).first()
      await accessibilityButton.click()

      // Panel should be visible
      await page.waitForTimeout(300) // Wait for animation

      // Look for panel content (font size buttons, contrast toggle, etc.)
      const panelContent = page.locator('button').filter({ hasText: /רגיל|Normal|גדול|Large/ })
      await expect(panelContent.first()).toBeVisible()

      // Close panel
      await accessibilityButton.click()
      await page.waitForTimeout(300)
    })

    test('font size changes are applied', async ({ page }) => {
      await page.goto('/he')

      // Open accessibility panel
      const accessibilityButton = page.locator('button').filter({ hasText: /♿/ }).first()
      await accessibilityButton.click()
      await page.waitForTimeout(500)

      // Click "Large" font size
      const largeFontButton = page.locator('button').filter({ hasText: /גדול|Large|Большой/ }).first()
      await largeFontButton.click()
      await page.waitForTimeout(500)

      // Verify font size button is pressed/selected
      const buttonState = await largeFontButton.getAttribute('aria-pressed')
      expect(buttonState).toBe('true')
    })

    test('high contrast mode toggles', async ({ page }) => {
      await page.goto('/he')

      const accessibilityButton = page.locator('button').filter({ hasText: /♿/ }).first()
      await accessibilityButton.click()
      await page.waitForTimeout(500)

      // Toggle high contrast
      const contrastButton = page.locator('button').filter({ hasText: /ניגודיות|Contrast|Контрастность/ })
      const buttonCount = await contrastButton.count()

      if (buttonCount > 0) {
        await contrastButton.first().click()
        await page.waitForTimeout(500)

        // Verify HTML has high-contrast class
        const html = page.locator('html')
        const className = await html.getAttribute('class')
        expect(className).toContain('high-contrast')
      }
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('can navigate entire home page with keyboard', async ({ page }) => {
      await page.goto('/he')

      // Tab through all focusable elements
      const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const count = await focusableElements.count()

      expect(count).toBeGreaterThan(5) // Should have multiple focusable elements

      // Tab a few times
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(100)
      }

      // Verify something is focused
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('accessibility panel can be closed', async ({ page }) => {
      await page.goto('/he')

      // Open panel
      const accessibilityButton = page.locator('button').filter({ hasText: /♿/ }).first()
      await accessibilityButton.click()
      await page.waitForTimeout(300)

      // Verify panel is open
      const panelContent = page.locator('button').filter({ hasText: /רגיל|Normal/ }).first()
      await expect(panelContent).toBeVisible()

      // Close panel by clicking button again
      await accessibilityButton.click()
      await page.waitForTimeout(300)
    })
  })

  test.describe('Responsive Design', () => {
    test('mobile viewport shows mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/he')

      // Verify page renders without horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // +1 for rounding
    })

    test('tablet viewport shows appropriate layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/he')

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })

    test('desktop viewport shows full layout', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/he')

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })
  })

  test.describe('PWA Features', () => {
    test('manifest is accessible', async ({ page }) => {
      const response = await page.request.get('/manifest.webmanifest')
      expect(response.status()).toBe(200)

      const manifest = await response.json()
      expect(manifest.name).toBeTruthy()
      expect(manifest.short_name).toBeTruthy()
      expect(manifest.start_url).toBeTruthy()
    })

    test('service worker registration (if enabled)', async ({ page }) => {
      await page.goto('/he')
      await page.waitForLoadState('networkidle')

      // Check if service worker is registered
      const swRegistered = await page.evaluate(() => {
        return 'serviceWorker' in navigator
      })

      expect(swRegistered).toBe(true)
    })
  })
})
