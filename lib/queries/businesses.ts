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
  neighborhoodId?: string // If null, search all Netanya
  cityId: string
  locale: string
}) {
  const { categoryId, neighborhoodId, cityId, locale } = params

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

  // 3. Random 5 from non-pinned
  const shuffled = [...businessesWithRatings].sort(() => Math.random() - 0.5)
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
  neighborhoodId?: string
  cityId: string
}) {
  const { categoryId, neighborhoodId, cityId } = params

  const whereClause: any = {
    category_id: categoryId,
    city_id: cityId,
    is_visible: true,
    deleted_at: null,
  }

  if (neighborhoodId) {
    whereClause.neighborhood_id = neighborhoodId
  }

  return await prisma.business.count({ where: whereClause })
}
