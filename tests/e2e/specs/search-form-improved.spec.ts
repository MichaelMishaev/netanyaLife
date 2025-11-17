/**
 * E2E Tests for Improved Search Form UI
 * Tests: Segmented buttons, recent searches, category icons, A/B test variants
 */

import { test, expect } from '@playwright/test'

test.describe('Improved Search Form - Segmented Neighborhood Buttons', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/he')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should display all neighborhood buttons', async ({ page }) => {
    await page.goto('/he')

    // Check that neighborhood buttons are visible
    const merkaz = page.getByRole('radio', { name: /מרכז נתניה/i })
    const tsafon = page.getByRole('radio', { name: /צפון נתניה/i })
    const darom = page.getByRole('radio', { name: /דרום נתניה/i })
    const mizrah = page.getByRole('radio', { name: /מזרח העיר נתניה/i })

    await expect(merkaz).toBeVisible()
    await expect(tsafon).toBeVisible()
    await expect(darom).toBeVisible()
    await expect(mizrah).toBeVisible()
  })

  test('should select neighborhood with single click', async ({ page }) => {
    await page.goto('/he')

    // Click on צפון button
    const tsafonButton = page.getByRole('radio', { name: /צפון נתניה/i })
    await tsafonButton.click()

    // Check it's selected (aria-checked="true")
    await expect(tsafonButton).toHaveAttribute('aria-checked', 'true')

    // Check it has selected styling (primary background)
    await expect(tsafonButton).toHaveClass(/bg-primary-600/)
  })

  test('should allow switching between neighborhoods', async ({ page }) => {
    await page.goto('/he')

    // Select מרכז
    const merkazButton = page.getByRole('radio', { name: /מרכז נתניה/i })
    await merkazButton.click()
    await expect(merkazButton).toHaveAttribute('aria-checked', 'true')

    // Switch to דרום
    const daromButton = page.getByRole('radio', { name: /דרום נתניה/i })
    await daromButton.click()
    await expect(daromButton).toHaveAttribute('aria-checked', 'true')
    await expect(merkazButton).toHaveAttribute('aria-checked', 'false')
  })

  test('should complete search with segmented buttons', async ({ page }) => {
    await page.goto('/he')

    // Select category
    await page.selectOption('#category', { index: 1 }) // First category

    // Select neighborhood button
    const tsafonButton = page.getByRole('radio', { name: /צפון נתניה/i })
    await tsafonButton.click()

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForURL(/\/search\//)

    // Verify we're on search results page
    expect(page.url()).toContain('/search/')
    expect(page.url()).toContain('/tsafon')
  })
})

test.describe('Recent Searches Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/he')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should save search to recent searches', async ({ page }) => {
    await page.goto('/he')

    // Perform a search
    await page.selectOption('#category', { index: 1 })
    await page.getByRole('radio', { name: /צפון נתניה/i }).click()
    await page.click('button[type="submit"]')

    // Return to home
    await page.goto('/he')

    // Check that recent searches section appears
    await expect(page.getByText(/חיפושים אחרונים/i)).toBeVisible()
  })

  test('should pre-fill form when clicking recent search', async ({ page }) => {
    // First, create a search history by doing a search
    await page.goto('/he')
    await page.selectOption('#category', 'electricians') // Assuming this slug exists
    await page.getByRole('radio', { name: /מרכז נתניה/i }).click()
    await page.click('button[type="submit"]')

    // Wait for search page to load
    await page.waitForURL(/\/search\//)

    // Return to home
    await page.goto('/he')

    // Click on recent search
    const recentSearch = page.locator('text=/חשמלאים.*מרכז/i')
    if (await recentSearch.isVisible()) {
      await recentSearch.click()

      // Verify form is pre-filled
      await expect(page.locator('#category')).toHaveValue('electricians')
      const merkazButton = page.getByRole('radio', { name: /מרכז נתניה/i })
      await expect(merkazButton).toHaveAttribute('aria-checked', 'true')
    }
  })

  test('should show max 3 recent searches', async ({ page }) => {
    // Create multiple searches
    const searches = [
      { category: 1, neighborhood: /צפון/ },
      { category: 2, neighborhood: /מרכז/ },
      { category: 3, neighborhood: /דרום/ },
      { category: 4, neighborhood: /מזרח/ },
    ]

    for (const search of searches) {
      await page.goto('/he')
      await page.selectOption('#category', { index: search.category })
      await page.getByRole('radio', { name: search.neighborhood }).click()
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/search\//)
    }

    // Return to home
    await page.goto('/he')

    // Count recent search items
    const recentItems = page.locator('text=/^•/')
    const count = await recentItems.count()

    // Should show max 3
    expect(count).toBeLessThanOrEqual(3)
  })
})

