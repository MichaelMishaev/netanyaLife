import { prisma } from '@/lib/prisma'
import { cache } from 'react'

/**
 * CRITICAL: Search results ordering logic
 *
 * Order:
 * 1. Top X pinned businesses (is_pinned=true, ordered by pinned_order)
 * 2. Random 5 from remaining visible businesses
 * 3. Rest sorted by rating DESC, then newest
 *
 * This is HIGH-RISK - requires 100% test coverage
 */
export async function getSearchResults(params: {
  categoryId: string
  subcategoryId?: string // Optional: filter by subcategory
  neighborhoodId?: string // If null, search all Netanya
  cityId: string
  locale: string
}) {
  const { categoryId, subcategoryId, neighborhoodId, cityId, locale } = params

  // Get top pinned count setting
  const setting = await prisma.adminSettings.findUnique({
    where: { key: 'top_pinned_count' },
  })
  const topPinnedCount = setting ? parseInt(setting.value, 10) : 4

  // Build where clause
  const whereClause: any = {
    category_id: categoryId,
    city_id: cityId,
    is_visible: true,
    deleted_at: null,
  }

  if (subcategoryId) {
    whereClause.subcategory_id = subcategoryId
  }

  if (neighborhoodId) {
    whereClause.neighborhood_id = neighborhoodId
  }

  // 1. Get top X pinned businesses
  const pinnedBusinesses = await prisma.business.findMany({
    where: { ...whereClause, is_pinned: true },
    orderBy: { pinned_order: 'asc' },
    take: topPinnedCount,
    include: {
      category: { select: { name_he: true, name_ru: true, slug: true } },
      neighborhood: { select: { name_he: true, name_ru: true, slug: true } },
      reviews: {
        where: { is_approved: true },
        select: { rating: true },
      },
    },
  })

  // 2. Get all non-pinned businesses
  const nonPinnedBusinesses = await prisma.business.findMany({
    where: { ...whereClause, is_pinned: false },
    include: {
      category: { select: { name_he: true, name_ru: true, slug: true } },
      neighborhood: { select: { name_he: true, name_ru: true, slug: true } },
      reviews: {
        where: { is_approved: true },
        select: { rating: true },
      },
    },
  })

  // Calculate average ratings
  const businessesWithRatings = nonPinnedBusinesses.map((biz) => {
    const ratings = biz.reviews.map((r) => r.rating)
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0
    return { ...biz, avgRating, reviewCount: ratings.length }
  })

  // 3. Deterministic shuffle based on search params (prevents hydration errors)
  // Create a seed from categoryId + neighborhoodId for consistent "random" ordering
  const seed = `${categoryId}-${neighborhoodId || 'all'}`
  const seededRandom = (str: string, index: number) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i) + index
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash) / 2147483647 // Normalize to 0-1
  }

  const shuffled = [...businessesWithRatings].sort((a, b) => {
    const hashA = seededRandom(seed + a.id, 0)
    const hashB = seededRandom(seed + b.id, 0)
    return hashA - hashB
  })
  const random5 = shuffled.slice(0, 5)
  const rest = shuffled.slice(5)

  // 4. Sort rest by rating DESC, then newest
  const sortedRest = rest.sort((a, b) => {
    if (a.avgRating !== b.avgRating) {
      return b.avgRating - a.avgRating
    }
    return b.created_at.getTime() - a.created_at.getTime()
  })

  // Combine: pinned + random5 + sortedRest
  return [...pinnedBusinesses.map(b => ({ ...b, avgRating: 0, reviewCount: 0 })), ...random5, ...sortedRest]
}

/**
 * Get business by slug for detail page
 */
export const getBusinessBySlug = cache(async (slug: string, locale: string) => {
  const slugField = locale === 'he' ? 'slug_he' : 'slug_ru'

  return await prisma.business.findFirst({
    where: {
      [slugField]: slug,
      is_visible: true,
      deleted_at: null,
    },
    include: {
      category: {
        select: { id: true, name_he: true, name_ru: true, slug: true },
      },
      neighborhood: {
        select: { id: true, name_he: true, name_ru: true, slug: true },
      },
      reviews: {
        where: { is_approved: true },
        orderBy: { created_at: 'desc' },
        take: 20,
        select: {
          id: true,
          rating: true,
          comment_he: true,
          comment_ru: true,
          author_name: true,
          language: true,
          created_at: true,
        },
      },
    },
  })
})

/**
 * Get business count for a search
 */
export async function getSearchResultsCount(params: {
  categoryId: string
  subcategoryId?: string
  neighborhoodId?: string
  cityId: string
}) {
  const { categoryId, subcategoryId, neighborhoodId, cityId } = params

  const whereClause: any = {
    category_id: categoryId,
    city_id: cityId,
    is_visible: true,
    deleted_at: null,
  }

  if (subcategoryId) {
    whereClause.subcategory_id = subcategoryId
  }

  if (neighborhoodId) {
    whereClause.neighborhood_id = neighborhoodId
  }

  return await prisma.business.count({ where: whereClause })
}
