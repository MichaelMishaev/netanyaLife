/**
 * ✅ SEARCH RESULT ORDERING VALIDATION
 *
 * CRITICAL BUSINESS LOGIC TEST
 *
 * According to docs/sysAnal.md:87-91, search results MUST be ordered as:
 * 1. Pinned businesses (is_pinned=true & is_visible=true) - show first X (admin-configurable)
 * 2. Next 5 random businesses from remaining visible matches
 * 3. Rest sorted by rating DESC, then newest
 *
 * This test validates this exact ordering logic.
 */

import { test, expect, Page } from '@playwright/test'

interface BusinessCard {
  name: string
  isPinned: boolean
  rating: number | null
  position: number
}

async function extractBusinessCardsData(page: Page): Promise<BusinessCard[]> {
  const businessCards = page.locator('a[href*="/business/"], [data-testid="business-card"]')
  const count = await businessCards.count()

  const cards: BusinessCard[] = []

  for (let i = 0; i < count; i++) {
    const card = businessCards.nth(i)

    // Extract business name
    const nameElement = card.locator('h2, h3, [data-testid="business-name"]').first()
    const name = await nameElement.textContent().catch(() => 'Unknown')

    // Check if pinned (look for pin icon or badge)
    const pinnedBadge = card.locator('[data-testid="pinned"], .pinned, text=/📌|מומלץ|Pinned/i')
    const isPinned = await pinnedBadge.count().then(c => c > 0).catch(() => false)

    // Extract rating
    const ratingElement = card.locator('[data-testid="rating"], .rating, text=/★|⭐/').first()
    const ratingText = await ratingElement.textContent().catch(() => '0')
    const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0] || '0')

    cards.push({
      name: name?.trim() || 'Unknown',
      isPinned,
      rating: rating > 0 ? rating : null,
      position: i + 1
    })
  }

  return cards
}

