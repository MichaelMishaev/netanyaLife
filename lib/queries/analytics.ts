import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export interface AnalyticsSummary {
  totalSearches: number
  totalBusinessViews: number
  totalReviews: number
  totalCTAClicks: number
}

export interface TopItem {
  name: string
  count: number
}

export interface CTADistribution {
  whatsapp: number
  call: number
  directions: number
  website: number
}

export interface LanguageDistribution {
  he: number
  ru: number
}

export interface AccessibilityUsage {
  opened: number
  fontChanged: number
  contrastToggled: number
}

/**
 * Get analytics summary for a date range
 */
export const getAnalyticsSummary = cache(
  async (startDate: Date, endDate: Date): Promise<AnalyticsSummary> => {
    const [
      searches,
      businessViews,
      reviews,
      ctaClicks,
    ] = await Promise.all([
      prisma.event.count({
        where: {
          type: 'search_performed',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'business_viewed',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'review_submitted',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'cta_clicked',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
    ])

    return {
      totalSearches: searches,
      totalBusinessViews: businessViews,
      totalReviews: reviews,
      totalCTAClicks: ctaClicks,
    }
  }
)

/**
 * Get top categories by search volume
 */
export const getTopCategories = cache(
  async (startDate: Date, endDate: Date, limit = 10): Promise<TopItem[]> => {
    const events = await prisma.event.findMany({
      where: {
        type: 'search_performed',
        created_at: { gte: startDate, lte: endDate },
      },
      select: {
        properties: true,
      },
    })

    // Count categories
    const categoryCounts = new Map<string, number>()

    for (const event of events) {
      const category = (event.properties as any)?.category
      if (category) {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
      }
    }

    // Convert to array and sort
    const topCategories = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return topCategories
  }
)

/**
 * Get top neighborhoods by search volume
 */
export const getTopNeighborhoods = cache(
  async (startDate: Date, endDate: Date, limit = 10): Promise<TopItem[]> => {
    const events = await prisma.event.findMany({
      where: {
        type: 'search_performed',
        created_at: { gte: startDate, lte: endDate },
      },
      select: {
        properties: true,
      },
    })

    // Count neighborhoods
    const neighborhoodCounts = new Map<string, number>()

    for (const event of events) {
      const neighborhood = (event.properties as any)?.neighborhood
      if (neighborhood) {
        neighborhoodCounts.set(
          neighborhood,
          (neighborhoodCounts.get(neighborhood) || 0) + 1
        )
      }
    }

    // Convert to array and sort
    const topNeighborhoods = Array.from(neighborhoodCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return topNeighborhoods
  }
)

/**
 * Get CTA distribution (WhatsApp, Call, Directions, Website)
 */
export const getCTADistribution = cache(
  async (startDate: Date, endDate: Date): Promise<CTADistribution> => {
    const events = await prisma.event.findMany({
      where: {
        type: 'cta_clicked',
        created_at: { gte: startDate, lte: endDate },
      },
      select: {
        properties: true,
      },
    })

    const distribution: CTADistribution = {
      whatsapp: 0,
      call: 0,
      directions: 0,
      website: 0,
    }

    for (const event of events) {
      const type = (event.properties as any)?.type
      if (type && type in distribution) {
        distribution[type as keyof CTADistribution]++
      }
    }

    return distribution
  }
)

/**
 * Get language distribution
 */
export const getLanguageDistribution = cache(
  async (startDate: Date, endDate: Date): Promise<LanguageDistribution> => {
    const events = await prisma.event.findMany({
      where: {
        type: 'search_performed',
        created_at: { gte: startDate, lte: endDate },
      },
      select: {
        properties: true,
      },
    })

    const distribution: LanguageDistribution = {
      he: 0,
      ru: 0,
    }

    for (const event of events) {
      const language = (event.properties as any)?.language
      if (language === 'he') distribution.he++
      else if (language === 'ru') distribution.ru++
    }

    return distribution
  }
)

/**
 * Get accessibility feature usage
 */
export const getAccessibilityUsage = cache(
  async (startDate: Date, endDate: Date): Promise<AccessibilityUsage> => {
    const [opened, fontChanged, contrastToggled] = await Promise.all([
      prisma.event.count({
        where: {
          type: 'accessibility_opened',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'accessibility_font_changed',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'accessibility_contrast_toggled',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
    ])

    return {
      opened,
      fontChanged,
      contrastToggled,
    }
  }
)
