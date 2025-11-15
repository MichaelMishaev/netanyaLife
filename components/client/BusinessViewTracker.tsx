'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext'

interface BusinessViewTrackerProps {
  businessId: string
  businessSlug: string
  businessNameHe: string
  businessNameRu: string | null
  categorySlug: string
  neighborhoodSlug: string
  source?: string
}

export default function BusinessViewTracker({
  businessId,
  businessSlug,
  businessNameHe,
  businessNameRu,
  categorySlug,
  neighborhoodSlug,
  source = 'direct',
}: BusinessViewTrackerProps) {
  const { trackEvent } = useAnalytics()
  const { addToRecentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    // Track analytics event
    trackEvent('business_viewed', {
      business_id: businessId,
      category: categorySlug,
      neighborhood: neighborhoodSlug,
      source,
    })

    // Add to recently viewed
    addToRecentlyViewed({
      id: businessId,
      slug: businessSlug,
      name_he: businessNameHe,
      name_ru: businessNameRu,
      category_slug: categorySlug,
      neighborhood_slug: neighborhoodSlug,
    })
  }, [
    businessId,
    businessSlug,
    businessNameHe,
    businessNameRu,
    categorySlug,
    neighborhoodSlug,
    source,
    trackEvent,
    addToRecentlyViewed,
  ])

  return null
}
