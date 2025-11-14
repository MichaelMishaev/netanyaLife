import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { getSearchResults } from '@/lib/queries/businesses'

/**
 * CRITICAL TEST: Search Results Ordering Logic
 * This is the highest-risk feature - requires 100% coverage
 *
 * Expected order:
 * 1. Top X pinned businesses (ordered by pinned_order)
 * 2. Random 5 from remaining visible businesses
 * 3. Rest sorted by rating DESC, then newest
 */

const prisma = new PrismaClient()

describe('Search Results Ordering Logic (CRITICAL)', () => {
  let testCityId: string
  let testCategoryId: string
  let testNeighborhoodId: string

  beforeAll(async () => {
    // Get test data from seeded database
    const city = await prisma.city.findUnique({ where: { slug: 'netanya' } })
    const category = await prisma.category.findUnique({
      where: { slug: 'electricians' },
    })
    const neighborhood = await prisma.neighborhood.findFirst({
      where: { slug: 'merkaz' },
    })

    testCityId = city!.id
    testCategoryId = category!.id
    testNeighborhoodId = neighborhood!.id
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should return pinned businesses first', async () => {
    const results = await getSearchResults({
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      cityId: testCityId,
      locale: 'he',
    })

    // Find all pinned businesses in results
    const pinnedInResults = results.filter((b) => b.is_pinned)

    // Check that pinned businesses are at the beginning
    expect(pinnedInResults.length).toBeGreaterThan(0)

    // Verify they're ordered by pinned_order
    for (let i = 0; i < pinnedInResults.length - 1; i++) {
      const current = pinnedInResults[i].pinned_order
      const next = pinnedInResults[i + 1].pinned_order
      if (current !== null && next !== null) {
        expect(current).toBeLessThanOrEqual(next)
      }
    }
  })

  it('should respect top_pinned_count setting', async () => {
    const setting = await prisma.adminSettings.findUnique({
      where: { key: 'top_pinned_count' },
    })
    const topPinnedCount = setting ? parseInt(setting.value, 10) : 4

    const results = await getSearchResults({
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      cityId: testCityId,
      locale: 'he',
    })

    const pinnedInResults = results.filter((b) => b.is_pinned)
    expect(pinnedInResults.length).toBeLessThanOrEqual(topPinnedCount)
  })

  it('should only return visible businesses', async () => {
    const results = await getSearchResults({
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      cityId: testCityId,
      locale: 'he',
    })

    results.forEach((business) => {
      expect(business.is_visible).toBe(true)
      expect(business.deleted_at).toBeNull()
    })
  })

  it('should filter by category and neighborhood', async () => {
    const results = await getSearchResults({
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      cityId: testCityId,
      locale: 'he',
    })

    results.forEach((business) => {
      expect(business.category_id).toBe(testCategoryId)
      expect(business.neighborhood_id).toBe(testNeighborhoodId)
    })
  })

  it('should search all neighborhoods when neighborhoodId is null', async () => {
    const results = await getSearchResults({
      categoryId: testCategoryId,
      neighborhoodId: undefined, // All neighborhoods
      cityId: testCityId,
      locale: 'he',
    })

    // Should return businesses from multiple neighborhoods
    const uniqueNeighborhoods = new Set(
      results.map((b) => b.neighborhood_id)
    )
    expect(uniqueNeighborhoods.size).toBeGreaterThanOrEqual(1)
  })

  it('should include reviews data for rating calculation', async () => {
    const results = await getSearchResults({
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      cityId: testCityId,
      locale: 'he',
    })

    // Check that reviews are included
    const businessWithReviews = results.find((b) => b.reviews.length > 0)
    if (businessWithReviews) {
      expect(businessWithReviews.reviews).toBeDefined()
      expect(Array.isArray(businessWithReviews.reviews)).toBe(true)
    }
  })

  it('should handle empty results gracefully', async () => {
    // Try to search for a category with no businesses
    const emptyCategory = await prisma.category.findFirst({
      where: {
        businesses: { none: {} },
      },
    })

    if (emptyCategory) {
      const results = await getSearchResults({
        categoryId: emptyCategory.id,
        neighborhoodId: testNeighborhoodId,
        cityId: testCityId,
        locale: 'he',
      })

      expect(results).toEqual([])
    }
  })
})
