import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

test.describe.serial('Admin Subcategory Management (Super Admin Only)', () => {
  let testCategoryId: string
  let testSubcategoryId: string
  const uniqueId = Date.now() // Unique ID for this test run
  const testCategorySlug = `test-subcategory-parent-${uniqueId}`

  test.beforeAll(async () => {
    // We'll create the category via UI in the first test
    console.log('✅ Test suite initialized with uniqueId:', uniqueId)
  })

  test.afterAll(async () => {
    // Cleanup: Delete test category and subcategories from database
    // since we can't easily do this via UI
    try {
      if (testCategoryId) {
        await prisma.subcategory.deleteMany({
          where: { category_id: testCategoryId },
        })
        await prisma.category.delete({
          where: { id: testCategoryId },
        })
        console.log('✅ Cleaned up test data')
      }
    } catch (error) {
      console.log('Cleanup error (category may not exist):', error)
    }
    await prisma.$disconnect()
  })

  test('Super admin (345287@gmail.com) can create category via UI', async ({ page, context }) => {
    // Login as super admin
    await context.clearCookies()
    await page.goto('http://localhost:4700/he/admin-login')

    await page.fill('input[type="email"]', '345287@gmail.com')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/he/admin**')
    console.log('✅ Logged in as super admin')

    // Navigate to categories
    await page.goto('http://localhost:4700/he/admin/categories')
    await page.waitForLoadState('networkidle')

    // Click "Add Category" button (it's a CategoryForm in create mode)
    const addCategoryButton = page.getByRole('button', { name: '+ הוסף קטגוריה' })
    await expect(addCategoryButton).toBeVisible({ timeout: 10000 })
    await addCategoryButton.click()

    // Wait for modal to open
    await expect(page.getByText('הוסף קטגוריה חדשה')).toBeVisible()

    // Fill in category form
    await page.fill('input[name="name_he"]', `קטגוריית בדיקה ${uniqueId}`)
    await page.fill('input[name="name_ru"]', `Тестовая категория ${uniqueId}`)

    // The slug should auto-generate, but we can override it
    await page.fill('input[name="slug"]', testCategorySlug)

    // Submit form
    await page.click('button[type="submit"]:has-text("שמור")')

    // Wait for modal to close
    await expect(page.getByText('הוסף קטגוריה חדשה')).not.toBeVisible({ timeout: 10000 })

    // Wait for page to reload/revalidate
    await page.waitForTimeout(2000)

    // Verify category appears on page
    const categoryCard = page.locator('.rounded-lg.border.bg-white.p-6').filter({ hasText: testCategorySlug })
    await expect(categoryCard).toBeVisible({ timeout: 10000 })

    // Get the category ID from database for later tests
    const category = await prisma.category.findFirst({
      where: { slug: testCategorySlug },
    })
    expect(category).toBeTruthy()
    testCategoryId = category!.id

    console.log('✅ Category created via UI:', testCategoryId)
  })

  test('Super admin can add subcategory', async ({ page, context }) => {
    // Login as super admin
    await context.clearCookies()
    await page.goto('http://localhost:4700/he/admin-login')

    await page.fill('input[type="email"]', '345287@gmail.com')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/he/admin**')

    // Navigate to categories
    await page.goto('http://localhost:4700/he/admin/categories')
    await page.waitForLoadState('networkidle')

    // Find our test category
    const categoryCards = page.locator('.rounded-lg.border.bg-white.p-6')
    const categoryCard = categoryCards.filter({ hasText: testCategorySlug }).first()
    await expect(categoryCard).toBeVisible({ timeout: 10000 })

    // Click "Add Subcategory" button (may need to scroll into view)
    await categoryCard.scrollIntoViewIfNeeded()

    // Check if we need to expand subcategories first
    const addSubcategoryButton = categoryCard.getByText('+ הוסף תת קטגוריה')
    const isVisible = await addSubcategoryButton.isVisible().catch(() => false)

    if (!isVisible) {
      // Button might be hidden, no subcategories section shown yet
      // The button should be visible by default when there are 0 subcategories
      console.log('Warning: Add subcategory button not immediately visible')
    }

    await addSubcategoryButton.click()

    // Wait for modal to open
    await expect(page.getByText('הוסף תת-קטגוריה')).toBeVisible({ timeout: 10000 })

    // Fill in subcategory form
    await page.fill('input[name="name_he"]', 'תת-קטגוריה בדיקה')
    await page.fill('input[name="name_ru"]', 'Тестовая подкатегория')

    // Slug should auto-generate
    const slugInput = page.locator('input[name="slug"]')
    await expect(slugInput).toHaveValue(/.*/)

    // Submit form
    await page.click('button[type="submit"]:has-text("שמור")')

    // Wait for modal to close
    await expect(page.getByText('הוסף תת-קטגוריה')).not.toBeVisible({ timeout: 10000 })

    // Wait for page to update
    await page.waitForTimeout(2000)

    // Verify subcategory was created in database
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        category_id: testCategoryId,
        name_he: 'תת-קטגוריה בדיקה',
      },
    })

    expect(subcategory).toBeTruthy()
    expect(subcategory?.name_ru).toBe('Тестовая подкатегория')
    testSubcategoryId = subcategory!.id

    console.log('✅ Subcategory created successfully:', testSubcategoryId)

    // Reload page to verify it shows in the UI
    await page.reload()
    await page.waitForLoadState('networkidle')

    const categoryCard2 = categoryCards.filter({ hasText: testCategorySlug }).first()

    // Now there should be a "Show Subcategories" button
    await categoryCard2.getByText(/הצג תתי קטגוריות/).click()

    await expect(page.getByText('תת-קטגוריה בדיקה')).toBeVisible()
    console.log('✅ Subcategory visible in UI')
  })

  test('Super admin can edit subcategory', async ({ page, context }) => {
    // Login as super admin
    await context.clearCookies()
    await page.goto('http://localhost:4700/he/admin-login')
    await page.fill('input[type="email"]', '345287@gmail.com')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/he/admin**')

    // Navigate to categories
    await page.goto('http://localhost:4700/he/admin/categories')
    await page.waitForLoadState('networkidle')

    // Find and expand subcategories
    const categoryCards = page.locator('.rounded-lg.border.bg-white.p-6')
    const categoryCard = categoryCards.filter({ hasText: testCategorySlug }).first()
    await categoryCard.scrollIntoViewIfNeeded()
    await categoryCard.getByText(/הצג תתי קטגוריות/).click()

    // Click edit button for subcategory
    const subcategoryRow = page.locator('text=תת-קטגוריה בדיקה').locator('..')
    await subcategoryRow.getByTitle('ערוך').click()

    // Wait for edit modal
    await expect(page.getByText('ערוך תת-קטגוריה')).toBeVisible()

    // Update name
    const nameInput = page.locator('input[name="name_he"]')
    await nameInput.fill('תת-קטגוריה ערוכה')

    // Submit
    await page.click('button[type="submit"]:has-text("שמור")')

    // Wait for modal to close
    await expect(page.getByText('ערוך תת-קטגוריה')).not.toBeVisible({ timeout: 10000 })

    // Wait for update
    await page.waitForTimeout(2000)

    // Verify in database
    const updated = await prisma.subcategory.findUnique({
      where: { id: testSubcategoryId },
    })

    expect(updated?.name_he).toBe('תת-קטגוריה ערוכה')
    console.log('✅ Subcategory edited successfully')

    // Verify in UI
    await page.reload()
    await page.waitForLoadState('networkidle')
    const categoryCard2 = categoryCards.filter({ hasText: testCategorySlug }).first()
    await categoryCard2.getByText(/הצג תתי קטגוריות/).click()
    await expect(page.getByText('תת-קטגוריה ערוכה')).toBeVisible()
  })

  test('Super admin can delete subcategory', async ({ page, context }) => {
    // Login as super admin
    await context.clearCookies()
    await page.goto('http://localhost:4700/he/admin-login')
    await page.fill('input[type="email"]', '345287@gmail.com')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/he/admin**')

    // Navigate to categories
    await page.goto('http://localhost:4700/he/admin/categories')
    await page.waitForLoadState('networkidle')

    // Find and expand subcategories
    const categoryCards = page.locator('.rounded-lg.border.bg-white.p-6')
    const categoryCard = categoryCards.filter({ hasText: testCategorySlug }).first()
    await categoryCard.scrollIntoViewIfNeeded()
    await categoryCard.getByText(/הצג תתי קטגוריות/).click()

    // Click delete button
    const subcategoryRow = page.locator('text=תת-קטגוריה ערוכה').locator('..')

    // Listen for confirm dialog
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('למחוק תת-קטגוריה')
      dialog.accept()
    })

    await subcategoryRow.getByTitle('מחק').click()

    // Wait for deletion
    await page.waitForTimeout(2000)

    // Verify deleted from database
    const deleted = await prisma.subcategory.findUnique({
      where: { id: testSubcategoryId },
    })

    expect(deleted).toBeNull()
    console.log('✅ Subcategory deleted successfully')

    // Verify not visible in UI
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('תת-קטגוריה ערוכה')).not.toBeVisible()
  })

  test('Non-super admin sees "View Only" and cannot edit/delete categories', async ({ page, context }) => {
    // First, create a non-super admin user
    const hashedPassword = await bcrypt.hash('testpass', 10)

    const regularAdmin = await prisma.adminUser.upsert({
      where: { email: 'regularadmin@test.com' },
      update: {},
      create: {
        email: 'regularadmin@test.com',
        password_hash: hashedPassword,
      },
    })

    try {
      // Login as regular admin
      await context.clearCookies()
      await page.goto('http://localhost:4700/he/admin-login')
      await page.fill('input[type="email"]', 'regularadmin@test.com')
      await page.fill('input[type="password"]', 'testpass')
      await page.click('button[type="submit"]')
      await page.waitForURL('**/he/admin**')

      // Navigate to categories
      await page.goto('http://localhost:4700/he/admin/categories')
      await page.waitForLoadState('networkidle')

      // Find any category card
      const categoryCards = page.locator('.rounded-lg.border.bg-white.p-6')
      const firstCard = categoryCards.first()

      // Should see "View Only" badge
      await expect(firstCard.getByText('צפייה בלבד')).toBeVisible()

      // Should NOT see delete button (edit button is a form, delete is explicit button)
      const deleteButton = firstCard.getByTitle('מחק')
      await expect(deleteButton).not.toBeVisible()

      console.log('✅ Regular admin sees View Only correctly')
    } finally {
      // Cleanup
      await prisma.adminUser.delete({
        where: { id: regularAdmin.id },
      })
    }
  })
})
