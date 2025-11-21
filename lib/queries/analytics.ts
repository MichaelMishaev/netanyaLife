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
          type: 'SEARCH_PERFORMED',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'BUSINESS_VIEWED',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'REVIEW_SUBMITTED',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'CTA_CLICKED',
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
        type: 'SEARCH_PERFORMED',
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
        type: 'SEARCH_PERFORMED',
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
        type: 'CTA_CLICKED',
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
        type: 'SEARCH_PERFORMED',
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
          type: 'ACCESSIBILITY_OPENED',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'ACCESSIBILITY_FONT_CHANGED',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          type: 'ACCESSIBILITY_CONTRAST_TOGGLED',
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

/**
 * Drill-down interfaces and queries
 */

export interface SearchDetail {
  id: string
  category: string
  neighborhood: string
  resultsCount: number
  language: string
  timestamp: Date
}

export interface BusinessViewDetail {
  id: string
  businessId: string
  businessName: string
  category: string
  neighborhood: string
  source: string
  timestamp: Date
}

export interface ReviewDetail {
  id: string
  businessId: string
  businessName: string
  rating: number
  comment: string | null
  timestamp: Date
}

export interface CTAClickDetail {
  id: string
  businessId: string
  businessName: string
  type: 'whatsapp' | 'call' | 'directions' | 'website'
  timestamp: Date
}

/**
 * Get detailed search events with total count
 */
export const getSearchDetails = cache(
  async (
    startDate: Date,
    endDate: Date,
    limit = 50,
    offset = 0,
    filters?: { category?: string; neighborhood?: string }
  ): Promise<{ data: SearchDetail[]; total: number }> => {
    const where: any = {
      type: 'SEARCH_PERFORMED',
      created_at: { gte: startDate, lte: endDate },
    }

    // Fetch all events for counting (with filters applied)
    const allEvents = await prisma.event.findMany({
      where,
      select: {
        id: true,
        properties: true,
        language: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Map and filter
    let allResults = allEvents.map((event) => {
      const props = event.properties as any
      return {
        id: event.id,
        category: props?.category || 'Unknown',
        neighborhood: props?.neighborhood || 'Unknown',
        resultsCount: props?.resultsCount || 0,
        language: props?.language || event.language || 'Unknown',
        timestamp: event.created_at,
      }
    })

    // Apply client-side filtering (since properties is JSON)
    if (filters?.category) {
      allResults = allResults.filter((r) =>
        r.category.toLowerCase().includes(filters.category!.toLowerCase())
      )
    }
    if (filters?.neighborhood) {
      allResults = allResults.filter((r) =>
        r.neighborhood.toLowerCase().includes(filters.neighborhood!.toLowerCase())
      )
    }

    const total = allResults.length
    const data = allResults.slice(offset, offset + limit)

    return { data, total }
  }
)

/**
 * Get detailed business view events with total count
 */
export const getBusinessViewDetails = cache(
  async (
    startDate: Date,
    endDate: Date,
    limit = 50,
    offset = 0,
    filters?: { businessName?: string }
  ): Promise<{ data: BusinessViewDetail[]; total: number }> => {
    const allEvents = await prisma.event.findMany({
      where: {
        type: 'BUSINESS_VIEWED',
        created_at: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        business_id: true,
        properties: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    let allResults = allEvents.map((event) => {
      const props = event.properties as any
      return {
        id: event.id,
        businessId: event.business_id || 'Unknown',
        businessName: props?.businessName || 'Unknown',
        category: props?.category || 'Unknown',
        neighborhood: props?.neighborhood || 'Unknown',
        source: props?.source || 'direct',
        timestamp: event.created_at,
      }
    })

    // Apply client-side filtering
    if (filters?.businessName) {
      allResults = allResults.filter((r) =>
        r.businessName.toLowerCase().includes(filters.businessName!.toLowerCase())
      )
    }

    const total = allResults.length
    const data = allResults.slice(offset, offset + limit)

    return { data, total }
  }
)

/**
 * Get detailed review events with total count
 */
export const getReviewDetails = cache(
  async (
    startDate: Date,
    endDate: Date,
    limit = 50,
    offset = 0,
    filters?: { businessName?: string }
  ): Promise<{ data: ReviewDetail[]; total: number }> => {
    const allEvents = await prisma.event.findMany({
      where: {
        type: 'REVIEW_SUBMITTED',
        created_at: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        business_id: true,
        properties: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    let allResults = allEvents.map((event) => {
      const props = event.properties as any
      return {
        id: event.id,
        businessId: event.business_id || 'Unknown',
        businessName: props?.businessName || 'Unknown',
        rating: props?.rating || 0,
        comment: props?.comment || null,
        timestamp: event.created_at,
      }
    })

    // Apply client-side filtering
    if (filters?.businessName) {
      allResults = allResults.filter((r) =>
        r.businessName.toLowerCase().includes(filters.businessName!.toLowerCase())
      )
    }

    const total = allResults.length
    const data = allResults.slice(offset, offset + limit)

    return { data, total }
  }
)

/**
 * Get detailed CTA click events with total count
 */
export const getCTAClickDetails = cache(
  async (
    startDate: Date,
    endDate: Date,
    limit = 50,
    offset = 0,
    filters?: { businessName?: string }
  ): Promise<{ data: CTAClickDetail[]; total: number }> => {
    const allEvents = await prisma.event.findMany({
      where: {
        type: 'CTA_CLICKED',
        created_at: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        business_id: true,
        properties: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    let allResults = allEvents.map((event) => {
      const props = event.properties as any
      return {
        id: event.id,
        businessId: event.business_id || 'Unknown',
        businessName: props?.businessName || 'Unknown',
        type: props?.type || 'call',
        timestamp: event.created_at,
      }
    })

    // Apply client-side filtering
    if (filters?.businessName) {
      allResults = allResults.filter((r) =>
        r.businessName.toLowerCase().includes(filters.businessName!.toLowerCase())
      )
    }

    const total = allResults.length
    const data = allResults.slice(offset, offset + limit)

    return { data, total }
  }
)