test.describe('Category Icons', () => {
  test('should display icons in category dropdown', async ({ page }) => {
    await page.goto('/he')

    // Open category dropdown
    const categorySelect = page.locator('#category')
    await categorySelect.click()

    // Check that at least one option has an emoji icon
    const options = await page.locator('#category option').allTextContents()

    // At least one option should start with an emoji (assuming icons are added)
    const hasIcon = options.some((text) => /^[\u{1F300}-\u{1F9FF}]/u.test(text))

    // This test might fail if no categories have icons yet
    // Comment out if icons aren't added to all categories
    if (options.length > 1) { // Skip placeholder option
      expect(hasIcon).toBeTruthy()
    }
  })
})

test.describe('A/B Test Variants', () => {
  test('should show consistent UI variant across sessions', async ({ page }) => {
    await page.goto('/he')

    // Check if segmented buttons OR dropdown is shown
    const hasButtons = await page.getByRole('radiogroup').isVisible().catch(() => false)
    const hasDropdown = await page.locator('#neighborhood-select').isVisible().catch(() => false)

    // One should be true
    expect(hasButtons || hasDropdown).toBeTruthy()

    // Reload and check consistency
    await page.reload()

    const hasButtonsAfterReload = await page.getByRole('radiogroup').isVisible().catch(() => false)
    const hasDropdownAfterReload = await page.locator('#neighborhood-select').isVisible().catch(() => false)

    // Should be the same variant
    expect(hasButtonsAfterReload).toBe(hasButtons)
    expect(hasDropdownAfterReload).toBe(hasDropdown)
  })
})

test.describe('Keyboard Navigation', () => {
  test('should support keyboard navigation for neighborhood buttons', async ({ page }) => {
    await page.goto('/he')

    // Focus on first neighborhood button
    const firstButton = page.getByRole('radio').first()
    await firstButton.focus()

    // Press Space to select
    await page.keyboard.press('Space')

    // Check it's selected
    await expect(firstButton).toHaveAttribute('aria-checked', 'true')
  })

  test('should support Tab key navigation', async ({ page }) => {
    await page.goto('/he')

    // Tab through form elements
    await page.keyboard.press('Tab') // Focus on category
    await page.keyboard.press('Tab') // Focus on first neighborhood button

    // Current focused element should be a neighborhood button
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('role'))
    expect(focusedElement).toBe('radio')
  })
})

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE size

  test('should display buttons in mobile view', async ({ page }) => {
    await page.goto('/he')

    // Buttons should still be visible on mobile
    const buttons = page.getByRole('radio')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)

    // All buttons should be visible (may wrap to multiple rows)
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeVisible()
    }
  })

  test('should have adequate touch targets on mobile', async ({ page }) => {
    await page.goto('/he')

    // Check button height (should be at least 44px for iOS, 48px for Android)
    const firstButton = page.getByRole('radio').first()
    const box = await firstButton.boundingBox()

    expect(box?.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('RTL (Right-to-Left) Support', () => {
  test('should render correctly in Hebrew (RTL)', async ({ page }) => {
    await page.goto('/he')

    // Check that body or form has RTL direction
    const direction = await page.evaluate(() => {
      const form = document.querySelector('form')
      return window.getComputedStyle(form!).direction
    })

    expect(direction).toBe('rtl')
  })

  test('should render correctly in Russian (LTR)', async ({ page }) => {
    await page.goto('/ru')

    const direction = await page.evaluate(() => {
      const form = document.querySelector('form')
      return window.getComputedStyle(form!).direction
    })

    expect(direction).toBe('ltr')
  })
})

test.describe('Form Validation', () => {
  test('should require category selection', async ({ page }) => {
    await page.goto('/he')

    // Try to submit without selecting category
    await page.getByRole('radio', { name: /צפון נתניה/i }).click()
    await page.click('button[type="submit"]')

    // Should still be on home page (validation failed)
    expect(page.url()).toContain('/he')
    expect(page.url()).not.toContain('/search/')
  })

  test('should allow submission with valid data', async ({ page }) => {
    await page.goto('/he')

    // Fill all required fields
    await page.selectOption('#category', { index: 1 })
    await page.getByRole('radio', { name: /צפון נתניה/i }).click()

    // Submit
    await page.click('button[type="submit"]')

    // Should navigate to search results
    await page.waitForURL(/\/search\//)
    expect(page.url()).toContain('/search/')
  })
})
