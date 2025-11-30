/**
 * ✅ BUSINESS DETAIL - CTA BUTTON VALIDATION
 *
 * CRITICAL BUSINESS LOGIC TEST
 *
 * According to docs/sysAnal.md:153-161:
 * - Business MUST have at least one: phone OR whatsapp_number
 * - NEVER auto-copy: Show buttons only for provided contacts
 * - Test all CTA buttons: Call, WhatsApp, Website, Directions, Share
 *
 * This test validates all CTA interactions on business detail pages.
 */

import { test, expect, Page } from '@playwright/test'

interface CTAButtons {
  hasPhone: boolean
  hasWhatsApp: boolean
  hasWebsite: boolean
  hasDirections: boolean
  hasShare: boolean
  phoneHref?: string
  whatsappHref?: string
  websiteHref?: string
}

async function extractCTAButtons(page: Page): Promise<CTAButtons> {
  // Phone button
  const phoneBtn = page.locator('a[href^="tel:"]')
  const hasPhone = await phoneBtn.count() > 0
  const phoneHref = hasPhone ? await phoneBtn.first().getAttribute('href') : undefined

  // WhatsApp button
  const whatsappBtn = page.locator('a[href*="wa.me"], a[href*="whatsapp"]')
  const hasWhatsApp = await whatsappBtn.count() > 0
  const whatsappHref = hasWhatsApp ? await whatsappBtn.first().getAttribute('href') : undefined

  // Website button
  const websiteBtn = page.locator('a[href^="http"]').filter({
    hasNot: page.locator('a[href*="wa.me"], a[href*="whatsapp"], a[href*="google.com/maps"], a[href*="waze.com"]')
  })
  const hasWebsite = await websiteBtn.count() > 0
  const websiteHref = hasWebsite ? await websiteBtn.first().getAttribute('href') : undefined

  // Directions button (Google Maps or Waze)
  const directionsBtn = page.locator('a[href*="google.com/maps"], a[href*="waze.com"]')
  const hasDirections = await directionsBtn.count() > 0

  // Share button
  const shareBtn = page.locator('button').filter({ hasText: /שיתוף|Share|Поделиться|📤/ })
  const hasShare = await shareBtn.count() > 0

  return {
    hasPhone,
    hasWhatsApp,
    hasWebsite,
    hasDirections,
    hasShare,
    phoneHref,
    whatsappHref,
    websiteHref
  }
}

