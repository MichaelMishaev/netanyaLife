import { test, expect } from '@playwright/test'

test.describe('Category Request Feature', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies, cache, and service workers
    await context.clearCookies()

    // Clear browser cache completely
    await context.clearPermissions()

    // Goto page
    await page.goto('http://localhost:4700/he/add-business')

    // Unregister ALL service workers
    await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
    })

    // Force hard reload bypassing cache
    await page.evaluate(() => {
      window.location.reload()
    })

    await page.waitForLoadState('networkidle')
  })

  test('should open category request modal and submit successfully', async ({ page }) => {
    // Capture console logs and errors
    page.on('console', (msg) => console.log('BROWSER LOG:', msg.type(), msg.text()))
    page.on('pageerror', (error) => console.log('BROWSER ERROR:', error.message))

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Find and click the "Request New Category" button
    const requestButton = page.getByText('לא מצאת קטגוריה? בקש קטגוריה חדשה')
    await expect(requestButton).toBeVisible()

    console.log('🔵 About to click request button...')
    await requestButton.click()
    console.log('✅ Clicked request button')

    // Wait for modal to open
    await expect(page.getByText('בקשת קטגוריה חדשה')).toBeVisible()

    // Fill in the Hebrew category name (required field)
    await page.getByLabel('שם הקטגוריה בעברית').fill('שירותי מיזוג')

    // Fill in Russian category name (optional)
    await page.getByLabel('שם הקטגוריה ברוסית').fill('Услуги кондиционирования')

    // Fill in description (optional)
    await page.getByLabel('למה קטגוריה זו חשובה?').fill('חסרה קטגוריה למתקיני מזגנים')

    // Fill in business name (optional)
    await page.locator('input[name="businessName"]').fill('Test Business')

    // Fill in contact info (all optional)
    await page.locator('input[name="requesterName"]').fill('Test User')
    await page.locator('input[name="requesterEmail"]').fill('test@example.com')
    await page.locator('input[name="requesterPhone"]').fill('050-1234567')

    // Submit the form
    await page.getByRole('button', { name: 'שלח בקשה' }).click()

    // Wait for success message
    await expect(page.getByText('הבקשה נשלחה בהצלחה!')).toBeVisible({ timeout: 10000 })

    // Verify the success message details
    await expect(page.getByText('נבדוק את הבקשה ונעדכן אותך בהקדם')).toBeVisible()

    // Modal should close after 2 seconds
    await page.waitForTimeout(2500)
    await expect(page.getByText('בקשת קטגוריה חדשה')).not.toBeVisible()
  })

  test('should show validation error when Hebrew name is missing', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Click the request button
    await page.getByText('לא מצאת קטגוריה? בקש קטגוריה חדשה').click()

    // Wait for modal
    await expect(page.getByText('בקשת קטגוריה חדשה')).toBeVisible()

    // Try to submit without filling Hebrew name (required)
    await page.getByRole('button', { name: 'שלח בקשה' }).click()

    // Should see browser validation error (HTML5 required attribute)
    const hebrewNameInput = page.getByLabel('שם הקטגוריה בעברית')
    const isInvalid = await hebrewNameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should allow closing modal without submitting', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Click the request button
    await page.getByText('לא מצאת קטגוריה? בקש קטגוריה חדשה').click()

    // Modal should be visible
    await expect(page.getByText('בקשת קטגוריה חדשה')).toBeVisible()

    // Click the cancel button
    await page.getByRole('button', { name: 'ביטול' }).click()

    // Modal should close
    await expect(page.getByText('בקשת קטגוריה חדשה')).not.toBeVisible()
  })
})
