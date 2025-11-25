import { test, expect } from '@playwright/test'

test.describe('Business Owner Logout', () => {
  test('Step 1: Logout redirects to Hebrew home page when logged in from Hebrew portal', async ({
    page,
  }) => {
    // Directly test the logout API endpoint with Hebrew referer
    const response = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/he/business-portal',
        },
      }
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.redirect).toBe('/he')
  })

  test('Step 2: Logout redirects to Russian home page when logged in from Russian portal', async ({
    page,
  }) => {
    // Directly test the logout API endpoint with Russian referer
    const response = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/ru/business-portal',
        },
      }
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.redirect).toBe('/ru')
  })

  test('Step 3: Logout defaults to Hebrew when referer is missing', async ({
    page,
  }) => {
    // Test without referer header
    const response = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {},
      }
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.redirect).toBe('/he')
  })

  test('Step 4: Logout defaults to Hebrew for non-Russian referers', async ({
    page,
  }) => {
    // Test with English referer (should default to Hebrew)
    const response = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/en/business-portal',
        },
      }
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.redirect).toBe('/he')
  })

  test('Step 5: Logout API returns correct status code', async ({ page }) => {
    const response = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/he/business-portal',
        },
      }
    )

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/json')
  })

  test('Step 6: Verify logout response structure', async ({ page }) => {
    const response = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/he/business-portal',
        },
      }
    )

    const data = await response.json()

    // Should have success and redirect fields
    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('redirect')

    // Should not have error field when successful
    expect(data).not.toHaveProperty('error')

    // Redirect should be a valid path
    expect(data.redirect).toMatch(/^\/(he|ru)$/)
  })

  test('Step 7: Logout from different portal paths preserves locale', async ({
    page,
  }) => {
    // Test from add business page
    const response1 = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/he/business-portal/add',
        },
      }
    )
    const data1 = await response1.json()
    expect(data1.redirect).toBe('/he')

    // Test from edit business page
    const response2 = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/ru/business-portal/edit/some-id',
        },
      }
    )
    const data2 = await response2.json()
    expect(data2.redirect).toBe('/ru')
  })

  test('Step 8: Multiple logout calls are idempotent', async ({ page }) => {
    // First logout
    const response1 = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/he/business-portal',
        },
      }
    )
    const data1 = await response1.json()
    expect(data1.success).toBe(true)

    // Second logout (already logged out)
    const response2 = await page.request.post(
      'http://localhost:4700/api/auth/owner/logout',
      {
        headers: {
          referer: 'http://localhost:4700/he/business-portal',
        },
      }
    )
    const data2 = await response2.json()
    expect(data2.success).toBe(true)
    expect(data2.redirect).toBe('/he')
  })
})

test.describe('Logout Redirect Verification', () => {
  test('Hebrew home page is accessible after logout', async ({ page }) => {
    // Call logout API
    await page.request.post('http://localhost:4700/api/auth/owner/logout', {
      headers: {
        referer: 'http://localhost:4700/he/business-portal',
      },
    })

    // Navigate to Hebrew home page
    await page.goto('http://localhost:4700/he')

    // Verify home page loads correctly
    await expect(page.locator('h1')).toBeVisible()
    await expect(page).toHaveURL(/\/he\/?$/)
  })

  test('Russian home page is accessible after logout', async ({ page }) => {
    // Call logout API
    await page.request.post('http://localhost:4700/api/auth/owner/logout', {
      headers: {
        referer: 'http://localhost:4700/ru/business-portal',
      },
    })

    // Navigate to Russian home page
    await page.goto('http://localhost:4700/ru')

    // Verify home page loads correctly
    await expect(page.locator('h1')).toBeVisible()
    await expect(page).toHaveURL(/\/ru\/?$/)
  })
})
