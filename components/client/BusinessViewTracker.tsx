'use client'

import { useEffect, useRef } from 'react'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext'

interface BusinessViewTrackerProps {
  businessId: string
  businessSlug: string
  businessNameHe: string
  businessNameRu: string | null
  categorySlug: string
  categoryNameHe: string
  categoryNameRu: string
  neighborhoodSlug: string
  neighborhoodNameHe: string
  neighborhoodNameRu: string
  source?: string
}

export default function BusinessViewTracker({
  businessId,
  businessSlug,
  businessNameHe,
  businessNameRu,
  categorySlug,
  categoryNameHe,
  categoryNameRu,
  neighborhoodSlug,
  neighborhoodNameHe,
  neighborhoodNameRu,
  source = 'direct',
}: BusinessViewTrackerProps) {
  const { trackEvent } = useAnalytics()
  const { addToRecentlyViewed } = useRecentlyViewed()
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per component mount
    if (hasTracked.current) return

    hasTracked.current = true

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
      category_name_he: categoryNameHe,
      category_name_ru: categoryNameRu,
      neighborhood_slug: neighborhoodSlug,
      neighborhood_name_he: neighborhoodNameHe,
      neighborhood_name_ru: neighborhoodNameRu,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]) // Only re-run if businessId changes

  return null
}
