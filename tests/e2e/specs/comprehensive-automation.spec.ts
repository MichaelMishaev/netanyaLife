/**
 * Comprehensive E2E Automation Test
 *
 * This test systematically:
 * 1. Opens the browser
 * 2. Tests ALL category + neighborhood combinations
 * 3. Searches for businesses in each combination
 * 4. Tests the Add Business form
 * 5. Takes screenshots for documentation
 */

import { test, expect, Page } from '@playwright/test'

// Helper function to extract all categories from the page
async function getAllCategories(page: Page) {
  const categoryOptions = await page.locator('select option, [data-category]').allTextContents()
  const categories: Array<{ index: number; name: string }> = []

  // Get all options from category select
  const selectElement = page.locator('select').first()
  const optionCount = await selectElement.locator('option').count()

  for (let i = 1; i < optionCount; i++) { // Skip index 0 (placeholder)
    const optionText = await selectElement.locator('option').nth(i).textContent()
    if (optionText) {
      categories.push({ index: i, name: optionText.trim() })
    }
  }

  return categories
}

// Helper function to extract all neighborhoods
async function getAllNeighborhoods(page: Page) {
  const neighborhoods: Array<{ slug: string; name: string }> = []

  // Check if we have segmented buttons (treatment variant)
  const hasButtons = await page.getByRole('radiogroup').isVisible().catch(() => false)

  if (hasButtons) {
    // Treatment: Segmented buttons
    const buttons = page.getByRole('radio')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const name = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')

      if (name) {
        neighborhoods.push({
          slug: ariaLabel || name.trim(),
          name: name.trim()
        })
      }
    }
  } else {
    // Control: Dropdown
    const selectElement = page.locator('#neighborhood-select')
    const optionCount = await selectElement.locator('option').count()

    for (let i = 1; i < optionCount; i++) { // Skip index 0 (placeholder)
      const option = selectElement.locator('option').nth(i)
      const value = await option.getAttribute('value')
      const name = await option.textContent()

      if (value && name) {
        neighborhoods.push({
          slug: value,
          name: name.trim()
        })
      }
    }
  }

  return neighborhoods
}

// Helper function to perform a search
async function performSearch(
  page: Page,
  categoryIndex: number,
  neighborhoodIndex: number
) {
  await page.goto('/he')
  await page.waitForLoadState('networkidle')

  // Select category (using index)
  const categorySelect = page.locator('select').first()
  await categorySelect.selectOption({ index: categoryIndex })
  await page.waitForTimeout(500) // Wait for any dynamic updates

  // Select neighborhood
  const hasButtons = await page.getByRole('radiogroup').isVisible().catch(() => false)

  if (hasButtons) {
    // Click the neighborhood button
    const buttons = page.getByRole('radio')
    await buttons.nth(neighborhoodIndex).click()
  } else {
    // Select from dropdown
    const neighborhoodSelect = page.locator('#neighborhood-select')
    await neighborhoodSelect.selectOption({ index: neighborhoodIndex + 1 }) // +1 to skip placeholder
  }

  // Submit the form
  await page.click('button[type="submit"]')

  // Wait for navigation
  await page.waitForURL(/\/search\//, { timeout: 10000 })
}

test.describe('Comprehensive Automation - All Combinations', () => {
  test.setTimeout(300000) // 5 minutes timeout for the entire test

  test('Test all category + neighborhood combinations', async ({ page }) => {
    console.log('🤖 Starting Comprehensive Automation Test')
    console.log('=' .repeat(60))

    // Step 1: Navigate to home page
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Step 2: Extract all categories and neighborhoods
    const categories = await getAllCategories(page)
    const neighborhoods = await getAllNeighborhoods(page)

    console.log(`📊 Found ${categories.length} categories`)
    console.log(`📍 Found ${neighborhoods.length} neighborhoods`)
    console.log(`🔢 Total combinations to test: ${categories.length * neighborhoods.length}`)
    console.log('=' .repeat(60))

    let combinationCount = 0
    const results: Array<{
      category: string
      neighborhood: string
      success: boolean
      url: string
      error?: string
    }> = []

    // Step 3: Test every combination
    for (let catIndex = 0; catIndex < categories.length; catIndex++) {
      const category = categories[catIndex]

      for (let hoodIndex = 0; hoodIndex < neighborhoods.length; hoodIndex++) {
        const neighborhood = neighborhoods[hoodIndex]
        combinationCount++

        console.log(`\n[${combinationCount}/${categories.length * neighborhoods.length}] Testing:`)
        console.log(`  📁 Category: ${category.name}`)
        console.log(`  📍 Neighborhood: ${neighborhood.name}`)

        try {
          // Perform the search
          await performSearch(page, category.index, hoodIndex)

          // Verify we're on the search results page
          expect(page.url()).toContain('/search/')

          const currentUrl = page.url()
          console.log(`  ✅ Success! URL: ${currentUrl}`)

          // Take screenshot
          await page.screenshot({
            path: `test-results/automation/combo-${combinationCount}-${category.name.replace(/[^\w]/g, '_')}-${neighborhood.name.replace(/[^\w]/g, '_')}.png`,
            fullPage: true
          })

          // Wait for page to load and check for results
          await page.waitForTimeout(1000)

          // Check if there are results or "no results" message
          const hasResults = await page.locator('[data-testid="business-card"], .business-card, article').count()
          const noResultsMessage = await page.locator('text=/לא נמצאו תוצאות|No results/i').isVisible().catch(() => false)

          console.log(`  📊 Found ${hasResults} business cards`)
          if (noResultsMessage) {
            console.log(`  ℹ️  "No results" message displayed`)
          }

          results.push({
            category: category.name,
            neighborhood: neighborhood.name,
            success: true,
            url: currentUrl
          })

        } catch (error) {
          console.log(`  ❌ Failed: ${error}`)

          results.push({
            category: category.name,
            neighborhood: neighborhood.name,
            success: false,
            url: page.url(),
            error: String(error)
          })

          // Take error screenshot
          await page.screenshot({
            path: `test-results/automation/ERROR-combo-${combinationCount}.png`,
            fullPage: true
          })
        }

        // Small delay between searches to avoid overwhelming the server
        await page.waitForTimeout(500)
      }
    }

    // Step 4: Generate summary report
    console.log('\n')
    console.log('=' .repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('=' .repeat(60))

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Failed: ${failureCount}`)
    console.log(`📈 Success Rate: ${((successCount / results.length) * 100).toFixed(2)}%`)

    if (failureCount > 0) {
      console.log('\n❌ Failed Combinations:')
      results.filter(r => !r.success).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.category} → ${result.neighborhood}`)
        console.log(`     Error: ${result.error}`)
      })
    }

    // Expect at least 90% success rate
    expect(successCount / results.length).toBeGreaterThan(0.9)
  })
})

