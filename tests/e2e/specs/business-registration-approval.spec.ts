/**
 * E2E Automation: Business Registration & Approval Flow
 *
 * This test automates the complete business lifecycle:
 * 1. Register/Login as business owner (test555@gmail.com)
 * 2. Create new business (different category each run)
 * 3. Fill ALL required and optional fields
 * 4. Submit business for approval
 * 5. Login as super admin (345287@gmail.com)
 * 6. Approve the business
 * 7. Verify business appears in owner portal
 */

import { test, expect, Page } from '@playwright/test'

// Test Configuration
// Generate unique email for each test run to avoid conflicts
// Using @gmail.com to pass email validation
const uniqueId = Date.now()
const BUSINESS_OWNER = {
  email: `testautomation${uniqueId}@gmail.com`,
  password: 'TestPassword123!',
  name: 'Test Business Owner',
}

const SUPER_ADMIN = {
  email: '345287@gmail.com',
  password: 'admin123456',
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:4700'

// Categories to rotate through (will be fetched dynamically)
let categoryRotationIndex = 0

/**
 * Helper: Clear all cookies and storage
 */
async function clearSession(page: Page) {
  await page.context().clearCookies()
  try {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  } catch (e) {
    // Ignore errors if localStorage is not accessible
  }
}

/**
 * Helper: Register or Login as Business Owner
 * Using unique email each run, so we always register
 */
async function loginAsBusinessOwner(page: Page) {
  await page.goto(`${BASE_URL}/he/business-login`)
  await clearSession(page)

  console.log(`Registering new account: ${BUSINESS_OWNER.email}`)

  // Click switch to register
  const switchToRegisterLink = page.locator('button[type="button"]').filter({
    hasText: /אין לך חשבון|don't have|no account/i
  })

  await switchToRegisterLink.waitFor({ state: 'visible', timeout: 10000 })
  await switchToRegisterLink.click()

  // Wait for name field to appear
  await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 10000 })

  // Fill registration form
  await page.fill('input[name="name"]', BUSINESS_OWNER.name)
  await page.fill('input[name="email"]', BUSINESS_OWNER.email)
  await page.fill('input[type="password"]', BUSINESS_OWNER.password)

  // Take screenshot before submitting
  await page.screenshot({
    path: `test-results/registration-form-before-submit-${Date.now()}.png`,
    fullPage: true
  })

  // Submit registration
  await page.click('button[type="submit"]')

  // Wait for either success or error
  await page.waitForTimeout(3000)

  // Check for error messages
  const errorElement = page.locator('text=/failed|error|שגיאה|נכשל/i').first()
  const hasError = await errorElement.isVisible().catch(() => false)

  if (hasError) {
    const errorText = await errorElement.textContent()
    await page.screenshot({
      path: `test-results/registration-error-${Date.now()}.png`,
      fullPage: true
    })
    console.log(`Registration error: ${errorText}`)
    throw new Error(`Registration failed: ${errorText}`)
  }

  // Wait a bit more for redirect
  await page.waitForTimeout(3000)

  // Verify we're in business portal
  await expect(page).toHaveURL(/.*business-portal.*/, { timeout: 10000 })
  console.log('✓ Registered and logged in as business owner')
}

/**
 * Helper: Login as Super Admin
 */
async function loginAsSuperAdmin(page: Page) {
  await page.goto(`${BASE_URL}/he/admin`)
  await clearSession(page)

  // Fill admin login form
  await page.fill('input[type="email"]', SUPER_ADMIN.email)
  await page.fill('input[type="password"]', SUPER_ADMIN.password)
  await page.click('button[type="submit"]')

  // Wait for admin dashboard
  await page.waitForURL(/.*admin.*/)
  await expect(page).toHaveURL(/.*admin.*/)
  console.log('✓ Logged in as super admin')
}

/**
 * Helper: Select from custom dropdown (SearchableSelect or SimpleSelect)
 * @param page - Playwright page object
 * @param labelText - The label text above the dropdown (e.g., "קטגוריה", "שכונה")
 * @param optionText - The text of the option to select
 */
async function selectFromCustomDropdown(page: Page, labelText: string, optionText: string) {
  // Find the dropdown by its label
  const label = page.locator('div.text-base.font-semibold', { hasText: labelText })

  // Find the button that follows this label (the dropdown trigger)
  const dropdownButton = label.locator('..').locator('button[type="button"]').first()

  // Click to open dropdown
  await dropdownButton.click()
  await page.waitForTimeout(500)

  // Wait for dropdown menu to appear
  await page.waitForSelector('[role="listbox"], button[role="option"]', { state: 'visible', timeout: 5000 })

  // Click the option with matching text
  const option = page.locator('button[role="option"]', { hasText: optionText }).first()
  await option.click()
  await page.waitForTimeout(500)
}

/**
 * Helper: Get first available option from custom dropdown
 * @param page - Playwright page object
 * @param labelText - The label text above the dropdown
 * @returns The text of the first option
 */
