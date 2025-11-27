'use client'

import { createContext, useContext, ReactNode, useRef } from 'react'

export type EventType =
  | 'search_performed'
  | 'business_viewed'
  | 'cta_clicked'
  | 'review_submitted'
  | 'business_submitted'
  | 'pwa_installed'
  | 'search_all_city_clicked'
  | 'language_changed'
  | 'accessibility_opened'
  | 'accessibility_font_changed'
  | 'accessibility_contrast_toggled'
  | 'search_form_view'
  | 'geolocation_detected'
  | 'recent_search_clicked'
  | 'geolocation_denied_default_merkaz'
  | 'geolocation_not_supported_default_merkaz'

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
  const lastEventTime = useRef<number>(0)
  const eventQueue = useRef<Set<string>>(new Set())

  const trackEvent = async (
    eventType: EventType,
    properties: EventProperties = {}
  ) => {
    try {
      // Debounce: Don't send same event more than once per second
      const eventKey = `${eventType}:${JSON.stringify(properties)}`
      const now = Date.now()

      if (eventQueue.current.has(eventKey) && now - lastEventTime.current < 1000) {
        console.log('Analytics: Event debounced', eventType)
        return
      }

      eventQueue.current.add(eventKey)
      lastEventTime.current = now

      // Clear event from queue after 1 second
      setTimeout(() => {
        eventQueue.current.delete(eventKey)
      }, 1000)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          properties,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.warn('Analytics tracking failed:', response.status, error)
      }
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
