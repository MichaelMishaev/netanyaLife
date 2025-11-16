import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import LanguageSwitcher from '../client/LanguageSwitcher'
import PWAInstallButton from '../client/PWAInstallButton'

export default async function Header() {
  const t = await getTranslations('nav')
  const locale = await getLocale()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="text-xl font-bold text-primary-600">
          {t('home')}
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href={`/${locale}/add-business`}
            className="text-sm text-gray-600 hover:text-gray-900 sm:text-base"
          >
            {t('addBusiness')}
          </Link>
          <PWAInstallButton />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
