'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  locale: string
  label?: string
  className?: string
}

export default function BackButton({
  href,
  locale,
  label,
  className = '',
}: BackButtonProps) {
  const router = useRouter()
  const arrow = locale === 'he' ? '→' : '←'
  const defaultLabel = locale === 'he' ? 'חזרה' : 'Назад'
  const displayLabel = label || defaultLabel

  // If href provided, use Link; otherwise use router.back()
  if (href) {
    return (
      <Link
        href={href}
        className={`mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 ${className}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {displayLabel}
      </Link>
    )
  }

  return (
    <button
      onClick={() => router.back()}
      className={`mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 ${className}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {displayLabel}
    </button>
  )
}