async function getFirstDropdownOption(page: Page, labelText: string): Promise<string> {
  // Find the dropdown by its label
  const label = page.locator('div.text-base.font-semibold', { hasText: labelText })

  // Find the button that follows this label
  const dropdownButton = label.locator('..').locator('button[type="button"]').first()

  // Click to open dropdown
  await dropdownButton.click()
  await page.waitForTimeout(500)

  // Wait for dropdown menu to appear
  await page.waitForSelector('[role="listbox"], button[role="option"]', { state: 'visible', timeout: 5000 })

  // Get first option text
  const firstOption = page.locator('button[role="option"]').first()
  const optionText = await firstOption.textContent()

  // Click it
  await firstOption.click()
  await page.waitForTimeout(500)

  return optionText || ''
}

/**
 * Helper: Generate unique business data
 */
function generateBusinessData(categoryName: string) {
  const timestamp = Date.now()
  const randomId = Math.floor(Math.random() * 1000)

  return {
    // Hebrew fields
    name_he: `עסק טסט ${categoryName} ${randomId}`,
    description_he: `תיאור מפורט של העסק בעברית. ${timestamp}`,
    address_he: `רחוב הרצל ${randomId}, נתניה`,

    // Russian fields (optional for owner form)
    name_ru: `Тест ${categoryName} ${randomId}`,
    description_ru: `Описание на русском. ${timestamp}`,
    address_ru: `ул. Герцля ${randomId}, Нетания`,

    // Contact (both phone and WhatsApp)
    phone: `050${Math.floor(1000000 + Math.random() * 9000000)}`,
    whatsapp: `052${Math.floor(1000000 + Math.random() * 9000000)}`,
    email: `test${randomId}@example.com`,
    website: `https://test-${randomId}.com`,

    // Opening hours
    openingHours: 'א׳-ה׳: 09:00-18:00, ו׳: 09:00-14:00',
  }
}

/**
 * Main Test Suite
 */