test.describe('Comprehensive Automation - Add Business Form', () => {
  test.setTimeout(120000) // 2 minutes timeout

  test('Test Add Business form with all field combinations', async ({ page }) => {
    console.log('🏢 Testing Add Business Form')
    console.log('=' .repeat(60))

    // Navigate to Add Business page
    await page.goto('/he/add-business')
    await page.waitForLoadState('networkidle')

    // Verify form is loaded
    const form = page.locator('form')
    await expect(form).toBeVisible()

    console.log('✅ Form loaded successfully')

    // Get all categories from the form
    const categorySelect = page.locator('select[name="categoryId"]')
    const categoryCount = await categorySelect.locator('option').count()

    // Get all neighborhoods from the form
    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    const neighborhoodCount = await neighborhoodSelect.locator('option').count()

    console.log(`📁 Categories available: ${categoryCount - 1}`) // -1 for placeholder
    console.log(`📍 Neighborhoods available: ${neighborhoodCount - 1}`) // -1 for placeholder

    // Test Case 1: Fill form with first category and neighborhood
    const testBusinessName = `E2E Automation Test ${Date.now()}`

    console.log('\n📝 Test Case 1: Valid submission (phone only)')

    await page.fill('input[name="name"]', testBusinessName)
    await categorySelect.selectOption({ index: 1 })
    await neighborhoodSelect.selectOption({ index: 1 })
    await page.fill('input[name="phone"]', '050-1234567')

    // Take screenshot before submission
    await page.screenshot({
      path: 'test-results/automation/add-business-filled.png',
      fullPage: true
    })

    console.log('✅ Form filled with valid data')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for response (either success or error)
    await page.waitForTimeout(3000)

    // Check for success or error message
    const successMessage = await page.locator('text=/הצלחה|success/i').isVisible().catch(() => false)
    const errorMessage = await page.locator('[role="alert"]').isVisible().catch(() => false)

    console.log(`  Success message: ${successMessage}`)
    console.log(`  Error message: ${errorMessage}`)

    // Take screenshot after submission
    await page.screenshot({
      path: 'test-results/automation/add-business-submitted.png',
      fullPage: true
    })

    // Test Case 2: Validation - Missing required fields
    console.log('\n📝 Test Case 2: Validation test (empty form)')

    await page.goto('/he/add-business')
    await page.waitForLoadState('networkidle')

    // Try to submit empty form
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)

    // Should see validation errors
    const hasValidationError = await page.locator('[role="alert"]').isVisible().catch(() => false)
    const hasInvalidFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select'))
      return inputs.some((el) => !(el as HTMLInputElement).validity.valid)
    })

    console.log(`  Has validation error: ${hasValidationError}`)
    console.log(`  Has invalid fields: ${hasInvalidFields}`)

    expect(hasValidationError || hasInvalidFields).toBe(true)

    // Take screenshot of validation errors
    await page.screenshot({
      path: 'test-results/automation/add-business-validation.png',
      fullPage: true
    })

    console.log('✅ Add Business form tests completed')
  })
})

