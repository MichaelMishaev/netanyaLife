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
      className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium hover:bg-gray-200"
      aria-label={locale === 'he' ? 'Switch to Russian' : 'Switch to Hebrew'}
    >
      {locale === 'he' ? 'ru' : 'he'}
    </button>
  )
}
