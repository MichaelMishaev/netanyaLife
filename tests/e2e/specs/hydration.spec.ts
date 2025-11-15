import { test, expect } from '@playwright/test'

test.describe('Hydration and React Errors', () => {
  test('should not have hydration errors on add-business page', async ({ page }) => {
    const consoleErrors: string[] = []
    const pageErrors: Error[] = []

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Capture page errors
    page.on('pageerror', (error) => {
      pageErrors.push(error)
    })

    // Navigate to the page
    await page.goto('/he/add-business')
    await page.waitForLoadState('networkidle')

    // Wait a bit for any hydration errors to surface
    await page.waitForTimeout(1000)

    // Filter out known non-critical warnings
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('Download the React DevTools') &&
        !error.includes('webpack-dev-server')
    )

    // Check for specific hydration-related errors
    const hydrationErrors = criticalErrors.filter(
      (error) =>
        error.includes('removeChild') ||
        error.includes('Hydration') ||
        error.includes('suspended thenable')
    )

    // Assert no page errors
    expect(pageErrors).toHaveLength(0)

    // Assert no hydration errors
    expect(hydrationErrors).toHaveLength(0)

    // Assert no critical console errors
    expect(criticalErrors).toHaveLength(0)
  })

  test('should not have hydration errors on home page', async ({ page }) => {
    const consoleErrors: string[] = []
    const pageErrors: Error[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      pageErrors.push(error)
    })

    await page.goto('/he')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('Download the React DevTools') &&
        !error.includes('webpack-dev-server')
    )

    const hydrationErrors = criticalErrors.filter(
      (error) =>
        error.includes('removeChild') ||
        error.includes('Hydration') ||
        error.includes('suspended thenable')
    )

    expect(pageErrors).toHaveLength(0)
    expect(hydrationErrors).toHaveLength(0)
    expect(criticalErrors).toHaveLength(0)
  })

  test('accessibility settings should work without errors', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Click accessibility button
    const accessibilityButton = page.locator('button[aria-label="נגישות"]')
    await accessibilityButton.click()

    // Wait for panel to open
    await page.waitForTimeout(500)

    // Check no errors occurred
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('Download the React DevTools') &&
        !error.includes('webpack-dev-server')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})
