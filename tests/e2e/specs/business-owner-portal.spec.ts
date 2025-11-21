import { test, expect } from '@playwright/test'

test.describe('Business Owner Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to business owner login page
    await page.goto('http://localhost:4700/he/business-login')
  })

  test('Step 1: Business owner login page loads correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('כניסה לבעלי עסקים')

    // Check subtitle
    await expect(page.getByText('נהל את העסק שלך')).toBeVisible()

    // Check email and password fields exist
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Check login button exists
    await expect(page.getByRole('button', { name: /התחבר/i })).toBeVisible()

    // Check toggle to register link
    await expect(page.getByText('אין לך חשבון?')).toBeVisible()
  })

  test('Step 2: Toggle between login and register modes', async ({ page }) => {
    // Initially in login mode
    await expect(page.getByRole('button', { name: /התחבר/i })).toBeVisible()
    await expect(page.locator('input[name="name"]')).not.toBeVisible()

    // Click to switch to register mode
    await page.getByText('אין לך חשבון?').click()

    // Should show register button and name field
    await expect(page.getByRole('button', { name: /הרשם/i })).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()

    // Check "already have account" link
    await expect(page.getByText('כבר יש לך חשבון?')).toBeVisible()

    // Switch back to login
    await page.getByText('כבר יש לך חשבון?').click()
    await expect(page.getByRole('button', { name: /התחבר/i })).toBeVisible()
  })

  test('Step 3: Google OAuth button redirects correctly', async ({ page }) => {
    const googleButton = page.locator('a[href="/api/auth/owner/google"]')
    await expect(googleButton).toBeVisible()

    // Check button contains Google icon
    const googleIcon = googleButton.locator('svg')
    await expect(googleIcon).toBeVisible()

    // Check button text
    await expect(googleButton).toContainText('התחבר עם Google')

    // Check redirect (don't follow, just verify URL)
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/owner/google'),
      { timeout: 5000 }
    )

    await googleButton.click()
    const response = await responsePromise

    // Should redirect to Google OAuth
    expect(response.status()).toBe(307)
    const location = response.headers()['location']
    expect(location).toContain('accounts.google.com/o/oauth2/v2/auth')
  })

  test('Step 4: Email/password registration validation', async ({ page }) => {
    // Switch to register mode
    await page.getByText('אין לך חשבון?').click()

    // Try to submit without filling fields
    await page.getByRole('button', { name: /הרשם/i }).click()

    // Browser validation should prevent submission (required fields)
    // Check fields are marked as required
    const nameInput = page.locator('input[name="name"]')
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')

    await expect(nameInput).toHaveAttribute('required', '')
    await expect(emailInput).toHaveAttribute('required', '')
    await expect(passwordInput).toHaveAttribute('required', '')

    // Check password min length
    await expect(passwordInput).toHaveAttribute('minlength', '8')
  })

  test('Step 5: Login form validation', async ({ page }) => {
    // Check required fields
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')

    await expect(emailInput).toHaveAttribute('required', '')
    await expect(passwordInput).toHaveAttribute('required', '')

    // Check email type
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('Step 6: OAuth error handling', async ({ page }) => {
    // Simulate OAuth error by navigating with error parameter
    await page.goto('http://localhost:4700/he/business-login?error=access_denied')

    // Should show error message (use first role=alert which is the error box, not next route announcer)
    const errorAlert = page.locator('[role="alert"]:has-text("ההתחברות")')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toContainText('ההתחברות בוטלה')
  })

  test('Step 7: Russian locale shows correct text', async ({ page }) => {
    await page.goto('http://localhost:4700/ru/business-login')

    // Check Russian title
    await expect(page.locator('h1')).toContainText('Вход для владельцев бизнеса')

    // Check Google button text
    const googleButton = page.locator('a[href="/api/auth/owner/google"]')
    await expect(googleButton).toContainText('Войти через Google')

    // Check divider
    await expect(page.getByText('или')).toBeVisible()

    // Check toggle links
    await expect(page.getByText('Нет аккаунта?')).toBeVisible()
  })

  test('Step 8: Protected portal route redirects unauthenticated users', async ({
    page,
  }) => {
    // Try to access business portal without authentication
    await page.goto('http://localhost:4700/he/business-portal')

    // Should redirect to login page
    await page.waitForURL(/business-login/)
    expect(page.url()).toContain('/he/business-login')
  })

  test('Step 9: Divider is visible', async ({ page }) => {
    // Check divider with "או" exists (use more specific selector to avoid footer text)
    const divider = page.locator('.relative .bg-white.px-2.text-gray-500', { hasText: 'או' })
    await expect(divider).toBeVisible()

    // Check divider has proper styling (border line)
    const dividerLine = page.locator('.border-t.border-gray-300')
    await expect(dividerLine).toBeVisible()
  })

  test('Step 10: Form inputs have correct attributes', async ({ page }) => {
    // Email input
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('autocomplete', 'email')
    await expect(emailInput).toHaveAttribute('dir', 'ltr')

    // Password input
    const passwordInput = page.locator('input[name="password"]')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
    await expect(passwordInput).toHaveAttribute('dir', 'ltr')

    // Switch to register and check name field
    await page.getByText('אין לך חשבון?').click()
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toHaveAttribute('type', 'text')
    await expect(nameInput).toHaveAttribute('autocomplete', 'name')
    await expect(nameInput).toHaveAttribute('dir', 'ltr')
  })
})

test.describe('Business Owner Dashboard (with mock session)', () => {
  // Note: These tests would require setting up a mock session
  // For now, we're just testing the page structure without authentication

  test('Dashboard page structure', async ({ page }) => {
    // This test would fail without authentication
    // But we can document what should be tested:

    // TODO: Set up authentication helper for tests
    // 1. Dashboard should show welcome message with owner name
    // 2. Should display list of owned businesses
    // 3. Each business card should show:
    //    - Business name
    //    - Category and neighborhood
    //    - Review count and rating
    //    - Visibility status
    //    - Edit and View buttons
    // 4. Should show "Add Business" button
    // 5. Empty state should show when no businesses
    // 6. Logout button should be visible in nav

    // For now, just verify redirect happens
    await page.goto('http://localhost:4700/he/business-portal')
    await expect(page).toHaveURL(/business-login/)
  })
})
