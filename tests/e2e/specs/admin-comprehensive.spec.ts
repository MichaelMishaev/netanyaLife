import { test, expect } from '@playwright/test'

test.describe('Admin Panel Comprehensive Test', () => {
  test('should test all admin pages for errors', async ({ page }) => {
    const errors: string[] = []

    // Capture all console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`[${msg.location().url}] ${msg.text()}`)
      }
    })

    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push(`Page error: ${error.message}`)
    })

    // Test 1: Login page
    console.log('Testing login page...')
    await page.goto('/he/admin/login')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/admin-login.png' })

    // Test 2: Try to access dashboard without login (should redirect)
    console.log('Testing dashboard redirect...')
    await page.goto('/he/admin')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/login')

    // Test 3: Login with valid credentials
    console.log('Logging in...')
    await page.goto('/he/admin/login')
    await page.waitForLoadState('networkidle')

    await page.locator('input[name="email"]').fill('345287@gmail.com')
    await page.locator('input[name="password"]').fill('admin1')
    await page.locator('button[type="submit"]').click()

    // Wait for redirect to dashboard
    await page.waitForURL('**/he/admin', { timeout: 10000 })
    await page.screenshot({ path: 'test-results/admin-dashboard.png' })

    // Test 4: Check dashboard loads
    console.log('Testing dashboard...')
    await page.waitForLoadState('networkidle')
    const dashboardTitle = page.locator('h1')
    await expect(dashboardTitle).toBeVisible()

    // Test 5: Navigate to pending businesses
    console.log('Testing pending page...')
    await page.goto('/he/admin/pending')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/admin-pending.png' })

    // Test 6: Navigate to businesses management
    console.log('Testing businesses page...')
    await page.goto('/he/admin/businesses')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/admin-businesses.png' })

    // Test 7: Navigate to settings
    console.log('Testing settings page...')
    await page.goto('/he/admin/settings')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/admin-settings.png' })

    // Print all errors
    console.log('\n=== ERRORS FOUND ===')
    if (errors.length === 0) {
      console.log('No errors found!')
    } else {
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`)
      })
    }

    // Fail if there are errors
    if (errors.length > 0) {
      throw new Error(`Found ${errors.length} errors in admin panel`)
    }
  })
})