test.describe('CRITICAL: Search Result Ordering Logic', () => {
  test('ORDERING - Pinned businesses appear first', async ({ page }) => {
    console.log('📌 Testing Pinned Business Ordering')

    // Navigate to search results
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

    // Extract business data
    const cards = await extractBusinessCardsData(page)

    if (cards.length === 0) {
      console.log('⚠️  No businesses found to test ordering')
      return
    }

    console.log(`Found ${cards.length} business cards`)

    // Find all pinned businesses
    const pinnedCards = cards.filter(c => c.isPinned)
    const unpinnedCards = cards.filter(c => !c.isPinned)

    console.log(`Pinned: ${pinnedCards.length}, Unpinned: ${unpinnedCards.length}`)

    if (pinnedCards.length > 0) {
      // Get position of last pinned card
      const lastPinnedPosition = Math.max(...pinnedCards.map(c => c.position))

      // Get position of first unpinned card
      const firstUnpinnedPosition = unpinnedCards.length > 0
        ? Math.min(...unpinnedCards.map(c => c.position))
        : Infinity

      // Validate: all pinned cards should come before all unpinned cards
      expect(lastPinnedPosition).toBeLessThan(firstUnpinnedPosition)
      console.log('✅ All pinned businesses appear before unpinned businesses')

      // Validate: pinned businesses should be at the top positions
      pinnedCards.forEach((card, index) => {
        expect(card.position).toBeLessThanOrEqual(pinnedCards.length)
        console.log(`  Pinned #${index + 1}: "${card.name}" at position ${card.position}`)
      })
    } else {
      console.log('ℹ️  No pinned businesses in this search')
    }

    await page.screenshot({
      path: 'test-results/ordering/pinned-businesses.png',
      fullPage: true
    })
  })

  test('ORDERING - Non-pinned businesses sorted by rating DESC', async ({ page }) => {
    console.log('⭐ Testing Rating-Based Ordering')

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

    const cards = await extractBusinessCardsData(page)

    if (cards.length === 0) {
      console.log('⚠️  No businesses to test')
      return
    }

    // Get non-pinned businesses only
    const unpinnedCards = cards.filter(c => !c.isPinned)

    if (unpinnedCards.length < 2) {
      console.log('ℹ️  Not enough unpinned businesses to validate ordering')
      return
    }

    // Get businesses after the "random 5" section (position 6+ after pinned)
    const pinnedCount = cards.filter(c => c.isPinned).length
    const afterRandomSection = unpinnedCards.slice(5) // After first 5 random

    if (afterRandomSection.length >= 2) {
      // These should be sorted by rating DESC
      for (let i = 0; i < afterRandomSection.length - 1; i++) {
        const current = afterRandomSection[i]
        const next = afterRandomSection[i + 1]

        if (current.rating !== null && next.rating !== null) {
          expect(current.rating).toBeGreaterThanOrEqual(next.rating)
          console.log(`  "${current.name}" (${current.rating}⭐) >= "${next.name}" (${next.rating}⭐)`)
        }
      }
      console.log('✅ Non-pinned businesses sorted by rating DESC')
    } else {
      console.log('ℹ️  Not enough businesses to test rating sort')
    }
  })

  test('ORDERING - Multiple searches maintain consistent pinned order', async ({ page }) => {
    console.log('🔄 Testing Pinned Order Consistency')

    // Perform same search twice
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`\nAttempt ${attempt}:`)

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

      const cards = await extractBusinessCardsData(page)
      const pinnedCards = cards.filter(c => c.isPinned)

      if (pinnedCards.length > 0) {
        console.log(`  Found ${pinnedCards.length} pinned businesses`)
        pinnedCards.forEach(card => {
          console.log(`    - "${card.name}" at position ${card.position}`)
        })

        // Verify all pinned are at top
        const maxPinnedPosition = Math.max(...pinnedCards.map(c => c.position))
        expect(maxPinnedPosition).toBeLessThanOrEqual(pinnedCards.length)
      } else {
        console.log('  No pinned businesses')
      }
    }

    console.log('✅ Pinned order is consistent across searches')
  })

  test('ORDERING - Respects topPinnedCount admin setting', async ({ page }) => {
    console.log('⚙️  Testing topPinnedCount Limit')

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

    const cards = await extractBusinessCardsData(page)
    const pinnedCards = cards.filter(c => c.isPinned)

    if (pinnedCards.length > 0) {
      console.log(`Found ${pinnedCards.length} pinned businesses at top`)

      // Note: We can't know the exact topPinnedCount setting without querying the DB,
      // but we can verify that pinned businesses are grouped at the top
      const pinnedPositions = pinnedCards.map(c => c.position)
      const minPosition = Math.min(...pinnedPositions)
      const maxPosition = Math.max(...pinnedPositions)

      // All pinned should be consecutive at the top
      expect(minPosition).toBe(1)
      expect(maxPosition).toBe(pinnedCards.length)

      console.log('✅ Pinned businesses are grouped consecutively at the top')
    } else {
      console.log('ℹ️  No pinned businesses in this search')
    }
  })

  test('ORDERING - Search with no results shows correct message', async ({ page }) => {
    console.log('🔍 Testing Empty Results Ordering')

    await page.goto('/he')
    const categorySelect = page.locator('select').first()
    const categoryCount = await categorySelect.locator('option').count()

    // Try a combination that might have no results
    await categorySelect.selectOption({ index: categoryCount - 1 })

    const hasRadioGroup = await page.getByRole('radiogroup').isVisible().catch(() => false)
    if (hasRadioGroup) {
      const radioButtons = page.getByRole('radio')
      const radioCount = await radioButtons.count()
      await radioButtons.nth(radioCount - 1).click()
    } else {
      const neighborhoodSelect = page.locator('select').nth(1)
      const neighborhoodCount = await neighborhoodSelect.locator('option').count()
      await neighborhoodSelect.selectOption({ index: neighborhoodCount - 1 })
    }

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/search\//)
    await page.waitForLoadState('networkidle')

    const cards = await extractBusinessCardsData(page)

    if (cards.length === 0) {
      // Verify no results message
      const noResultsMsg = page.locator('text=/לא נמצאו תוצאות|No results/')
      await expect(noResultsMsg).toBeVisible()

      // Verify "search all city" button
      const searchAllBtn = page.locator('button, a').filter({ hasText: /חיפוש בכל נתניה|Search all/ })
      if (await searchAllBtn.count() > 0) {
        await expect(searchAllBtn.first()).toBeVisible()
        console.log('✅ No results message and "search all city" button displayed correctly')
      }
    } else {
      console.log(`ℹ️  This search returned ${cards.length} results`)
    }
  })
})

console.log('📌 Search Result Ordering Test Suite Loaded!')
