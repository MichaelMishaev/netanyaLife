'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface ConditionalHeaderProps {
  children: ReactNode
}

export default function ConditionalHeader({ children }: ConditionalHeaderProps) {
  const pathname = usePathname()

  // Hide header on admin and business-portal routes (they have their own headers)
  const isAdminRoute = pathname.includes('/admin')
  const isBusinessPortalRoute = pathname.includes('/business-portal')

  if (isAdminRoute || isBusinessPortalRoute) {
    return null
  }

  return <>{children}</>
}
