import { test, expect } from '@playwright/test'

test.describe('Validation Messages i18n', () => {
  test('should show Hebrew validation message on home search form', async ({ page }) => {
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    // Find the search form
    const searchButton = page.locator('button[type="submit"]').first()

    // Try to submit without selecting anything
    await searchButton.click()

    // Get the validation message from the category select
    const categorySelect = page.locator('select#category')
    const validationMessage = await categorySelect.evaluate(
      (el: HTMLSelectElement) => el.validationMessage
    )

    // Should contain Hebrew text (בחר קטגוריה)
    expect(validationMessage).toBe('בחר קטגוריה')
  })

  test('should show Russian validation message on home search form', async ({ page }) => {
    await page.goto('/ru')
    await page.waitForLoadState('networkidle')

    // Find the search form
    const searchButton = page.locator('button[type="submit"]').first()

    // Try to submit without selecting anything
    await searchButton.click()

    // Get the validation message from the category select
    const categorySelect = page.locator('select#category')
    const validationMessage = await categorySelect.evaluate(
      (el: HTMLSelectElement) => el.validationMessage
    )

    // Should contain Russian text (Выберите категорию)
    expect(validationMessage).toBe('Выберите категорию')
  })

  test('should show Hebrew validation on add-business form', async ({ page }) => {
    await page.goto('/he/add-business')
    await page.waitForLoadState('networkidle')

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Check category validation message
    const categorySelect = page.locator('select#categoryId')
    const categoryValidationMessage = await categorySelect.evaluate(
      (el: HTMLSelectElement) => el.validationMessage
    )

    expect(categoryValidationMessage).toBe('בחר קטגוריה')

    // Check neighborhood validation message
    const neighborhoodSelect = page.locator('select#neighborhoodId')
    const neighborhoodValidationMessage = await neighborhoodSelect.evaluate(
      (el: HTMLSelectElement) => el.validationMessage
    )

    expect(neighborhoodValidationMessage).toBe('בחר שכונה')
  })

  test('should show Russian validation on add-business form', async ({ page }) => {
    await page.goto('/ru/add-business')
    await page.waitForLoadState('networkidle')

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Check category validation message
    const categorySelect = page.locator('select#categoryId')
    const categoryValidationMessage = await categorySelect.evaluate(
      (el: HTMLSelectElement) => el.validationMessage
    )

    expect(categoryValidationMessage).toBe('Выберите категорию')

    // Check neighborhood validation message
    const neighborhoodSelect = page.locator('select#neighborhoodId')
    const neighborhoodValidationMessage = await neighborhoodSelect.evaluate(
      (el: HTMLSelectElement) => el.validationMessage
    )

    expect(neighborhoodValidationMessage).toBe('Выберите район')
  })

  test('should clear validation message when option is selected', async ({ page }) => {
    await page.goto('/he')
    await page.waitForLoadState('networkidle')

    const categorySelect = page.locator('select#category')

    // Initially should have validation message
    await page.locator('button[type="submit"]').first().click()
    let validationMessage = await categorySelect.evaluate(
      (el: HTMLSelectElement) => el.validationMessage
    )
    expect(validationMessage).toBe('בחר קטגוריה')

    // Select an option
    await categorySelect.selectOption({ index: 1 })

    // Validation message should be cleared
    validationMessage = await categorySelect.evaluate(
      (el: HTMLSelectElement) => el.validationMessage
    )
    expect(validationMessage).toBe('')
  })
})
