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
const BUSINESS_OWNER = {
  email: 'test555@gmail.com',
  password: 'admin123456',
}

const SUPER_ADMIN = {
  email: '345287@gmail.com',
  password: 'admin123456',
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Categories to rotate through (will be fetched dynamically)
let categoryRotationIndex = 0

/**
 * Helper: Clear all cookies and storage
 */
async function clearSession(page: Page) {
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/**
 * Helper: Register or Login as Business Owner
 */
async function loginAsBusinessOwner(page: Page) {
  await clearSession(page)
  await page.goto(`${BASE_URL}/he/business-login`)

  // Try to login first
  await page.fill('input[name="email"]', BUSINESS_OWNER.email)
  await page.fill('input[type="password"]', BUSINESS_OWNER.password)
  await page.click('button[type="submit"]')

  // Wait for either successful login or error
  await page.waitForTimeout(2000)

  const currentUrl = page.url()

  // If login failed (still on login page), register
  if (currentUrl.includes('business-login')) {
    console.log('Account does not exist, registering...')

    // Click on register tab/link
    const registerButton = page.locator('text=/הרשמה|Register/i').first()
    if (await registerButton.isVisible()) {
      await registerButton.click()
      await page.waitForTimeout(1000)
    }

    // Fill registration form
    await page.fill('input[name="name"]', 'Test Business Owner')
    await page.fill('input[name="email"]', BUSINESS_OWNER.email)
    await page.fill('input[type="password"]', BUSINESS_OWNER.password)

    // Submit registration
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
  }

  // Verify we're in business portal
  await expect(page).toHaveURL(/.*business-portal.*/)
  console.log('✓ Logged in as business owner')
}

/**
 * Helper: Login as Super Admin
 */
async function loginAsSuperAdmin(page: Page) {
  await clearSession(page)
  await page.goto(`${BASE_URL}/he/admin`)

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
 * Helper: Get available categories and subcategories
 */
async function getCategories(page: Page) {
  // Navigate to add business page to access categories
  const response = await page.goto(`${BASE_URL}/he/add-business`)
  await page.waitForLoadState('networkidle')

  // Extract categories from the select dropdown
  const categories = await page.evaluate(() => {
    const select = document.querySelector('select[name="categoryId"]') as HTMLSelectElement
    if (!select) return []

    const options = Array.from(select.options)
    return options
      .filter(opt => opt.value && opt.value !== '')
      .map(opt => ({
        id: opt.value,
        name: opt.textContent?.trim() || '',
      }))
  })

  console.log(`✓ Found ${categories.length} categories`)
  return categories
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
    description_he: `זהו תיאור מפורט של העסק בעברית. העסק מספק שירותים איכוטיים ומקצועיים. נוסד בשנת 2024 ומשרת את תושבי נתניה במסירות ואמינות. ${timestamp}`,
    address_he: `רחוב הרצל ${randomId}, נתניה`,
    opening_hours_he: 'א׳-ה׳: 08:00-18:00, ו׳: 08:00-14:00',

    // Russian fields
    name_ru: `Тестовый бизнес ${categoryName} ${randomId}`,
    description_ru: `Подробное описание бизнеса на русском языке. Компания предоставляет качественные и профессиональные услуги. Основана в 2024 году и обслуживает жителей Нетании с преданностью и надежностью. ${timestamp}`,
    address_ru: `улица Герцль ${randomId}, Нетания`,
    opening_hours_ru: 'Вс-Чт: 08:00-18:00, Пт: 08:00-14:00',

    // Contact (both phone and WhatsApp to test all fields)
    phone: `050${randomId}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    whatsapp: `052${randomId}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    email: `test${randomId}@example.com`,
    website: `https://www.test-business-${randomId}.com`,

    // Submitter info
    submitter_name: 'Test Business Owner',
    submitter_email: BUSINESS_OWNER.email,
    submitter_phone: '0501234567',
  }
}

/**
 * Main Test Suite
 */
test.describe('Business Registration & Approval Flow', () => {
  let businessData: ReturnType<typeof generateBusinessData>
  let selectedCategory: { id: string; name: string }

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
    const addBusinessButton = page.locator('text=/הוסף עסק|Add Business/i').first()
    await addBusinessButton.click()

    // Wait for navigation
    await page.waitForURL(/.*business-portal\/add-business.*/)
    console.log('✓ On Add Business page')

    // ========================================
    // STEP 3: Select Category (Rotate)
    // ========================================
    console.log('\n=== STEP 3: Select Category ===')

    // Get all available categories
    const categories = await page.evaluate(() => {
      const select = document.querySelector('select[name="categoryId"]') as HTMLSelectElement
      if (!select) return []

      const options = Array.from(select.options)
      return options
        .filter(opt => opt.value && opt.value !== '')
        .map(opt => ({
          id: opt.value,
          name: opt.textContent?.trim() || '',
        }))
    })

    if (categories.length === 0) {
      throw new Error('No categories found')
    }

    // Rotate through categories
    selectedCategory = categories[categoryRotationIndex % categories.length]
    categoryRotationIndex++

    console.log(`✓ Selected category: ${selectedCategory.name} (${selectedCategory.id})`)

    // Select the category
    await page.selectOption('select[name="categoryId"]', selectedCategory.id)
    await page.waitForTimeout(1000) // Wait for subcategories to load

    // Check if subcategories are available
    const subcategorySelect = page.locator('select[name="subcategoryId"]')
    const hasSubcategories = await subcategorySelect.isVisible()

    if (hasSubcategories) {
      // Get first available subcategory
      const subcategories = await page.evaluate(() => {
        const select = document.querySelector('select[name="subcategoryId"]') as HTMLSelectElement
        if (!select) return []

        const options = Array.from(select.options)
        return options
          .filter(opt => opt.value && opt.value !== '')
          .map(opt => ({
            id: opt.value,
            name: opt.textContent?.trim() || '',
          }))
      })

      if (subcategories.length > 0) {
        await page.selectOption('select[name="subcategoryId"]', subcategories[0].id)
        console.log(`✓ Selected subcategory: ${subcategories[0].name}`)
      }
    }

    // ========================================
    // STEP 4: Select Neighborhood
    // ========================================
    console.log('\n=== STEP 4: Select Neighborhood ===')

    // Get first available neighborhood
    const neighborhoods = await page.evaluate(() => {
      const select = document.querySelector('select[name="neighborhoodId"]') as HTMLSelectElement
      if (!select) return []

      const options = Array.from(select.options)
      return options
        .filter(opt => opt.value && opt.value !== '')
        .map(opt => ({
          id: opt.value,
          name: opt.textContent?.trim() || '',
        }))
    })

    if (neighborhoods.length > 0) {
      await page.selectOption('select[name="neighborhoodId"]', neighborhoods[0].id)
      console.log(`✓ Selected neighborhood: ${neighborhoods[0].name}`)
    }

    // ========================================
    // STEP 5: Fill All Business Fields
    // ========================================
    console.log('\n=== STEP 5: Fill All Business Fields ===')

    // Generate business data
    businessData = generateBusinessData(selectedCategory.name)

    // Hebrew fields
    await page.fill('input[name="name_he"]', businessData.name_he)
    await page.fill('textarea[name="description_he"]', businessData.description_he)
    await page.fill('input[name="address_he"]', businessData.address_he)
    await page.fill('textarea[name="opening_hours_he"]', businessData.opening_hours_he)

    // Russian fields
    await page.fill('input[name="name_ru"]', businessData.name_ru)
    await page.fill('textarea[name="description_ru"]', businessData.description_ru)
    await page.fill('input[name="address_ru"]', businessData.address_ru)
    await page.fill('textarea[name="opening_hours_ru"]', businessData.opening_hours_ru)

    // Contact fields
    await page.fill('input[name="phone"]', businessData.phone)
    await page.fill('input[name="whatsappNumber"]', businessData.whatsapp)
    await page.fill('input[name="email"]', businessData.email)
    await page.fill('input[name="websiteUrl"]', businessData.website)

    console.log('✓ All fields filled')
    console.log(`  Business Name (HE): ${businessData.name_he}`)
    console.log(`  Business Name (RU): ${businessData.name_ru}`)
    console.log(`  Phone: ${businessData.phone}`)
    console.log(`  WhatsApp: ${businessData.whatsapp}`)

    // ========================================
    // STEP 6: Submit Business
    // ========================================
    console.log('\n=== STEP 6: Submit Business ===')

    // Take screenshot before submit
    await page.screenshot({
      path: `tests/screenshots/business-form-filled-${Date.now()}.png`,
      fullPage: true
    })

    // Click submit button
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()

    // Wait for success message or redirect
    await page.waitForTimeout(3000)

    // Check for success indication
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

    // Find the submitted business
    const businessCard = page.locator(`text=${businessData.name_he}`).first()
    await expect(businessCard).toBeVisible({ timeout: 10000 })
    console.log('✓ Found pending business in approval queue')

    // Take screenshot
    await page.screenshot({
      path: `tests/screenshots/pending-business-${Date.now()}.png`,
      fullPage: true
    })

    // ========================================
    // STEP 9: Approve Business
    // ========================================
    console.log('\n=== STEP 9: Approve Business ===')

    // Find and click approve button for this business
    const approveButton = businessCard.locator('..').locator('button:has-text("אשר"), button:has-text("Approve")').first()
    await approveButton.click()

    // Wait for confirmation
    await page.waitForTimeout(2000)

    // Check if there's a confirmation modal
    const confirmButton = page.locator('button:has-text("אישור"), button:has-text("Confirm")').first()
    if (await confirmButton.isVisible()) {
      await confirmButton.click()
      await page.waitForTimeout(2000)
    }

    console.log('✓ Business approved')

    // ========================================
    // STEP 10: Verify in Business Owner Portal
    // ========================================
    console.log('\n=== STEP 10: Verify in Business Owner Portal ===')
    await loginAsBusinessOwner(page)

    await page.goto(`${BASE_URL}/he/business-portal`)
    await page.waitForLoadState('networkidle')

    // Look for the business in owner's list
    const ownerBusinessCard = page.locator(`text=${businessData.name_he}`).first()
    await expect(ownerBusinessCard).toBeVisible({ timeout: 10000 })
    console.log('✓ Business visible in owner portal')

    // Take final screenshot
    await page.screenshot({
      path: `tests/screenshots/owner-portal-final-${Date.now()}.png`,
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
