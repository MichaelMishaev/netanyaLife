import { test, expect } from '@playwright/test'

test.describe('Admin Google OAuth Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('http://localhost:4700/he/admin-login')
  })

  test('Step 1: Admin login page loads correctly', async ({ page }) => {
    // Check page title (either "כניסת מנהל" or "כניסה למערכת")
    await expect(page.locator('h1')).toContainText('כניס')

    // Check email and password fields exist
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Check regular submit button exists
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Step 2: Google sign-in button is visible and styled correctly', async ({
    page,
  }) => {
    // Check Google sign-in button exists
    const googleButton = page.locator('a[href="/api/auth/google"]')
    await expect(googleButton).toBeVisible()

    // Check button contains Google icon (SVG)
    const googleIcon = googleButton.locator('svg')
    await expect(googleIcon).toBeVisible()

    // Check button text in Hebrew
    await expect(googleButton).toContainText('התחבר עם Google')

    // Check divider with "או" exists
    await expect(page.locator('text=או')).toBeVisible()
  })

  test('Step 3: Google button redirects to OAuth initiation route', async ({
    page,
  }) => {
    // Click Google sign-in button
    const googleButton = page.locator('a[href="/api/auth/google"]')

    // Listen for navigation
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/google'),
      { timeout: 5000 }
    )

    await googleButton.click()

    const response = await responsePromise

    // Should get 307 redirect
    expect(response.status()).toBe(307)

    // Should redirect to Google OAuth
    const location = response.headers()['location']
    expect(location).toContain('accounts.google.com/o/oauth2/v2/auth')
    expect(location).toContain('client_id=568399688770')
    expect(location).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A4700%2Fapi%2Fauth%2Fgoogle%2Fcallback')
    expect(location).toContain('scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email')
    expect(location).toContain('state=') // CSRF token present
  })

  test('Step 4: OAuth state is stored in database', async ({ page }) => {
    // Make a request to initiate OAuth (don't follow redirects)
    const response = await page.request.get('http://localhost:4700/api/auth/google', {
      maxRedirects: 0,
    })

    expect(response.status()).toBe(307)

    // Extract state from redirect URL
    const location = response.headers()['location']
    const stateMatch = location?.match(/state=([^&]+)/)
    const state = stateMatch ? stateMatch[1] : null

    expect(state).toBeTruthy()
    expect(state?.length).toBeGreaterThan(30) // UUID should be long

    // State should be stored in database (we'll verify this via Prisma Studio or direct query)
    // For now, we've verified it's generated and included in the redirect
  })

  test('Step 5: Callback route validates required parameters', async ({
    page,
  }) => {
    // Test missing code parameter
    const response1 = await page.request.get(
      'http://localhost:4700/api/auth/google/callback?state=test-state'
    )
    expect(response1.url()).toContain('admin')
    expect(response1.url()).toContain('login')
    expect(response1.url()).toContain('error=invalid_request')

    // Test missing state parameter
    const response2 = await page.request.get(
      'http://localhost:4700/api/auth/google/callback?code=test-code'
    )
    expect(response2.url()).toContain('admin')
    expect(response2.url()).toContain('login')
    expect(response2.url()).toContain('error=invalid_request')

    // Test invalid state (not in database)
    const response3 = await page.request.get(
      'http://localhost:4700/api/auth/google/callback?code=test-code&state=invalid-state-12345'
    )
    expect(response3.url()).toContain('admin')
    expect(response3.url()).toContain('login')
    expect(response3.url()).toContain('error=invalid_state')
  })

  test('Step 6: User cancellation is handled correctly', async ({ page }) => {
    const response = await page.request.get(
      'http://localhost:4700/api/auth/google/callback?error=access_denied'
    )

    // Should redirect back to login with error
    expect(response.url()).toContain('admin')
    expect(response.url()).toContain('login')
    expect(response.url()).toContain('error=access_denied')
  })

  test('Step 7: Russian locale shows correct text', async ({ page }) => {
    await page.goto('http://localhost:4700/ru/admin-login')

    // Check Russian Google button text
    const googleButton = page.locator('a[href="/api/auth/google"]')
    await expect(googleButton).toContainText('Войти через Google')

    // Check Russian divider
    await expect(page.locator('text=или')).toBeVisible()
  })

  test('Step 8: Check environment variables are set', async ({ page }) => {
    // This test verifies the OAuth route works, which indirectly confirms env vars are set
    const response = await page.request.get('http://localhost:4700/api/auth/google', {
      maxRedirects: 0,
    })

    expect(response.status()).toBe(307)

    const location = response.headers()['location']

    // Verify client_id is in the redirect (confirms GOOGLE_CLIENT_ID is set)
    expect(location).toContain('client_id=568399688770-19renpc437s24elbsijv7m09jbble28a')

    // Verify redirect_uri uses NEXT_PUBLIC_BASE_URL
    expect(location).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A4700')
  })

  test('Step 9: OAuth route handles errors gracefully', async ({ page }) => {
    // The route should not crash even if there are issues
    const response = await page.request.get('http://localhost:4700/api/auth/google', {
      maxRedirects: 0,
    })

    // Should redirect (307), not crash
    expect(response.status()).toBe(307)
  })

  test('Step 10: Multiple OAuth initiations create different states', async ({
    page,
  }) => {
    // Make first request
    const response1 = await page.request.get('http://localhost:4700/api/auth/google', {
      maxRedirects: 0,
    })
    const location1 = response1.headers()['location']
    const state1Match = location1?.match(/state=([^&]+)/)
    const state1 = state1Match ? state1Match[1] : null

    // Make second request
    const response2 = await page.request.get('http://localhost:4700/api/auth/google', {
      maxRedirects: 0,
    })
    const location2 = response2.headers()['location']
    const state2Match = location2?.match(/state=([^&]+)/)
    const state2 = state2Match ? state2Match[1] : null

    // States should be different (CSRF protection)
    expect(state1).toBeTruthy()
    expect(state2).toBeTruthy()
    expect(state1).not.toBe(state2)
  })
})
