import { test, expect } from '@playwright/test'

test.describe('Admin Login Stability Test', () => {
  test('should remain stable for 10 seconds without webpack errors', async ({ page }) => {
    const errors: string[] = []
    const warnings: string[] = []

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`[${new Date().toISOString()}] ${msg.text()}`)
      }
      if (msg.type() === 'warning') {
        warnings.push(msg.text())
      }
    })

    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push(`[${new Date().toISOString()}] Page error: ${error.message}\n${error.stack}`)
    })

    console.log('Loading login page...')
    await page.goto('/he/admin/login')
    await page.waitForLoadState('networkidle')

    console.log('Page loaded. Waiting 10 seconds to check for delayed errors...')

    // Wait 10 seconds to see if any webpack/HMR errors appear
    await page.waitForTimeout(10000)

    // Check if login form is still visible
    const loginForm = page.locator('form')
    await expect(loginForm).toBeVisible()

    // Take final screenshot
    await page.screenshot({ path: 'test-results/admin-login-stable.png', fullPage: true })

    // Print results
    console.log('\n=== STABILITY TEST RESULTS ===')
    console.log(`Duration: 10 seconds`)
    console.log(`Errors found: ${errors.length}`)
    console.log(`Warnings found: ${warnings.length}`)
    console.log(`Login form still visible: true`)

    if (errors.length > 0) {
      console.log('\n=== ERRORS ===')
      errors.forEach((error, i) => console.log(`${i + 1}. ${error}`))
    }

    // Fail if there are errors
    if (errors.length > 0) {
      throw new Error(`Found ${errors.length} errors during 10-second stability test`)
    }

    console.log('\n✅ Page remained stable for 10 seconds with no errors!')
  })
})
