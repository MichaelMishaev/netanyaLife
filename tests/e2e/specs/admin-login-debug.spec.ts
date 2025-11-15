import { test, expect } from '@playwright/test'

test.describe('Admin Login Debug', () => {
  test('should check for errors on admin login page', async ({ page }) => {
    const errors: string[] = []
    const warnings: string[] = []

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
      if (msg.type() === 'warning') {
        warnings.push(msg.text())
      }
    })

    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push(`Page error: ${error.message}`)
    })

    // Navigate to login page
    await page.goto('/he/admin/login')

    // Wait for network to be idle
    await page.waitForLoadState('networkidle')

    // Take a screenshot
    await page.screenshot({ path: 'test-results/admin-login-debug.png', fullPage: true })

    // Check if login form is visible
    const loginForm = page.locator('form')
    const isFormVisible = await loginForm.isVisible()

    // Get page title
    const title = await page.title()

    // Get main content
    const mainElements = await page.locator('main').count()

    console.log('=== DEBUG INFO ===')
    console.log('Page title:', title)
    console.log('Login form visible:', isFormVisible)
    console.log('Number of <main> elements:', mainElements)
    console.log('\n=== ERRORS ===')
    errors.forEach((error, i) => console.log(`${i + 1}. ${error}`))
    console.log('\n=== WARNINGS ===')
    warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning}`))

    // Fail the test if there are errors
    if (errors.length > 0) {
      throw new Error(`Found ${errors.length} errors on admin login page`)
    }
  })
})
