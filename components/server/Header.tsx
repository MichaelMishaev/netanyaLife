import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '../client/LanguageSwitcher'

export default function Header() {
  const t = useTranslations('nav')

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary-600">
          {t('home')}
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/add-business"
            className="text-gray-600 hover:text-gray-900"
          >
            {t('addBusiness')}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
