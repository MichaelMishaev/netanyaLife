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
          <Link
            href={`/${locale}/admin`}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            title={t('admin')}
          >
            <span className="hidden sm:inline">{t('admin')}</span>
            <span className="sm:hidden">⚙️</span>
          </Link>
          <PWAInstallButton />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