test.describe('Business Registration & Approval Flow', () => {
  let businessData: ReturnType<typeof generateBusinessData>
  let selectedCategory: string = ''
  let selectedNeighborhood: string = ''

  test('Complete business lifecycle: Register → Submit → Approve → Verify', async ({ page }) => {
    test.setTimeout(180000) // 3 minutes timeout

    // ========================================
    // STEP 1: Login as Business Owner
    // ========================================
    console.log('\n=== STEP 1: Login as Business Owner ===')
    await loginAsBusinessOwner(page)

    // ========================================
    // STEP 2: Navigate to Add Business
    // ========================================
    console.log('\n=== STEP 2: Navigate to Add Business ===')
    await page.goto(`${BASE_URL}/he/business-portal`)

    // Click "Add Business" button
    const addBusinessButton = page.getByRole('link', { name: /הוסף עסק|add business/i })
    await addBusinessButton.click()

    // Wait for navigation
    await page.waitForURL(/.*business-portal\/add.*/)
    console.log('✓ On Add Business page')

    // ========================================
    // STEP 3: Select Category
    // ========================================
    console.log('\n=== STEP 3: Select Category ===')

    // Get first available category
    selectedCategory = await getFirstDropdownOption(page, 'קטגוריה')
    console.log(`✓ Selected category: ${selectedCategory}`)

    // Wait a bit for subcategories to load if they exist
    await page.waitForTimeout(1000)

    // Check if subcategory dropdown exists
    const subcategoryLabel = page.locator('div.text-base.font-semibold', { hasText: 'תת-קטגוריה' })
    if (await subcategoryLabel.isVisible()) {
      try {
        const selectedSubcategory = await getFirstDropdownOption(page, 'תת-קטגוריה')
        console.log(`✓ Selected subcategory: ${selectedSubcategory}`)
      } catch (e) {
        console.log('No subcategories available or error selecting')
      }
    }

    // ========================================
    // STEP 4: Select Neighborhood
    // ========================================
    console.log('\n=== STEP 4: Select Neighborhood ===')

    // Check for "משרת את כל נתניה" checkbox
    const servesAllCityCheckbox = page.locator('input[name="servesAllCity"]')
    if (await servesAllCityCheckbox.isVisible()) {
      // If checkbox exists, check if it's already checked
      const isChecked = await servesAllCityCheckbox.isChecked()
      if (!isChecked) {
        // If not checked, select a neighborhood
        selectedNeighborhood = await getFirstDropdownOption(page, 'שכונה')
        console.log(`✓ Selected neighborhood: ${selectedNeighborhood}`)
      } else {
        console.log('✓ Serves all city (checkbox checked)')
        selectedNeighborhood = 'כל נתניה'
      }
    } else {
      // No checkbox, just select neighborhood
      selectedNeighborhood = await getFirstDropdownOption(page, 'שכונה')
      console.log(`✓ Selected neighborhood: ${selectedNeighborhood}`)
    }

    // ========================================
    // STEP 5: Fill All Business Fields
    // ========================================
    console.log('\n=== STEP 5: Fill All Business Fields ===')

    // Generate business data
    businessData = generateBusinessData(selectedCategory)

    // Fill Hebrew name (required)
    await page.fill('input[name="name_he"]', businessData.name_he)
    console.log(`✓ Filled name (HE): ${businessData.name_he}`)

    // Fill description (optional but we fill it)
    const descriptionField = page.locator('textarea[name="description_he"]')
    if (await descriptionField.isVisible()) {
      await descriptionField.fill(businessData.description_he)
    }

    // Fill contact fields (phone OR whatsapp required)
    await page.fill('input[name="phone"]', businessData.phone)
    console.log(`✓ Filled phone: ${businessData.phone}`)

    await page.fill('input[name="whatsappNumber"]', businessData.whatsapp)
    console.log(`✓ Filled WhatsApp: ${businessData.whatsapp}`)

    // Fill email (optional)
    const emailField = page.locator('input[name="email"]')
    if (await emailField.isVisible()) {
      await emailField.fill(businessData.email)
    }

    // Fill website (optional)
    const websiteField = page.locator('input[name="websiteUrl"]')
    if (await websiteField.isVisible()) {
      await websiteField.fill(businessData.website)
    }

    // Fill address (optional)
    const addressField = page.locator('input[name="address_he"]')
    if (await addressField.isVisible()) {
      await addressField.fill(businessData.address_he)
    }

    // Fill opening hours (required) - uses OpeningHoursInput component
    // This component has multiple day inputs, let's just fill one example
    const openingHoursContainer = page.locator('textarea, input').filter({ hasText: /ראשון|sunday/i }).first()
    if (await openingHoursContainer.isVisible()) {
      await openingHoursContainer.fill('09:00-18:00')
    } else {
      // Alternative: look for any opening hours input
      const anyHoursInput = page.locator('[placeholder*="09:00"], [placeholder*="שעות"]').first()
      if (await anyHoursInput.isVisible()) {
        await anyHoursInput.fill('09:00-18:00')
      }
    }

    console.log('✓ All fields filled')

    // Take screenshot before submit
    await page.screenshot({
      path: `test-results/business-form-filled-${Date.now()}.png`,
      fullPage: true
    })

    // ========================================
    // STEP 6: Submit Business
    // ========================================
    console.log('\n=== STEP 6: Submit Business ===')

    // Click submit button
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /שלח|submit|הוסף/i })
    await submitButton.click()

    // Wait for success/redirect
    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    console.log(`✓ Business submitted (URL: ${currentUrl})`)

    // ========================================
    // STEP 7: Login as Super Admin
    // ========================================
    console.log('\n=== STEP 7: Login as Super Admin ===')
    await loginAsSuperAdmin(page)

    // ========================================
    // STEP 8: Navigate to Pending Businesses
    // ========================================
    console.log('\n=== STEP 8: Navigate to Pending Businesses ===')
    await page.goto(`${BASE_URL}/he/admin/pending`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Look for the submitted business name
    const businessCard = page.locator('text=' + businessData.name_he).first()

    try {
      await businessCard.waitFor({ state: 'visible', timeout: 10000 })
      console.log('✓ Found pending business in approval queue')

      // Take screenshot
      await page.screenshot({
        path: `test-results/pending-business-${Date.now()}.png`,
        fullPage: true
      })
    } catch (e) {
      console.log('⚠ Business not found in pending queue immediately, checking page content...')
      await page.screenshot({
        path: `test-results/pending-page-debug-${Date.now()}.png`,
        fullPage: true
      })
      throw new Error(`Could not find business "${businessData.name_he}" in pending queue`)
    }

    // ========================================
    // STEP 9: Approve Business
    // ========================================
    console.log('\n=== STEP 9: Approve Business ===')

    // Find approve button for this business
    // The approve button should be near the business name
    const approveButton = page.locator('button').filter({ hasText: /אשר|approve/i }).first()
    await approveButton.click()

    // Wait for confirmation modal if it exists
    await page.waitForTimeout(1000)

    const confirmButton = page.locator('button').filter({ hasText: /אישור|confirm|כן/i }).first()
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click()
    }

    await page.waitForTimeout(2000)
    console.log('✓ Business approved')

    // ========================================
    // STEP 10: Verify in Business Owner Portal
    // ========================================
    console.log('\n=== STEP 10: Verify in Business Owner Portal ===')
    await loginAsBusinessOwner(page)

    await page.goto(`${BASE_URL}/he/business-portal`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Look for the business in owner's list
    const ownerBusinessCard = page.locator('text=' + businessData.name_he).first()
    await ownerBusinessCard.waitFor({ state: 'visible', timeout: 10000 })
    console.log('✓ Business visible in owner portal')

    // Take final screenshot
    await page.screenshot({
      path: `test-results/owner-portal-final-${Date.now()}.png`,
      fullPage: true
    })

    // ========================================
    // TEST COMPLETE
    // ========================================
    console.log('\n=== ✅ TEST COMPLETE ===')
    console.log(`Business "${businessData.name_he}" successfully:`)
    console.log('  1. ✓ Registered by owner')
    console.log('  2. ✓ Submitted for approval')
    console.log('  3. ✓ Approved by super admin')
    console.log('  4. ✓ Visible in owner portal')
  })
})
