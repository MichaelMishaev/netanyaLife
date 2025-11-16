'use client'

import { ReactNode } from 'react'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext'

/**
 * Client-side providers wrapper
 * Ensures proper React context initialization for client components
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AnalyticsProvider>
      <AccessibilityProvider>
        <RecentlyViewedProvider>
          {children}
        </RecentlyViewedProvider>
      </AccessibilityProvider>
    </AnalyticsProvider>
  )
}