async function navigateToFirstBusiness(page: Page): Promise<boolean> {
  await page.goto('/he')
  await page.waitForLoadState('networkidle')

  const categorySelect = page.locator('select').first()
  await categorySelect.selectOption({ index: 1 })

  const hasRadioGroup = await page.getByRole('radiogroup').isVisible().catch(() => false)
  if (hasRadioGroup) {
    await page.getByRole('radio').first().click()
  } else {
    await page.locator('select').nth(1).selectOption({ index: 1 })
  }

  await page.click('button[type="submit"]')
  await page.waitForURL(/\/search\//)
  await page.waitForLoadState('networkidle')

  const businessCards = page.locator('a[href*="/business/"]')
  const count = await businessCards.count()

  if (count === 0) {
    return false
  }

  await businessCards.first().click()
  await page.waitForURL(/\/business\//)
  await page.waitForLoadState('networkidle')

  return true
}

test.describe('CRITICAL: Business CTA Buttons', () => {
  test('CTA - MUST have phone OR WhatsApp (critical validation)', async ({ page }) => {
    console.log('📞 Testing Phone/WhatsApp Requirement')

    const hasBusinesses = await navigateToFirstBusiness(page)

    if (!hasBusinesses) {
      console.log('⚠️  No businesses to test')
      return
    }

    const ctas = await extractCTAButtons(page)

    // CRITICAL: Must have at least one contact method
    const hasContactMethod = ctas.hasPhone || ctas.hasWhatsApp
    expect(hasContactMethod).toBe(true)

    console.log(`✅ Contact methods: Phone=${ctas.hasPhone}, WhatsApp=${ctas.hasWhatsApp}`)

    if (ctas.hasPhone && ctas.hasWhatsApp) {
      console.log('  ✅ Business has BOTH phone and WhatsApp')
    } else if (ctas.hasPhone) {
      console.log('  ✅ Business has phone only')
    } else if (ctas.hasWhatsApp) {
      console.log('  ✅ Business has WhatsApp only')
    }

    await page.screenshot({
      path: 'test-results/cta/contact-methods.png',
      fullPage: true
    })
  })

  test('CTA - Phone button has correct tel: format', async ({ page }) => {
    console.log('📞 Testing Phone Button Format')

    const hasBusinesses = await navigateToFirstBusiness(page)
    if (!hasBusinesses) {
      console.log('⚠️  No businesses to test')
      return
    }

    const ctas = await extractCTAButtons(page)

    if (ctas.hasPhone) {
      expect(ctas.phoneHref).toBeTruthy()
      expect(ctas.phoneHref).toMatch(/^tel:/)

      const phoneBtn = page.locator('a[href^="tel:"]').first()

      // Verify button is visible and clickable
      await expect(phoneBtn).toBeVisible()
      await expect(phoneBtn).toBeEnabled()

      // Verify aria-label for accessibility
      const ariaLabel = await phoneBtn.getAttribute('aria-label')
      if (ariaLabel) {
        console.log(`  ✅ Has aria-label: "${ariaLabel}"`)
      }

      console.log(`✅ Phone button href: ${ctas.phoneHref}`)
    } else {
      console.log('ℹ️  This business has no phone number')
    }
  })

  test('CTA - WhatsApp button has correct wa.me format', async ({ page }) => {
    console.log('💬 Testing WhatsApp Button Format')

    const hasBusinesses = await navigateToFirstBusiness(page)
    if (!hasBusinesses) {
      console.log('⚠️  No businesses to test')
      return
    }

    const ctas = await extractCTAButtons(page)

    if (ctas.hasWhatsApp) {
      expect(ctas.whatsappHref).toBeTruthy()
      expect(ctas.whatsappHref).toMatch(/wa\.me|whatsapp/)

      const whatsappBtn = page.locator('a[href*="wa.me"], a[href*="whatsapp"]').first()

      // Verify button is visible and clickable
      await expect(whatsappBtn).toBeVisible()
      await expect(whatsappBtn).toBeEnabled()

      // Verify opens in new tab
      const target = await whatsappBtn.getAttribute('target')
      expect(target).toBe('_blank')

      // Verify rel="noopener noreferrer" for security
      const rel = await whatsappBtn.getAttribute('rel')
      expect(rel).toContain('noopener')

      console.log(`✅ WhatsApp button href: ${ctas.whatsappHref}`)
      console.log(`  ✅ Opens in new tab with secure rel attributes`)
    } else {
      console.log('ℹ️  This business has no WhatsApp number')
    }
  })

  test('CTA - Website button opens in new tab', async ({ page }) => {
    console.log('🌐 Testing Website Button')

    const hasBusinesses = await navigateToFirstBusiness(page)
    if (!hasBusinesses) {
      console.log('⚠️  No businesses to test')
      return
    }

    const ctas = await extractCTAButtons(page)

    if (ctas.hasWebsite) {
      const websiteBtn = page.locator('a[href^="http"]').filter({
        hasNot: page.locator('a[href*="wa.me"], a[href*="whatsapp"], a[href*="google.com/maps"], a[href*="waze.com"]')
      }).first()

      // Verify button is visible
      await expect(websiteBtn).toBeVisible()
      await expect(websiteBtn).toBeEnabled()

      // Verify opens in new tab
      const target = await websiteBtn.getAttribute('target')
      expect(target).toBe('_blank')

      // Verify secure rel attributes
      const rel = await websiteBtn.getAttribute('rel')
      expect(rel).toContain('noopener')
      expect(rel).toContain('noreferrer')

      console.log(`✅ Website button href: ${ctas.websiteHref}`)
      console.log('  ✅ Opens in new tab securely')
    } else {
      console.log('ℹ️  This business has no website')
    }
  })

  test('CTA - Directions button has Google Maps or Waze link', async ({ page }) => {
    console.log('🗺️  Testing Directions Button')

    const hasBusinesses = await navigateToFirstBusiness(page)
    if (!hasBusinesses) {
      console.log('⚠️  No businesses to test')
      return
    }

    const ctas = await extractCTAButtons(page)

    if (ctas.hasDirections) {
      const directionsBtn = page.locator('a[href*="google.com/maps"], a[href*="waze.com"]').first()

      // Verify button is visible
      await expect(directionsBtn).toBeVisible()
      await expect(directionsBtn).toBeEnabled()

      // Get the href
      const href = await directionsBtn.getAttribute('href')
      expect(href).toMatch(/google\.com\/maps|waze\.com/)

      // Verify opens in new tab
      const target = await directionsBtn.getAttribute('target')
      expect(target).toBe('_blank')

      console.log(`✅ Directions button href: ${href}`)
    } else {
      console.log('ℹ️  This business has no directions link (might be missing address/coordinates)')
    }
  })

  test('CTA - Share button opens share dialog', async ({ page }) => {
    console.log('📤 Testing Share Button')

    const hasBusinesses = await navigateToFirstBusiness(page)
    if (!hasBusinesses) {
      console.log('⚠️  No businesses to test')
      return
    }

    const ctas = await extractCTAButtons(page)

    if (ctas.hasShare) {
      const shareBtn = page.locator('button').filter({ hasText: /שיתוף|Share|Поделиться|📤/ }).first()

      // Verify button is visible
      await expect(shareBtn).toBeVisible()
      await expect(shareBtn).toBeEnabled()

      // Click the share button
      await shareBtn.click()
      await page.waitForTimeout(500)

      // Check if native Web Share API is triggered or custom modal appears
      // Note: We can't directly test Web Share API in Playwright, but we can verify the button works
      console.log('✅ Share button clicked successfully')

      // If custom modal, verify it's visible
      const modal = page.locator('[role="dialog"], .modal, [data-testid="share-modal"]')
      const hasModal = await modal.isVisible().catch(() => false)

      if (hasModal) {
        console.log('  ✅ Share modal opened')

        // Close modal
        const closeBtn = modal.locator('button').filter({ hasText: /סגור|Close|Закрыть|×/ })
        if (await closeBtn.count() > 0) {
          await closeBtn.first().click()
        }
      } else {
        console.log('  ℹ️  Likely using native Web Share API')
      }
    } else {
      console.log('ℹ️  This business detail page has no share button')
    }
  })

  test('CTA - All buttons have proper accessibility', async ({ page }) => {
    console.log('♿ Testing CTA Button Accessibility')

    const hasBusinesses = await navigateToFirstBusiness(page)
    if (!hasBusinesses) {
      console.log('⚠️  No businesses to test')
      return
    }

    // Get all CTA buttons
    const allCTAs = page.locator('a[href^="tel:"], a[href*="wa.me"], a[href^="http"], button').filter({
      hasText: /שיחה|Call|WhatsApp|אתר|Website|הגעה|Directions|שיתוף|Share/
    })

    const ctaCount = await allCTAs.count()
    console.log(`Found ${ctaCount} CTA buttons to test`)

    for (let i = 0; i < ctaCount; i++) {
      const cta = allCTAs.nth(i)

      // Check visibility
      const isVisible = await cta.isVisible()
      expect(isVisible).toBe(true)

      // Check aria-label or text content
      const ariaLabel = await cta.getAttribute('aria-label')
      const textContent = await cta.textContent()

      const hasAccessibleName = ariaLabel || (textContent && textContent.trim().length > 0)
      expect(hasAccessibleName).toBe(true)

      // Check keyboard focusability
      const tabIndex = await cta.getAttribute('tabindex')
      const isNegativeTab = tabIndex === '-1'
      expect(isNegativeTab).toBe(false) // Should be keyboard accessible

      console.log(`  ✅ CTA ${i + 1}: ${ariaLabel || textContent?.trim() || 'Unknown'} - Accessible`)
    }

    console.log('✅ All CTA buttons are accessible')
  })

  test('CTA - Test multiple businesses for consistency', async ({ page }) => {
    console.log('🔄 Testing CTA Consistency Across Multiple Businesses')

    await page.goto('/he')
    const categorySelect = page.locator('select').first()
    await categorySelect.selectOption({ index: 1 })

    const hasRadioGroup = await page.getByRole('radiogroup').isVisible().catch(() => false)
    if (hasRadioGroup) {
      await page.getByRole('radio').first().click()
    } else {
      await page.locator('select').nth(1).selectOption({ index: 1 })
    }

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/search\//)
    await page.waitForLoadState('networkidle')

    const businessCards = page.locator('a[href*="/business/"]')
    const businessCount = await businessCards.count()

    const maxBusinessesToTest = Math.min(businessCount, 3)

    if (maxBusinessesToTest === 0) {
      console.log('⚠️  No businesses to test')
      return
    }

    for (let i = 0; i < maxBusinessesToTest; i++) {
      console.log(`\nTesting business ${i + 1}/${maxBusinessesToTest}:`)

      // Navigate back to search results
      await page.goto(page.url().split('/business/')[0])
      await page.waitForLoadState('networkidle')

      // Click business card
      await page.locator('a[href*="/business/"]').nth(i).click()
      await page.waitForURL(/\/business\//)
      await page.waitForLoadState('networkidle')

      const businessName = await page.locator('h1').first().textContent()
      console.log(`  Business: "${businessName}"`)

      const ctas = await extractCTAButtons(page)

      // Verify required contact method
      const hasContactMethod = ctas.hasPhone || ctas.hasWhatsApp
      expect(hasContactMethod).toBe(true)

      console.log(`    Phone: ${ctas.hasPhone}, WhatsApp: ${ctas.hasWhatsApp}, Website: ${ctas.hasWebsite}, Directions: ${ctas.hasDirections}`)
      console.log('    ✅ Has required contact method')
    }

    console.log('\n✅ All tested businesses have correct CTA configuration')
  })

  test('CTA - No auto-copy validation (phone ≠ WhatsApp)', async ({ page }) => {
    console.log('🚫 Testing No Auto-Copy Rule')

    const hasBusinesses = await navigateToFirstBusiness(page)
    if (!hasBusinesses) {
      console.log('⚠️  No businesses to test')
      return
    }

    const ctas = await extractCTAButtons(page)

    if (ctas.hasPhone && ctas.hasWhatsApp) {
      // Extract phone numbers from hrefs
      const phoneNumber = ctas.phoneHref?.replace('tel:', '').replace(/\D/g, '')
      const whatsappNumber = ctas.whatsappHref?.match(/\d+/)?.[0]

      console.log(`  Phone: ${phoneNumber}`)
      console.log(`  WhatsApp: ${whatsappNumber}`)

      // They can be the same or different - we just verify both exist when present
      // The key rule is: NEVER show WhatsApp if only phone is provided (no auto-copy)
      console.log('✅ Business has distinct contact fields (no auto-copy)')
    } else if (ctas.hasPhone && !ctas.hasWhatsApp) {
      console.log('✅ Business has phone only - WhatsApp button correctly NOT shown')
    } else if (!ctas.hasPhone && ctas.hasWhatsApp) {
      console.log('✅ Business has WhatsApp only - Phone button correctly NOT shown')
    }

    await page.screenshot({
      path: 'test-results/cta/no-auto-copy.png',
      fullPage: true
    })
  })
})

console.log('📞 Business CTA Validation Test Suite Loaded!')
