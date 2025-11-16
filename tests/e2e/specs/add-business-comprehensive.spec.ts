import { test, expect } from '@playwright/test'

/**
 * Comprehensive Add Business Form Testing Suite
 * Tests all validation scenarios and field combinations
 *
 * Form Fields:
 * MANDATORY:
 * - name (text)
 * - categoryId (select)
 * - neighborhoodId (select)
 * - phone OR whatsappNumber (at least one required)
 *
 * OPTIONAL:
 * - servesAllCity (checkbox)
 * - description (textarea)
 * - websiteUrl (text)
 * - address (text)
 * - openingHours (text)
 * - submitterName (text)
 * - submitterEmail (email)
 */

test.describe('Add Business Form - Comprehensive Validation Tests', () => {
  const baseURL = 'https://www.netanya.live'
  const testBusinessName = `E2E Test Business ${Date.now()}`

  test.beforeEach(async ({ page }) => {
    // Navigate to add-business page
    await page.goto(`${baseURL}/he/add-business`)
    await page.waitForLoadState('networkidle')

    // Verify form is loaded
    const form = page.locator('form')
    await expect(form).toBeVisible()
  })

  test('Test 1: Fill ONLY mandatory fields (name, category, neighborhood, phone)', async ({ page }) => {
    console.log('🧪 Test 1: Mandatory fields only with PHONE')

    // Fill business name
    await page.fill('input[name="name"]', `${testBusinessName} - Mandatory Only Phone`)

    // Select first available category
    const categorySelect = page.locator('select[name="categoryId"]')
    await categorySelect.selectOption({ index: 1 })

    // Select first available neighborhood
    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await neighborhoodSelect.selectOption({ index: 1 })

    // Fill only phone (not WhatsApp)
    await page.fill('input[name="phone"]', '050-1234567')

    // Try to submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for response
    await page.waitForTimeout(2000)

    // Check for success OR error message
    const successMessage = page.locator('text=/הצלחה|success/i')
    const errorMessage = page.locator('[role="alert"]')

    const hasSuccess = await successMessage.isVisible().catch(() => false)
    const hasError = await errorMessage.isVisible().catch(() => false)

    console.log('✅ Test 1 Complete:', { hasSuccess, hasError })

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/test1-mandatory-phone-only.png', fullPage: true })
  })

  test('Test 2: Fill ONLY mandatory fields (name, category, neighborhood, whatsapp)', async ({ page }) => {
    console.log('🧪 Test 2: Mandatory fields only with WHATSAPP')

    // Fill business name
    await page.fill('input[name="name"]', `${testBusinessName} - Mandatory Only WhatsApp`)

    // Select first available category
    const categorySelect = page.locator('select[name="categoryId"]')
    await categorySelect.selectOption({ index: 1 })

    // Select first available neighborhood
    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await neighborhoodSelect.selectOption({ index: 1 })

    // Fill only WhatsApp (not phone)
    await page.fill('input[name="whatsappNumber"]', '050-7654321')

    // Try to submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for response
    await page.waitForTimeout(2000)

    // Check for success OR error message
    const successMessage = page.locator('text=/הצלחה|success/i')
    const errorMessage = page.locator('[role="alert"]')

    const hasSuccess = await successMessage.isVisible().catch(() => false)
    const hasError = await errorMessage.isVisible().catch(() => false)

    console.log('✅ Test 2 Complete:', { hasSuccess, hasError })

    // Take screenshot
    await page.screenshot({ path: 'test-results/test2-mandatory-whatsapp-only.png', fullPage: true })
  })

  test('Test 3: Fill ONLY mandatory fields (both phone AND whatsapp)', async ({ page }) => {
    console.log('🧪 Test 3: Mandatory fields with BOTH phone and WhatsApp')

    // Fill business name
    await page.fill('input[name="name"]', `${testBusinessName} - Both Contacts`)

    // Select first available category
    const categorySelect = page.locator('select[name="categoryId"]')
    await categorySelect.selectOption({ index: 1 })

    // Select first available neighborhood
    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await neighborhoodSelect.selectOption({ index: 1 })

    // Fill both phone and WhatsApp
    await page.fill('input[name="phone"]', '050-1111111')
    await page.fill('input[name="whatsappNumber"]', '050-2222222')

    // Try to submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for response
    await page.waitForTimeout(2000)

    // Check for success OR error message
    const successMessage = page.locator('text=/הצלחה|success/i')
    const errorMessage = page.locator('[role="alert"]')

    const hasSuccess = await successMessage.isVisible().catch(() => false)
    const hasError = await errorMessage.isVisible().catch(() => false)

    console.log('✅ Test 3 Complete:', { hasSuccess, hasError })

    // Take screenshot
    await page.screenshot({ path: 'test-results/test3-both-contacts.png', fullPage: true })
  })

  test('Test 4: Fill ALL fields (mandatory + optional)', async ({ page }) => {
    console.log('🧪 Test 4: ALL fields filled')

    // Fill business name
    await page.fill('input[name="name"]', `${testBusinessName} - All Fields`)

    // Select category
    const categorySelect = page.locator('select[name="categoryId"]')
    await categorySelect.selectOption({ index: 1 })

    // Select neighborhood
    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await neighborhoodSelect.selectOption({ index: 1 })

    // Check "serves all city"
    await page.check('input[name="servesAllCity"]')

    // Fill description
    await page.fill('textarea[name="description"]', 'This is a comprehensive test of all form fields including optional ones.')

    // Fill phone and WhatsApp
    await page.fill('input[name="phone"]', '050-3333333')
    await page.fill('input[name="whatsappNumber"]', '050-4444444')

    // Fill website
    await page.fill('input[name="websiteUrl"]', 'https://example-test-business.com')

    // Fill address
    await page.fill('input[name="address"]', 'רחוב הרצל 123, נתניה')

    // Fill opening hours
    await page.fill('input[name="openingHours"]', 'א-ה: 09:00-18:00, ו: 09:00-14:00')

    // Fill submitter name
    await page.fill('input[name="submitterName"]', 'E2E Test Submitter')

    // Fill submitter email
    await page.fill('input[name="submitterEmail"]', 'test@example.com')

    // Try to submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for response
    await page.waitForTimeout(2000)

    // Check for success OR error message
    const successMessage = page.locator('text=/הצלחה|success/i')
    const errorMessage = page.locator('[role="alert"]')

    const hasSuccess = await successMessage.isVisible().catch(() => false)
    const hasError = await errorMessage.isVisible().catch(() => false)

    console.log('✅ Test 4 Complete:', { hasSuccess, hasError })

    // Take screenshot
    await page.screenshot({ path: 'test-results/test4-all-fields.png', fullPage: true })
  })

  test('Test 5: Validation - Missing business name', async ({ page }) => {
    console.log('🧪 Test 5: Validation - Missing business name')

    // Leave name EMPTY
    // Fill other mandatory fields
    const categorySelect = page.locator('select[name="categoryId"]')
    await categorySelect.selectOption({ index: 1 })

    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await neighborhoodSelect.selectOption({ index: 1 })

    await page.fill('input[name="phone"]', '050-5555555')

    // Try to submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait a bit
    await page.waitForTimeout(1000)

    // Check for validation error
    const nameInput = page.locator('input[name="name"]')
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)

    // Should also check for error message in Hebrew
    const errorAlert = page.locator('[role="alert"]')
    const hasErrorAlert = await errorAlert.isVisible().catch(() => false)

    console.log('✅ Test 5 Complete - Validation triggered:', { isInvalid, hasErrorAlert })

    // Expect validation to prevent submission
    expect(isInvalid || hasErrorAlert).toBe(true)

    // Take screenshot
    await page.screenshot({ path: 'test-results/test5-missing-name.png', fullPage: true })
  })

  test('Test 6: Validation - Missing category', async ({ page }) => {
    console.log('🧪 Test 6: Validation - Missing category')

    // Fill name
    await page.fill('input[name="name"]', `${testBusinessName} - No Category`)

    // Leave category EMPTY (don't select)

    // Fill other mandatory fields
    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await neighborhoodSelect.selectOption({ index: 1 })

    await page.fill('input[name="phone"]', '050-6666666')

    // Try to submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    await page.waitForTimeout(1000)

    // Check for validation error
    const categorySelect = page.locator('select[name="categoryId"]')
    const isInvalid = await categorySelect.evaluate((el: HTMLSelectElement) => !el.validity.valid)

    const errorAlert = page.locator('[role="alert"]')
    const hasErrorAlert = await errorAlert.isVisible().catch(() => false)

    console.log('✅ Test 6 Complete - Validation triggered:', { isInvalid, hasErrorAlert })

    expect(isInvalid || hasErrorAlert).toBe(true)

    await page.screenshot({ path: 'test-results/test6-missing-category.png', fullPage: true })
  })

  test('Test 7: Validation - Missing neighborhood', async ({ page }) => {
    console.log('🧪 Test 7: Validation - Missing neighborhood')

    await page.fill('input[name="name"]', `${testBusinessName} - No Neighborhood`)

    const categorySelect = page.locator('select[name="categoryId"]')
    await categorySelect.selectOption({ index: 1 })

    // Leave neighborhood EMPTY

    await page.fill('input[name="phone"]', '050-7777777')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    await page.waitForTimeout(1000)

    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    const isInvalid = await neighborhoodSelect.evaluate((el: HTMLSelectElement) => !el.validity.valid)

    const errorAlert = page.locator('[role="alert"]')
    const hasErrorAlert = await errorAlert.isVisible().catch(() => false)

    console.log('✅ Test 7 Complete - Validation triggered:', { isInvalid, hasErrorAlert })

    expect(isInvalid || hasErrorAlert).toBe(true)

    await page.screenshot({ path: 'test-results/test7-missing-neighborhood.png', fullPage: true })
  })

  test('Test 8: Validation - Missing BOTH phone and WhatsApp (CRITICAL)', async ({ page }) => {
    console.log('🧪 Test 8: Validation - Missing BOTH contact methods')

    await page.fill('input[name="name"]', `${testBusinessName} - No Contact`)

    const categorySelect = page.locator('select[name="categoryId"]')
    await categorySelect.selectOption({ index: 1 })

    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await neighborhoodSelect.selectOption({ index: 1 })

    // DON'T fill phone or WhatsApp

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    await page.waitForTimeout(1000)

    // Should show contact error
    const errorAlert = page.locator('[role="alert"]')
    const hasErrorAlert = await errorAlert.isVisible().catch(() => false)

    // Check for specific contact error message
    const contactError = page.locator('text=/טלפון|ווטסאפ|phone|whatsapp/i')
    const hasContactError = await contactError.isVisible().catch(() => false)

    console.log('✅ Test 8 Complete - Contact validation:', { hasErrorAlert, hasContactError })

    expect(hasErrorAlert || hasContactError).toBe(true)

    await page.screenshot({ path: 'test-results/test8-missing-contact.png', fullPage: true })
  })

  test('Test 9: Validation - Missing ALL mandatory fields', async ({ page }) => {
    console.log('🧪 Test 9: Validation - Completely empty form')

    // Don't fill ANYTHING

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    await page.waitForTimeout(1000)

    // Check multiple validations
    const nameInput = page.locator('input[name="name"]')
    const nameInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)

    const categorySelect = page.locator('select[name="categoryId"]')
    const categoryInvalid = await categorySelect.evaluate((el: HTMLSelectElement) => !el.validity.valid)

    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    const neighborhoodInvalid = await neighborhoodSelect.evaluate((el: HTMLSelectElement) => !el.validity.valid)

    const errorAlert = page.locator('[role="alert"]')
    const hasErrorAlert = await errorAlert.isVisible().catch(() => false)

    console.log('✅ Test 9 Complete - Multiple validations:', {
      nameInvalid,
      categoryInvalid,
      neighborhoodInvalid,
      hasErrorAlert
    })

    // At least one should be invalid
    expect(nameInvalid || categoryInvalid || neighborhoodInvalid || hasErrorAlert).toBe(true)

    await page.screenshot({ path: 'test-results/test9-all-empty.png', fullPage: true })
  })

  test('Test 10: Validation - Invalid email format (if filled)', async ({ page }) => {
    console.log('🧪 Test 10: Validation - Invalid email format')

    // Fill mandatory fields
    await page.fill('input[name="name"]', `${testBusinessName} - Invalid Email`)

    const categorySelect = page.locator('select[name="categoryId"]')
    await categorySelect.selectOption({ index: 1 })

    const neighborhoodSelect = page.locator('select[name="neighborhoodId"]')
    await neighborhoodSelect.selectOption({ index: 1 })

    await page.fill('input[name="phone"]', '050-8888888')

    // Fill INVALID email
    await page.fill('input[name="submitterEmail"]', 'not-a-valid-email')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    await page.waitForTimeout(1000)

    // Check email validation
    const emailInput = page.locator('input[name="submitterEmail"]')
    const emailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)

    const errorAlert = page.locator('[role="alert"]')
    const hasErrorAlert = await errorAlert.isVisible().catch(() => false)

    console.log('✅ Test 10 Complete - Email validation:', { emailInvalid, hasErrorAlert })

    expect(emailInvalid || hasErrorAlert).toBe(true)

    await page.screenshot({ path: 'test-results/test10-invalid-email.png', fullPage: true })
  })
})
