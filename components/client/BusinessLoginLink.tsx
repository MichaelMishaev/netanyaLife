'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

interface BusinessLoginLinkProps {
  ownerSession?: {
    name: string
  } | null
}

export default function BusinessLoginLink({ ownerSession }: BusinessLoginLinkProps) {
  const locale = useLocale()
  const t = useTranslations('nav')

  if (ownerSession) {
    return (
      <Link
        href={`/${locale}/business-portal`}
        className="flex items-center gap-1.5 rounded-md bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-100 sm:px-3 sm:py-1 sm:text-sm"
      >
        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden sm:inline">{ownerSession.name}</span>
        <span className="sm:hidden">{locale === 'he' ? 'פורטל' : 'Портал'}</span>
      </Link>
    )
  }

  return (
    <Link
      href={`/${locale}/business-login`}
      className="flex items-center gap-1.5 rounded-md bg-primary-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:px-3 sm:py-1 sm:text-sm"
    >
      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>
      <span className="hidden sm:inline">{t('businessLogin')}</span>
      <span className="sm:hidden">{locale === 'he' ? 'עסקים' : 'Бизнес'}</span>
    </Link>
  )
}
