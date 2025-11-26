import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import LanguageSwitcher from '../client/LanguageSwitcher'
import PWAInstallButton from '../client/PWAInstallButton'
import BusinessLoginLink from '../client/BusinessLoginLink'
import { getOwnerSession } from '@/lib/auth-owner.server'

export default async function Header() {
  const t = await getTranslations('nav')
  const locale = await getLocale()
  const ownerSession = await getOwnerSession()

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="text-xl font-bold text-primary-600 hover:text-primary-700 transition">
          {t('home')}
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <BusinessLoginLink ownerSession={ownerSession ? { name: ownerSession.name } : null} />
          <div className="h-6 w-px bg-gray-300" aria-hidden="true" />
          <PWAInstallButton />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
