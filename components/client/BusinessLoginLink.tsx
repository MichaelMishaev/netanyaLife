'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

interface BusinessLoginLinkProps {
  ownerSession?: {
    name: string
  } | null
}

export default function BusinessLoginLink({ ownerSession }: BusinessLoginLinkProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')

  // Only show on main page (/{locale})
  const isMainPage = pathname === `/${locale}` || pathname === `/${locale}/`

  if (!isMainPage) {
    return null
  }

  if (ownerSession) {
    return (
      <Link
        href={`/${locale}/business-portal`}
        className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition hover:bg-primary-100 sm:text-base"
      >
        <span className="hidden sm:inline">{ownerSession.name}</span>
        <span>{locale === 'he' ? 'הפורטל שלי' : 'Мой портал'}</span>
      </Link>
    )
  }

  return (
    <Link
      href={`/${locale}/business-login`}
      className="text-sm text-gray-600 hover:text-gray-900 sm:text-base"
    >
      {t('businessLogin')}
    </Link>
  )
}