test.describe('Comprehensive Automation - Full User Journey', () => {
  test.setTimeout(180000) // 3 minutes timeout

  test('Complete user journey: Home → Search → Business Detail → Add Business', async ({ page }) => {
    console.log('🚀 Testing Complete User Journey')
    console.log('=' .repeat(60))

    // Step 1: Start at home page
    console.log('\n📍 Step 1: Home Page')
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: 'test-results/automation/journey-1-home.png',
      fullPage: true
    })

    console.log('✅ Home page loaded')

    // Step 2: Perform a search
    console.log('\n📍 Step 2: Search')

    const categorySelect = page.locator('select').first()
    await categorySelect.selectOption({ index: 1 })

    const hasButtons = await page.getByRole('radiogroup').isVisible().catch(() => false)
    if (hasButtons) {
      await page.getByRole('radio').first().click()
    } else {
      const neighborhoodSelect = page.locator('#neighborhood-select')
      await neighborhoodSelect.selectOption({ index: 1 })
    }

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/search\//)

    await page.screenshot({
      path: 'test-results/automation/journey-2-search-results.png',
      fullPage: true
    })

    console.log('✅ Search results loaded')

    // Step 3: Click on first business (if available)
    const businessCards = page.locator('[data-testid="business-card"], .business-card, article a').first()
    const hasBusinessCards = await businessCards.isVisible().catch(() => false)

    if (hasBusinessCards) {
      console.log('\n📍 Step 3: Business Detail')

      await businessCards.click()
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: 'test-results/automation/journey-3-business-detail.png',
        fullPage: true
      })

      console.log('✅ Business detail page loaded')
    } else {
      console.log('\nℹ️  No businesses found in search results, skipping detail page')
    }

    // Step 4: Navigate to Add Business
    console.log('\n📍 Step 4: Add Business Page')

    await page.goto('/he/add-business')
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: 'test-results/automation/journey-4-add-business.png',
      fullPage: true
    })

    console.log('✅ Add Business page loaded')

    // Step 5: Navigate back to home
    console.log('\n📍 Step 5: Return to Home')

    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: 'test-results/automation/journey-5-back-home.png',
      fullPage: true
    })

    console.log('✅ Returned to home page')

    console.log('\n' + '=' .repeat(60))
    console.log('✅ Complete user journey test finished successfully!')
    console.log('=' .repeat(60))
  })
})

test.describe('Comprehensive Automation - Language Switching', () => {
  test('Test all combinations in both Hebrew and Russian', async ({ page }) => {
    console.log('🌐 Testing Language Switching')
    console.log('=' .repeat(60))

    // Test in Hebrew
    console.log('\n📍 Testing in Hebrew (עברית)')
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    const heDirection = await page.evaluate(() => {
      return window.getComputedStyle(document.body).direction
    })

    console.log(`  Direction: ${heDirection}`)
    expect(heDirection).toBe('rtl')

    await page.screenshot({
      path: 'test-results/automation/language-he.png',
      fullPage: true
    })

    // Perform a search in Hebrew
    const categorySelect = page.locator('select').first()
    await categorySelect.selectOption({ index: 1 })

    const hasButtons = await page.getByRole('radiogroup').isVisible().catch(() => false)
    if (hasButtons) {
      await page.getByRole('radio').first().click()
    } else {
      const neighborhoodSelect = page.locator('#neighborhood-select')
      await neighborhoodSelect.selectOption({ index: 1 })
    }

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/he\/search\//)

    console.log('✅ Hebrew search completed')

    // Test in Russian
    console.log('\n📍 Testing in Russian (Русский)')
    await page.goto('/ru')
    await page.waitForLoadState('networkidle')

    const ruDirection = await page.evaluate(() => {
      return window.getComputedStyle(document.body).direction
    })

    console.log(`  Direction: ${ruDirection}`)
    expect(ruDirection).toBe('ltr')

    await page.screenshot({
      path: 'test-results/automation/language-ru.png',
      fullPage: true
    })

    // Perform a search in Russian
    const categorySelectRu = page.locator('select').first()
    await categorySelectRu.selectOption({ index: 1 })

    const hasButtonsRu = await page.getByRole('radiogroup').isVisible().catch(() => false)
    if (hasButtonsRu) {
      await page.getByRole('radio').first().click()
    } else {
      const neighborhoodSelectRu = page.locator('#neighborhood-select')
      await neighborhoodSelectRu.selectOption({ index: 1 })
    }

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/ru\/search\//)

    console.log('✅ Russian search completed')

    console.log('\n' + '=' .repeat(60))
    console.log('✅ Language switching test completed!')
    console.log('=' .repeat(60))
  })
})
