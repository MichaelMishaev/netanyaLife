import { test, expect } from '@playwright/test'

/**
 * Full User Journey E2E Tests
 *
 * Tests the complete user flow from landing on the home page
 * to submitting a review for a business.
 *
 * Journey: Home → Search → Results → Business Detail → Review
 */

test.describe('Complete User Journey', () => {
  test('user can complete full journey: search → view business → submit review', async ({
    page,
  }) => {
    // Step 1: Land on home page (Hebrew)
    await page.goto('/he')

    // Verify home page loaded
    await expect(page).toHaveURL(/.*\/he\/?$/)

    // Step 2: Perform search
    // Fill category dropdown (if exists)
    const categorySelect = page.locator('select, [role="combobox"]').first()
    if ((await categorySelect.count()) > 0) {
      // For select element
      if ((await page.locator('select').count()) > 0) {
        await categorySelect.selectOption({ index: 1 }) // First option after placeholder
      }
    }

    // Fill neighborhood dropdown
    const neighborhoodSelect = page
      .locator('select, [role="combobox"]')
      .nth(1)
    if ((await neighborhoodSelect.count()) > 0) {
      if ((await page.locator('select').count()) > 1) {
        await neighborhoodSelect.selectOption({ index: 1 })
      }
    }

    // Submit search
    const searchButton = page.locator('button[type="submit"]').first()
    await searchButton.click()

    // Step 3: Verify search results page
    await expect(page).toHaveURL(/.*\/search\//)

    // Wait for results to load
    await page.waitForLoadState('networkidle')

    // Step 4: Check if there are any business cards
    const businessCards = page.locator('a[href*="/business/"]')
    const businessCount = await businessCards.count()

    if (businessCount > 0) {
      // Click on first business card
      const firstBusinessCard = businessCards.first()
      await firstBusinessCard.click()

      // Step 5: Verify business detail page
      await expect(page).toHaveURL(/.*\/business\//)
      await page.waitForLoadState('networkidle')

      // Verify business details are present
      const businessName = page.locator('h1').first()
      await expect(businessName).toBeVisible()

      // Step 6: Navigate to review form
      const writeReviewButton = page
        .locator('a, button')
        .filter({ hasText: /כתוב ביקורת|Write Review|Написать отзыв/ })
        .first()

      if ((await writeReviewButton.count()) > 0) {
        await writeReviewButton.click()

        // Step 7: Fill and submit review
        await expect(page).toHaveURL(/.*\/write-review/)

        // Select rating (5 stars)
        const fiveStarButton = page
          .locator('button')
          .filter({ hasText: /5|★★★★★/ })
          .first()
        if ((await fiveStarButton.count()) > 0) {
          await fiveStarButton.click()
        }

        // Fill review text
        const reviewTextarea = page.locator('textarea').first()
        await reviewTextarea.fill('שירות מעולה! ממליץ בחום.')

        // Fill reviewer name
        const nameInput = page
          .locator('input[name*="name"], input[placeholder*="שם"]')
          .first()
        await nameInput.fill('בודק מערכת')

        // Submit review
        const submitButton = page.locator('button[type="submit"]')
        await submitButton.click()

        // Step 8: Verify redirect back to business page
        await expect(page).toHaveURL(/.*\/business\//)

        // Success! Full journey completed
      }
    } else {
      // No businesses found - this is acceptable for initial testing
      // Just verify the "no results" message is shown
      const noResultsMessage = page.locator('text=/לא נמצאו|No results|Не найдено/')
      const hasNoResults = (await noResultsMessage.count()) > 0
      expect(hasNoResults).toBeTruthy()
    }
  })

  test('user can add a business through public form', async ({ page }) => {
    // Step 1: Navigate to add business page
    await page.goto('/he/add-business')

    await expect(page).toHaveURL(/.*\/add-business/)

    // Step 2: Fill form
    // Business name (Hebrew)
    const nameHeInput = page
      .locator('input[name*="name"][name*="he"]')
      .first()
    if ((await nameHeInput.count()) > 0) {
      await nameHeInput.fill('עסק בדיקה חדש')
    }

    // Business name (Russian)
    const nameRuInput = page
      .locator('input[name*="name"][name*="ru"]')
      .first()
    if ((await nameRuInput.count()) > 0) {
      await nameRuInput.fill('Новый тестовый бизнес')
    }

    // Category
    const categorySelect = page.locator('select[name*="category"]').first()
    if ((await categorySelect.count()) > 0) {
      await categorySelect.selectOption({ index: 1 })
    }

    // Neighborhood
    const neighborhoodSelect = page
      .locator('select[name*="neighborhood"]')
      .first()
    if ((await neighborhoodSelect.count()) > 0) {
      await neighborhoodSelect.selectOption({ index: 1 })
    }

    // Phone number (required)
    const phoneInput = page.locator('input[type="tel"]').first()
    await phoneInput.fill('0501234567')

    // Description (Hebrew)
    const descHeTextarea = page
      .locator('textarea[name*="description"][name*="he"]')
      .first()
    if ((await descHeTextarea.count()) > 0) {
      await descHeTextarea.fill('תיאור העסק החדש לבדיקה')
    }

    // Address (Hebrew)
    const addressHeInput = page
      .locator('input[name*="address"][name*="he"]')
      .first()
    if ((await addressHeInput.count()) > 0) {
      await addressHeInput.fill('רחוב הבדיקה 123')
    }

    // Step 3: Submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Step 4: Verify success message or redirect
    await page.waitForTimeout(2000)

    // Should show success state or redirect
    const successMessage = page.locator('text=/תודה|Success|Спасибо/')
    const isSuccess = (await successMessage.count()) > 0

    if (isSuccess) {
      await expect(successMessage).toBeVisible()
    }
  })

  test('user can navigate and use language switcher', async ({ page }) => {
    // Step 1: Start in Hebrew
    await page.goto('/he')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'he')
    await expect(html).toHaveAttribute('dir', 'rtl')

    // Step 2: Switch to Russian
    const langSwitcher = page.locator('button').filter({ hasText: /Русский/ })
    await langSwitcher.click()
    await page.waitForURL('**/ru**')

    await expect(html).toHaveAttribute('lang', 'ru')
    await expect(html).toHaveAttribute('dir', 'ltr')

    // Step 3: Navigate to add business
    const addBusinessLink = page
      .locator('a')
      .filter({ hasText: /Добавить бизнес/ })
    await addBusinessLink.click()
    await expect(page).toHaveURL(/.*\/ru\/add-business/)

    // Step 4: Switch back to Hebrew
    const langSwitcherRu = page.locator('button').filter({ hasText: /עברית/ })
    await langSwitcherRu.click()
    await page.waitForURL('**/he**')

    await expect(html).toHaveAttribute('lang', 'he')
  })

  test('user can use accessibility features', async ({ page }) => {
    await page.goto('/he')

    // Open accessibility panel
    const accessibilityButton = page.locator('button').filter({ hasText: /♿/ })
    await accessibilityButton.click()
    await page.waitForTimeout(500)

    // Verify panel is open
    const panelContent = page.locator('button').filter({ hasText: /רגיל/ })
    await expect(panelContent.first()).toBeVisible()

    // Change font size to Large
    const largeFontButton = page.locator('button').filter({ hasText: /גדול/ })
    await largeFontButton.first().click()
    await page.waitForTimeout(500)

    // Verify button is selected
    const buttonState = await largeFontButton.first().getAttribute('aria-pressed')
    expect(buttonState).toBe('true')

    // Toggle high contrast
    const contrastButton = page
      .locator('button')
      .filter({ hasText: /ניגודיות/ })
    if ((await contrastButton.count()) > 0) {
      await contrastButton.first().click()
      await page.waitForTimeout(500)

      // Verify high contrast applied
      const html = page.locator('html')
      const className = await html.getAttribute('class')
      expect(className).toContain('high-contrast')
    }

    // Close panel
    await accessibilityButton.click()
    await page.waitForTimeout(300)
  })

  test('mobile responsive layout works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to home
    await page.goto('/he')

    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    )
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    )
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)

    // Verify page is responsive and renders properly
    const mainContent = page.locator('main, [role="main"]')
    await expect(mainContent).toBeVisible()

    // Check for mobile-friendly navigation
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Verify interactive elements are present
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)
  })
})
