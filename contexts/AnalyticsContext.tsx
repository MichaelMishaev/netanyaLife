'use client'

import { createContext, useContext, ReactNode } from 'react'

export type EventType =
  | 'search_performed'
  | 'business_viewed'
  | 'cta_clicked'
  | 'review_submitted'
  | 'business_submitted'
  | 'pwa_installed'
  | 'accessibility_opened'
  | 'accessibility_font_changed'
  | 'accessibility_contrast_toggled'
  | 'share_clicked'
  | 'recently_viewed_clicked'
  | 'search_all_city_clicked'
  | 'language_changed'

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

interface AnalyticsContextType {
  trackEvent: (eventType: EventType, properties?: EventProperties) => Promise<void>
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const trackEvent = async (
    eventType: EventType,
    properties: EventProperties = {}
  ) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          properties,
        }),
      })
    } catch (error) {
      // Silently fail - don't block user experience
      console.error('Failed to track event:', error)
    }
  }

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within AnalyticsProvider')
  }
  return context
}
