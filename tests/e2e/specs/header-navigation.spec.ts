import { test, expect } from '@playwright/test'

test.describe('Header Navigation', () => {
  test('should display admin button in Hebrew', async ({ page }) => {
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Check admin button exists
    const adminLink = page.locator('a[href="/he/admin"]')
    await expect(adminLink).toBeVisible()

    // Check text on desktop
    const adminText = await adminLink.locator('span.hidden.sm\\:inline').textContent()
    expect(adminText).toBe('ניהול')
  })

  test('should display admin button in Russian', async ({ page }) => {
    await page.goto('/ru')
    await page.waitForLoadState('networkidle')

    // Check admin button exists
    const adminLink = page.locator('a[href="/ru/admin"]')
    await expect(adminLink).toBeVisible()

    // Check text on desktop
    const adminText = await adminLink.locator('span.hidden.sm\\:inline').textContent()
    expect(adminText).toBe('Управление')
  })

  test('should navigate to admin panel when clicked', async ({ page }) => {
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Click admin button
    const adminLink = page.locator('a[href="/he/admin"]')
    await adminLink.click()

    // Should redirect to login page (not logged in)
    await page.waitForURL('**/he/admin/login')
    expect(page.url()).toContain('/he/admin/login')
  })

  test('should have all navigation elements', async ({ page }) => {
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Check home link
    const homeLink = page.locator('a[href="/he"]').first()
    await expect(homeLink).toBeVisible()

    // Check add business link
    const addBusinessLink = page.locator('a[href="/he/add-business"]')
    await expect(addBusinessLink).toBeVisible()

    // Check admin link
    const adminLink = page.locator('a[href="/he/admin"]')
    await expect(adminLink).toBeVisible()

    // Check language switcher
    const langSwitcher = page.locator('button[aria-label*="Russian"], button[aria-label*="Русский"]')
    await expect(langSwitcher).toBeVisible()
  })

  test('should have responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Admin button should show emoji on mobile
    const adminLink = page.locator('a[href="/he/admin"]')
    await expect(adminLink).toBeVisible()

    // Mobile emoji should be visible
    const mobileIcon = adminLink.locator('span.sm\\:hidden')
    await expect(mobileIcon).toBeVisible()
    const iconText = await mobileIcon.textContent()
    expect(iconText).toBe('⚙️')
  })
})
