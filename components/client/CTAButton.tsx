'use client'

import { useAnalytics } from '@/contexts/AnalyticsContext'

interface CTAButtonProps {
  type: 'whatsapp' | 'call' | 'directions' | 'website'
  href: string
  businessId: string
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}

export default function CTAButton({
  type,
  href,
  businessId,
  children,
  className = '',
  ariaLabel,
}: CTAButtonProps) {
  const { trackEvent } = useAnalytics()

  const handleClick = () => {
    trackEvent('cta_clicked', {
      type,
      business_id: businessId,
    })
  }

  return (
    <a
      href={href}
      target={type === 'website' ? '_blank' : undefined}
      rel={type === 'website' ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}
