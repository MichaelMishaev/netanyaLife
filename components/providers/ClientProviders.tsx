'use client'

import { ReactNode } from 'react'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

/**
 * Client-side providers wrapper
 * Ensures proper React context initialization for client components
 */
export function ClientProviders({
  children,
  locale = 'he'
}: {
  children: ReactNode
  locale?: string
}) {
  return (
    <NotificationProvider locale={locale}>
      <AnalyticsProvider>
        <AccessibilityProvider>
          <RecentlyViewedProvider>
            {children}
          </RecentlyViewedProvider>
        </AccessibilityProvider>
      </AnalyticsProvider>
    </NotificationProvider>
  )
}
