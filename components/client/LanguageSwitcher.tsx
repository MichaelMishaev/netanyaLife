'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { locales } from '@/i18n/request'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = () => {
    const newLocale = locale === 'he' ? 'ru' : 'he'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <button
      onClick={switchLocale}
      className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-gray-200 sm:px-3 sm:py-1 sm:text-sm"
      aria-label={locale === 'he' ? 'Switch to Russian' : 'Switch to Hebrew'}
    >
      {locale === 'he' ? 'RU' : 'HE'}
    </button>
  )
}
