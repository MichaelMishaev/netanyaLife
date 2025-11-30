/**
 * ✅ TEST UTILITIES & HELPER FUNCTIONS
 *
 * Reusable functions for E2E tests to reduce code duplication
 * and maintain consistency across test suites.
 */

import { Page, expect } from '@playwright/test'

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Navigate to homepage in specified language
 */
export async function navigateToHome(page: Page, lang: 'he' | 'ru' = 'he') {
  await page.goto(`/${lang}`)
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to a business detail page through search
 * Returns true if successful, false if no businesses found
 */
export async function navigateToFirstBusiness(page: Page, lang: 'he' | 'ru' = 'he'): Promise<boolean> {
  await navigateToHome(page, lang)

  // Select category
  const categorySelect = page.locator('select').first()
  await categorySelect.selectOption({ index: 1 })

  // Select neighborhood
  await selectNeighborhood(page, 0)

  // Submit search
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/search\//)
  await page.waitForLoadState('networkidle')

  // Check if businesses exist
  const businessCards = page.locator('a[href*="/business/"]')
  const count = await businessCards.count()

  if (count === 0) {
    return false
  }

  // Click first business
  await businessCards.first().click()
  await page.waitForURL(/\/business\//)
  await page.waitForLoadState('networkidle')

  return true
}

/**
 * Perform a search with specified category and neighborhood indices
 */
export async function performSearch(
  page: Page,
  categoryIndex: number,
  neighborhoodIndex: number,
  lang: 'he' | 'ru' = 'he'
) {
  await navigateToHome(page, lang)

  const categorySelect = page.locator('select').first()
  await categorySelect.selectOption({ index: categoryIndex })

  await selectNeighborhood(page, neighborhoodIndex)

  await page.click('button[type="submit"]')
  await page.waitForURL(/\/search\//)
  await page.waitForLoadState('networkidle')
}

// ============================================================================
// UI INTERACTION HELPERS
// ============================================================================

/**
 * Select neighborhood (handles both dropdown and segmented buttons)
 */
export async function selectNeighborhood(page: Page, index: number) {
  const hasRadioGroup = await page.getByRole('radiogroup').isVisible().catch(() => false)

  if (hasRadioGroup) {
    // Segmented buttons variant
    await page.getByRole('radio').nth(index).click()
  } else {
    // Dropdown variant
    const neighborhoodSelect = page.locator('select').nth(1)
    await neighborhoodSelect.selectOption({ index: index + 1 }) // +1 to skip placeholder
  }
}

/**
 * Open accessibility panel
 */
export async function openAccessibilityPanel(page: Page) {
  const accessibilityBtn = page.locator('button').filter({ hasText: /♿|נגישות/ })
  await accessibilityBtn.first().click()
  await page.waitForTimeout(500)
}

/**
 * Close accessibility panel
 */
export async function closeAccessibilityPanel(page: Page) {
  const accessibilityBtn = page.locator('button').filter({ hasText: /♿|נגישות/ })
  await accessibilityBtn.first().click()
  await page.waitForTimeout(300)
}

/**
 * Switch language
 */
export async function switchLanguage(page: Page, toLang: 'he' | 'ru') {
  if (toLang === 'ru') {
    const ruButton = page.locator('button').filter({ hasText: /Русский|RU/ })
    await ruButton.click()
  } else {
    const heButton = page.locator('button').filter({ hasText: /עברית|HE/ })
    await heButton.click()
  }

  await page.waitForURL(new RegExp(`/${toLang}`))
  await page.waitForLoadState('networkidle')
}

// ============================================================================
// DATA EXTRACTION HELPERS
// ============================================================================

/**
 * Extract all categories from category select
 */
export async function getAllCategories(page: Page): Promise<Array<{ index: number; name: string }>> {
  const categorySelect = page.locator('select').first()
  const optionCount = await categorySelect.locator('option').count()

  const categories: Array<{ index: number; name: string }> = []

  for (let i = 1; i < optionCount; i++) { // Skip index 0 (placeholder)
    const option = categorySelect.locator('option').nth(i)
    const name = await option.textContent()
    if (name) {
      categories.push({ index: i, name: name.trim() })
    }
  }

  return categories
}

/**
 * Extract all neighborhoods
 */
export async function getAllNeighborhoods(page: Page): Promise<Array<{ slug: string; name: string }>> {
  const neighborhoods: Array<{ slug: string; name: string }> = []

  const hasRadioGroup = await page.getByRole('radiogroup').isVisible().catch(() => false)

  if (hasRadioGroup) {
    // Segmented buttons
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
    // Dropdown
    const selectElement = page.locator('select').nth(1)
    const optionCount = await selectElement.locator('option').count()

    for (let i = 1; i < optionCount; i++) {
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

/**
 * Extract business card data from search results
 */
export interface BusinessCardData {
  name: string
  isPinned: boolean
  rating: number | null
  position: number
  href: string
}

export async function extractBusinessCards(page: Page): Promise<BusinessCardData[]> {
  const businessCards = page.locator('a[href*="/business/"]')
  const count = await businessCards.count()

  const cards: BusinessCardData[] = []

  for (let i = 0; i < count; i++) {
    const card = businessCards.nth(i)

    // Extract name
    const nameElement = card.locator('h2, h3, [data-testid="business-name"]').first()
    const name = await nameElement.textContent().catch(() => 'Unknown')

    // Check if pinned
    const pinnedBadge = card.locator('[data-testid="pinned"], .pinned, text=/📌|מומלץ|Pinned/i')
    const isPinned = await pinnedBadge.count().then(c => c > 0).catch(() => false)

    // Extract rating
    const ratingElement = card.locator('[data-testid="rating"], .rating, text=/★|⭐/').first()
    const ratingText = await ratingElement.textContent().catch(() => '0')
    const rating = parseFloat((ratingText || '0').match(/[\d.]+/)?.[0] || '0')

    // Extract href
    const href = await card.getAttribute('href') || ''

    cards.push({
      name: name?.trim() || 'Unknown',
      isPinned,
      rating: rating > 0 ? rating : null,
      position: i + 1,
      href
    })
  }

  return cards
}

/**
 * Extract CTA buttons from business detail page
 */
export interface CTAButtons {
  hasPhone: boolean
  hasWhatsApp: boolean
  hasWebsite: boolean
  hasDirections: boolean
  hasShare: boolean
  phoneHref?: string
  whatsappHref?: string
  websiteHref?: string
}

export async function extractCTAButtons(page: Page): Promise<CTAButtons> {
  const phoneBtn = page.locator('a[href^="tel:"]')
  const hasPhone = await phoneBtn.count() > 0
  const phoneHref = hasPhone ? await phoneBtn.first().getAttribute('href') : undefined

  const whatsappBtn = page.locator('a[href*="wa.me"], a[href*="whatsapp"]')
  const hasWhatsApp = await whatsappBtn.count() > 0
  const whatsappHref = hasWhatsApp ? await whatsappBtn.first().getAttribute('href') : undefined

  const websiteBtn = page.locator('a[href^="http"]').filter({
    hasNot: page.locator('a[href*="wa.me"], a[href*="whatsapp"], a[href*="google.com/maps"], a[href*="waze.com"]')
  })
  const hasWebsite = await websiteBtn.count() > 0
  const websiteHref = hasWebsite ? await websiteBtn.first().getAttribute('href') : undefined

  const directionsBtn = page.locator('a[href*="google.com/maps"], a[href*="waze.com"]')
  const hasDirections = await directionsBtn.count() > 0

  const shareBtn = page.locator('button').filter({ hasText: /שיתוף|Share|Поделиться|📤/ })
  const hasShare = await shareBtn.count() > 0

  return {
    hasPhone,
    hasWhatsApp,
    hasWebsite,
    hasDirections,
    hasShare,
    phoneHref: phoneHref || undefined,
    whatsappHref: whatsappHref || undefined,
    websiteHref: websiteHref || undefined
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Verify URL matches pattern
 */
export async function verifyURL(page: Page, pattern: RegExp, timeout = 10000) {
  await page.waitForURL(pattern, { timeout })
  expect(page.url()).toMatch(pattern)
}

/**
 * Verify page has no horizontal scroll
 */
export async function verifyNoHorizontalScroll(page: Page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // +1 for rounding
}

/**
 * Verify element is fully visible and clickable
 */
export async function verifyClickable(element: any) {
  await expect(element).toBeVisible()
  await expect(element).toBeEnabled()
}

/**
 * Verify direction attribute
 */
export async function verifyDirection(page: Page, expectedDir: 'rtl' | 'ltr') {
  const dir = await page.evaluate(() => document.documentElement.dir)
  expect(dir).toBe(expectedDir)
}

/**
 * Verify language attribute
 */
export async function verifyLanguage(page: Page, expectedLang: string) {
  const lang = await page.evaluate(() => document.documentElement.lang)
  expect(lang).toBe(expectedLang)
}

// ============================================================================
// SCREENSHOT HELPERS
// ============================================================================

/**
 * Take a full page screenshot with custom name
 */
export async function takeScreenshot(page: Page, name: string, dir = 'test-results/screenshots') {
  await page.screenshot({
    path: `${dir}/${name}.png`,
    fullPage: true
  })
}

/**
 * Take screenshot of specific element
 */
export async function takeElementScreenshot(element: any, name: string, dir = 'test-results/screenshots') {
  await element.screenshot({
    path: `${dir}/${name}.png`
  })
}

// ============================================================================
// FORM HELPERS
// ============================================================================

/**
 * Fill add business form with test data
 */
export async function fillAddBusinessForm(page: Page, data: {
  name?: string
  categoryIndex?: number
  neighborhoodIndex?: number
  phone?: string
  whatsapp?: string
  description?: string
  address?: string
}) {
  if (data.name) {
    await page.fill('input[name*="name"]', data.name)
  }

  if (data.categoryIndex) {
    const categorySelect = page.locator('select[name*="category"]').first()
    await categorySelect.selectOption({ index: data.categoryIndex })
  }

  if (data.neighborhoodIndex) {
    const neighborhoodSelect = page.locator('select[name*="neighborhood"]').first()
    await neighborhoodSelect.selectOption({ index: data.neighborhoodIndex })
  }

  if (data.phone) {
    const phoneInput = page.locator('input[type="tel"], input[name*="phone"]').first()
    await phoneInput.fill(data.phone)
  }

  if (data.whatsapp) {
    const whatsappInput = page.locator('input[name*="whatsapp"]').first()
    if (await whatsappInput.count() > 0) {
      await whatsappInput.fill(data.whatsapp)
    }
  }

  if (data.description) {
    const descTextarea = page.locator('textarea[name*="description"]').first()
    if (await descTextarea.count() > 0) {
      await descTextarea.fill(data.description)
    }
  }

  if (data.address) {
    const addressInput = page.locator('input[name*="address"]').first()
    if (await addressInput.count() > 0) {
      await addressInput.fill(data.address)
    }
  }
}

/**
 * Submit a review
 */
export async function submitReview(page: Page, rating: number, comment?: string, authorName?: string) {
  // Select rating
  const ratingBtn = page.locator('button').filter({ hasText: new RegExp(rating.toString()) }).first()
  if (await ratingBtn.count() > 0) {
    await ratingBtn.click()
  }

  // Fill comment
  if (comment) {
    const commentTextarea = page.locator('textarea').first()
    if (await commentTextarea.count() > 0) {
      await commentTextarea.fill(comment)
    }
  }

  // Fill author name
  if (authorName) {
    const nameInput = page.locator('input[name*="name"], input[placeholder*="שם"]').first()
    if (await nameInput.count() > 0) {
      await nameInput.fill(authorName)
    }
  }

  // Submit
  await page.click('button[type="submit"]')
}

// ============================================================================
// WAIT HELPERS
// ============================================================================

/**
 * Wait for analytics event to be sent (if tracking events)
 */
export async function waitForAnalyticsEvent(page: Page, eventName: string, timeout = 5000) {
  return page.waitForRequest(
    request => request.url().includes('analytics') || request.url().includes('events'),
    { timeout }
  ).catch(() => null)
}

/**
 * Wait for service worker to be ready
 */
export async function waitForServiceWorker(page: Page, timeout = 5000) {
  return page.evaluate(async (timeoutMs) => {
    if ('serviceWorker' in navigator) {
      const start = Date.now()
      while (Date.now() - start < timeoutMs) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.active) {
          return true
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    return false
  }, timeout)
}

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

/**
 * Change font size in accessibility panel
 */
export async function setFontSize(page: Page, size: 'רגיל' | 'בינוני' | 'גדול' | 'Normal' | 'Medium' | 'Large') {
  await openAccessibilityPanel(page)

  const sizeBtn = page.locator('button').filter({ hasText: new RegExp(size) })
  if (await sizeBtn.count() > 0) {
    await sizeBtn.first().click()
    await page.waitForTimeout(300)
  }

  await closeAccessibilityPanel(page)
}

/**
 * Toggle high contrast mode
 */
export async function toggleHighContrast(page: Page) {
  await openAccessibilityPanel(page)

  const contrastBtn = page.locator('button').filter({ hasText: /ניגודיות|Contrast/ })
  if (await contrastBtn.count() > 0) {
    await contrastBtn.first().click()
    await page.waitForTimeout(300)
  }

  await closeAccessibilityPanel(page)
}

// ============================================================================
// CONSOLE & DEBUG HELPERS
// ============================================================================

/**
 * Log colored test step
 */
export function logStep(step: string, emoji = '▶️') {
  console.log(`${emoji} ${step}`)
}

/**
 * Log success
 */
export function logSuccess(message: string) {
  console.log(`✅ ${message}`)
}

/**
 * Log warning
 */
export function logWarning(message: string) {
  console.log(`⚠️  ${message}`)
}

/**
 * Log info
 */
export function logInfo(message: string) {
  console.log(`ℹ️  ${message}`)
}

/**
 * Generate unique test identifier
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`
}
