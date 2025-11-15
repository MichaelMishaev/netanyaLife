import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load Hebrew homepage successfully', async ({ page }) => {
    await page.goto('/he')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the page loaded without errors
    expect(page.url()).toContain('/he')

    // Check for main content
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should load Russian homepage successfully', async ({ page }) => {
    await page.goto('/ru')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the page loaded without errors
    expect(page.url()).toContain('/ru')

    // Check for main content
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have correct RTL direction for Hebrew', async ({ page }) => {
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Check HTML dir attribute
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
    await expect(html).toHaveAttribute('lang', 'he')
  })

  test('should have correct LTR direction for Russian', async ({ page }) => {
    await page.goto('/ru')
    await page.waitForLoadState('networkidle')

    // Check HTML dir attribute
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'ltr')
    await expect(html).toHaveAttribute('lang', 'ru')
  })
})
