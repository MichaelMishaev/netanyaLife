import { test, expect } from '@playwright/test'

test.describe('Add Business Page', () => {
  test('should load add-business page without errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Listen for page errors
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error)
    })

    // Navigate to add-business page
    await page.goto('/he/add-business')
    await page.waitForLoadState('networkidle')

    // Check that the page loaded successfully
    expect(page.url()).toContain('/he/add-business')

    // Check for form elements
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Check for name input
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toBeVisible()

    // Check for category select
    const categorySelect = page.locator('select[name="categoryId"]')
    await expect(categorySelect).toBeVisible()

    // Check for neighborhood select
    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await expect(neighborhoodSelect).toBeVisible()

    // Verify no DOM errors occurred
    expect(pageErrors).toHaveLength(0)

    // Filter out expected warnings and check for actual errors
    const actualErrors = consoleErrors.filter(
      (error) => !error.includes('Download the React DevTools')
    )
    expect(actualErrors).toHaveLength(0)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/he/add-business')
    await page.waitForLoadState('networkidle')

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Check that browser validation prevents submission
    // (The form has required fields that should prevent submission)
    const nameInput = page.locator('input[name="name"]')
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should show only one main element in DOM', async ({ page }) => {
    await page.goto('/he/add-business')
    await page.waitForLoadState('networkidle')

    // Count main elements
    const mainElements = page.locator('main')
    const count = await mainElements.count()

    // Should only have exactly 1 main element (from layout)
    expect(count).toBe(1)
  })
})
