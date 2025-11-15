import { test, expect } from '@playwright/test'

test.describe('Admin Login Flow', () => {
  test('should successfully login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/he/admin/login')
    await page.waitForLoadState('networkidle')

    // Check login form is visible
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    // Fill in credentials (from docs/sysAnal.md: email = "345287@gmail.com", password = "admin1")
    await emailInput.fill('345287@gmail.com')
    await passwordInput.fill('admin1')

    // Submit the form
    await submitButton.click()

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/he/admin', { timeout: 10000 })

    // Check we're on the admin dashboard
    expect(page.url()).toContain('/he/admin')
    expect(page.url()).not.toContain('/login')

    // Check for admin dashboard content
    const dashboardTitle = page.locator('h1')
    await expect(dashboardTitle).toContainText('לוח בקרה')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/he/admin/login')
    await page.waitForLoadState('networkidle')

    // Fill in invalid credentials
    await page.locator('input[name="email"]').fill('wrong@example.com')
    await page.locator('input[name="password"]').fill('wrongpassword')

    // Submit the form
    await page.locator('button[type="submit"]').click()

    // Wait a bit for the error to appear
    await page.waitForTimeout(1000)

    // Should show error message and stay on login page
    expect(page.url()).toContain('/login')

    // Check for error message
    const errorMessage = page.locator('[role="alert"]')
    await expect(errorMessage).toBeVisible()
  })

  test('should redirect to login when accessing admin without auth', async ({ page }) => {
    // Try to access admin dashboard directly without logging in
    await page.goto('/he/admin')

    // Should redirect to login page
    await page.waitForURL('**/he/admin/login', { timeout: 5000 })
    expect(page.url()).toContain('/admin/login')
  })
})
