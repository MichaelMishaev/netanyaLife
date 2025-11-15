'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/contexts/AnalyticsContext'

interface BusinessViewTrackerProps {
  businessId: string
  categorySlug: string
  neighborhoodSlug: string
  source?: string
}

export default function BusinessViewTracker({
  businessId,
  categorySlug,
  neighborhoodSlug,
  source = 'direct',
}: BusinessViewTrackerProps) {
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent('business_viewed', {
      business_id: businessId,
      category: categorySlug,
      neighborhood: neighborhoodSlug,
      source,
    })
  }, [businessId, categorySlug, neighborhoodSlug, source, trackEvent])

  return null
}
