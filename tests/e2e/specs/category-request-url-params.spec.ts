import { test, expect } from '@playwright/test'

test.describe('Category Request with URL Parameters', () => {
  test('should auto-open modal and pre-fill form from URL params', async ({ page, context }) => {
    // Clear browser state
    await context.clearCookies()

    // Set up console logging
    page.on('console', (msg) => {
      if (msg.text().includes('🔵') || msg.text().includes('✅')) {
        console.log('BROWSER LOG:', msg.text())
      }
    })

    // Test URL with category request parameters
    const testUrl = 'http://localhost:4700/he/add-business?' + new URLSearchParams({
      categoryNameHe: 'מתקין מזגנים',
      categoryNameRu: 'Установщики кондиционеров',
      description: 'חסרה קטגוריה למתקיני מזגנים בנתניה',
      businessName: 'Cool Air Services',
      requesterName: 'יוסי כהן',
      requesterEmail: 'yossi@example.com',
      requesterPhone: '050-1234567',
    }).toString()

    console.log('🔵 Navigating to:', testUrl)
    await page.goto(testUrl)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Modal should auto-open
    console.log('🔍 Checking if modal auto-opened...')
    await expect(page.getByText('בקשת קטגוריה חדשה')).toBeVisible({ timeout: 5000 })
    console.log('✅ Modal is visible')

    // Verify form fields are pre-filled
    console.log('🔍 Verifying form fields are pre-filled...')

    const hebrewNameInput = page.getByLabel('שם הקטגוריה בעברית')
    await expect(hebrewNameInput).toHaveValue('מתקין מזגנים')
    console.log('✅ Hebrew name pre-filled')

    const russianNameInput = page.getByLabel('שם הקטגוריה ברוסית')
    await expect(russianNameInput).toHaveValue('Установщики кондиционеров')
    console.log('✅ Russian name pre-filled')

    const descriptionInput = page.getByLabel('למה קטגוריה זו חשובה?')
    await expect(descriptionInput).toHaveValue('חסרה קטגוריה למתקיני מזגנים בנתניה')
    console.log('✅ Description pre-filled')

    const businessNameInput = page.locator('input[name="businessName"]')
    await expect(businessNameInput).toHaveValue('Cool Air Services')
    console.log('✅ Business name pre-filled')

    const requesterNameInput = page.locator('input[name="requesterName"]')
    await expect(requesterNameInput).toHaveValue('יוסי כהן')
    console.log('✅ Requester name pre-filled')

    const requesterEmailInput = page.locator('input[name="requesterEmail"]')
    await expect(requesterEmailInput).toHaveValue('yossi@example.com')
    console.log('✅ Requester email pre-filled')

    const requesterPhoneInput = page.locator('input[name="requesterPhone"]')
    await expect(requesterPhoneInput).toHaveValue('050-1234567')
    console.log('✅ Requester phone pre-filled')

    // User can still edit fields
    console.log('🔍 Testing that user can edit fields...')
    await hebrewNameInput.fill('מתקין מזגנים ומערכות קירור')
    await expect(hebrewNameInput).toHaveValue('מתקין מזגנים ומערכות קירור')
    console.log('✅ User can edit fields')

    // Submit button should be clickable (manual submit required)
    const submitButton = page.getByRole('button', { name: 'שלח בקשה' })
    await expect(submitButton).toBeEnabled()
    console.log('✅ Submit button is enabled - user must click manually')

    // Test actual submission
    console.log('🔵 Testing form submission...')
    await submitButton.click()

    // Wait for success message
    await expect(page.getByText('הבקשה נשלחה בהצלחה!')).toBeVisible({ timeout: 10000 })
    console.log('✅ Request submitted successfully!')

    // Verify in database
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const requests = await prisma.categoryRequest.findMany({
      where: {
        category_name_he: 'מתקין מזגנים ומערכות קירור',
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 1,
    })

    expect(requests.length).toBe(1)
    expect(requests[0].category_name_ru).toBe('Установщики кондиционеров')
    expect(requests[0].requester_email).toBe('yossi@example.com')
    console.log('✅ Request saved to database correctly')

    await prisma.$disconnect()
  })

  test('should sanitize malicious input from URL params', async ({ page, context }) => {
    await context.clearCookies()

    // Test URL with XSS attempt
    const maliciousUrl = 'http://localhost:4700/he/add-business?' + new URLSearchParams({
      categoryNameHe: '<script>alert("XSS")</script>מזגנים',
      categoryNameRu: '<img src=x onerror=alert(1)>',
      description: 'Test<script>alert("bad")</script>',
    }).toString()

    await page.goto(maliciousUrl)
    await page.waitForLoadState('networkidle')

    // Modal should open
    await expect(page.getByText('בקשת קטגוריה חדשה')).toBeVisible()

    // Verify malicious code was sanitized
    const hebrewNameInput = page.getByLabel('שם הקטגוריה בעברית')
    const value = await hebrewNameInput.inputValue()

    // Should NOT contain script tags
    expect(value).not.toContain('<script>')
    expect(value).not.toContain('</script>')
    expect(value).not.toContain('<img')

    // Should contain safe text only
    expect(value).toBe('scriptalert("XSS")/scriptמזגנים')

    console.log('✅ XSS attempt was sanitized:', value)
  })

  test('should handle empty URL params gracefully', async ({ page, context }) => {
    await context.clearCookies()

    // URL with only one param
    const url = 'http://localhost:4700/he/add-business?categoryNameHe=בדיקה'

    await page.goto(url)
    await page.waitForLoadState('networkidle')

    // Modal should open
    await expect(page.getByText('בקשת קטגוריה חדשה')).toBeVisible()

    // Only Hebrew name should be filled
    await expect(page.getByLabel('שם הקטגוריה בעברית')).toHaveValue('בדיקה')

    // Other fields should be empty
    await expect(page.getByLabel('שם הקטגוריה ברוסית')).toHaveValue('')
    await expect(page.locator('input[name="requesterEmail"]')).toHaveValue('')

    console.log('✅ Partial URL params handled correctly')
  })
})
