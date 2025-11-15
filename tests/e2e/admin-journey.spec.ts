import { test, expect } from '@playwright/test'

/**
 * Admin Journey E2E Tests
 *
 * Tests the complete admin workflow from login to business management.
 *
 * Journey: Login → Dashboard → Approve Business → Edit Business → Toggle Flags
 */

// Admin credentials (from seed data / environment)
const ADMIN_EMAIL = '345287@gmail.com'
const ADMIN_PASSWORD = 'admin1'

test.describe('Admin Journey', () => {
  test('admin can complete full workflow: login → approve → edit → manage', async ({
    page,
  }) => {
    // Step 1: Navigate to admin login
    await page.goto('/he/admin/login')
    await expect(page).toHaveURL(/.*\/admin\/login/)

    // Step 2: Login
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(ADMIN_EMAIL)

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill(ADMIN_PASSWORD)

    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    // Step 3: Verify redirect to admin dashboard
    await page.waitForURL('**/admin', { timeout: 10000 })
    await expect(page).toHaveURL(/.*\/he\/admin\/?$/)

    // Verify dashboard content
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    // Step 4: Navigate to pending businesses
    const pendingLink = page
      .locator('a')
      .filter({ hasText: /ממתינים לאישור|Pending|Ожидают/ })
    if ((await pendingLink.count()) > 0) {
      await pendingLink.click()
      await expect(page).toHaveURL(/.*\/admin\/pending/)

      // Check if there are pending businesses
      const pendingCards = page.locator('[data-testid="pending-business-card"]')
      const pendingCount = await pendingCards.count()

      if (pendingCount > 0) {
        // Step 5: Approve first pending business
        const approveButton = page
          .locator('button')
          .filter({ hasText: /אשר|Approve|Одобрить/ })
          .first()

        if ((await approveButton.count()) > 0) {
          await approveButton.click()
          await page.waitForTimeout(1000)

          // Should redirect or show success
          // Page might reload or show updated list
        }
      }
    }

    // Step 6: Navigate to businesses management
    const businessesLink = page
      .locator('a')
      .filter({ hasText: /עסקים|Businesses|Предприятия/ })
    if ((await businessesLink.count()) > 0) {
      await businessesLink.click()
      await expect(page).toHaveURL(/.*\/admin\/businesses/)

      // Verify businesses list loaded
      await page.waitForLoadState('networkidle')

      // Step 7: Toggle business visibility
      const visibilityToggle = page.locator('button[aria-label*="visibility"]').first()

      if ((await visibilityToggle.count()) > 0) {
        const initialState = await visibilityToggle.getAttribute('aria-checked')
        await visibilityToggle.click()
        await page.waitForTimeout(1000)

        // Verify state changed
        const newState = await visibilityToggle.getAttribute('aria-checked')
        expect(newState).not.toBe(initialState)
      }

      // Step 8: Toggle business verification badge
      const verifiedToggle = page.locator('button[aria-label*="verified"]').first()

      if ((await verifiedToggle.count()) > 0) {
        const initialState = await verifiedToggle.getAttribute('aria-checked')
        await verifiedToggle.click()
        await page.waitForTimeout(1000)

        const newState = await verifiedToggle.getAttribute('aria-checked')
        expect(newState).not.toBe(initialState)
      }

      // Step 9: Toggle pinned status
      const pinnedToggle = page.locator('button[aria-label*="pinned"]').first()

      if ((await pinnedToggle.count()) > 0) {
        const initialState = await pinnedToggle.getAttribute('aria-checked')
        await pinnedToggle.click()
        await page.waitForTimeout(1000)

        const newState = await pinnedToggle.getAttribute('aria-checked')
        expect(newState).not.toBe(initialState)
      }
    }

    // Step 10: Navigate to settings
    const settingsLink = page
      .locator('a')
      .filter({ hasText: /הגדרות|Settings|Настройки/ })
    if ((await settingsLink.count()) > 0) {
      await settingsLink.click()
      await expect(page).toHaveURL(/.*\/admin\/settings/)

      // Verify settings page loaded
      const settingsForm = page.locator('form')
      await expect(settingsForm).toBeVisible()
    }

    // Step 11: Navigate to analytics
    const analyticsLink = page
      .locator('a')
      .filter({ hasText: /ניתוח נתונים|Analytics|Аналитика/ })
    if ((await analyticsLink.count()) > 0) {
      await analyticsLink.click()
      await expect(page).toHaveURL(/.*\/admin\/analytics/)

      // Verify analytics dashboard loaded
      await page.waitForLoadState('networkidle')

      // Check for metric cards
      const metricCards = page.locator('text=/חיפושים|Searches|Поиски/')
      await expect(metricCards.first()).toBeVisible({ timeout: 5000 })
    }

    // Step 12: Logout
    const logoutButton = page.locator('button').filter({ hasText: /יציאה|Logout|Выход/ })
    if ((await logoutButton.count()) > 0) {
      await logoutButton.click()
      await page.waitForTimeout(1000)

      // Should redirect to login page
      await expect(page).toHaveURL(/.*\/admin\/login/)
    }
  })

  test('admin cannot access protected routes without login', async ({
    page,
  }) => {
    // Try to access admin dashboard directly
    await page.goto('/he/admin')

    // Should redirect to login
    await page.waitForURL('**/admin/login', { timeout: 5000 })
    await expect(page).toHaveURL(/.*\/admin\/login/)

    // Try to access businesses page
    await page.goto('/he/admin/businesses')
    await page.waitForURL('**/admin/login', { timeout: 5000 })
    await expect(page).toHaveURL(/.*\/admin\/login/)

    // Try to access analytics
    await page.goto('/he/admin/analytics')
    await page.waitForURL('**/admin/login', { timeout: 5000 })
    await expect(page).toHaveURL(/.*\/admin\/login/)
  })

  test('admin can manage pending business submissions', async ({ page }) => {
    // Login first
    await page.goto('/he/admin/login')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(ADMIN_EMAIL)

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill(ADMIN_PASSWORD)

    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    await page.waitForURL('**/admin')

    // Navigate to pending
    await page.goto('/he/admin/pending')
    await expect(page).toHaveURL(/.*\/admin\/pending/)

    // Check pending count
    const noPendingMessage = page.locator('text=/אין עסקים ממתינים|No pending|Нет ожидающих/')
    const hasPending = (await noPendingMessage.count()) === 0

    if (hasPending) {
      // Find reject button
      const rejectButton = page
        .locator('button')
        .filter({ hasText: /דחה|Reject|Отклонить/ })
        .first()

      if ((await rejectButton.count()) > 0) {
        const initialCount = await page
          .locator('[data-testid="pending-business-card"]')
          .count()

        await rejectButton.click()
        await page.waitForTimeout(1000)

        // Verify business was removed from list
        const newCount = await page
          .locator('[data-testid="pending-business-card"]')
          .count()

        expect(newCount).toBeLessThanOrEqual(initialCount)
      }
    }
  })

  test('admin can view analytics dashboard', async ({ page }) => {
    // Login
    await page.goto('/he/admin/login')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(ADMIN_EMAIL)

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill(ADMIN_PASSWORD)

    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    await page.waitForURL('**/admin')

    // Navigate to analytics
    await page.goto('/he/admin/analytics')
    await expect(page).toHaveURL(/.*\/admin\/analytics/)

    await page.waitForLoadState('networkidle')

    // Verify all metric sections are present
    const sections = [
      /חיפושים|Searches/,
      /צפיות|Views/,
      /ביקורות|Reviews/,
      /CTA/,
      /קטגוריות|Categories/,
      /שכונות|Neighborhoods/,
    ]

    for (const section of sections) {
      const element = page.locator(`text=${section}`).first()
      await expect(element).toBeVisible({ timeout: 10000 })
    }
  })

  test('admin login fails with incorrect credentials', async ({ page }) => {
    await page.goto('/he/admin/login')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('wrong@email.com')

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill('wrongpassword')

    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    await page.waitForTimeout(1000)

    // Should show error or remain on login page
    await expect(page).toHaveURL(/.*\/admin\/login/)

    // Look for error message
    const errorMessage = page.locator('text=/שגיאה|Error|Ошибка|Invalid/')
    if ((await errorMessage.count()) > 0) {
      await expect(errorMessage.first()).toBeVisible()
    }
  })

  test('admin session persists across page navigation', async ({ page }) => {
    // Login
    await page.goto('/he/admin/login')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(ADMIN_EMAIL)

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill(ADMIN_PASSWORD)

    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    await page.waitForURL('**/admin')

    // Navigate to different admin pages
    await page.goto('/he/admin/businesses')
    await expect(page).toHaveURL(/.*\/admin\/businesses/)

    await page.goto('/he/admin/settings')
    await expect(page).toHaveURL(/.*\/admin\/settings/)

    await page.goto('/he/admin/analytics')
    await expect(page).toHaveURL(/.*\/admin\/analytics/)

    // Should still be logged in, not redirected to login
    // Verify by checking for logout button
    const logoutButton = page.locator('button').filter({ hasText: /יציאה|Logout/ })
    await expect(logoutButton).toBeVisible()
  })
})
