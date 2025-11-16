'use client'

import Link from 'next/link'

interface BackButtonProps {
  href: string
  locale: string
  label: string
  className?: string
}

export default function BackButton({
  href,
  locale,
  label,
  className = '',
}: BackButtonProps) {
  const arrow = locale === 'he' ? '→' : '←'

  return (
    <Link
      href={href}
      className={`mb-4 inline-block text-primary-600 hover:text-primary-700 ${className}`}
    >
      {arrow} {label}
    </Link>
  )
}
