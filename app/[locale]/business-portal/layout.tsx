import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getOwnerSession } from '@/lib/auth-owner.server'
import BusinessPortalMobileMenu from '@/components/client/BusinessPortalMobileMenu'
import BusinessPortalUserMenu from '@/components/client/BusinessPortalUserMenu'
import Link from 'next/link'

// Prevent business portal pages from being indexed
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

interface LayoutProps {
  children: React.ReactNode
  params: {
    locale: string
  }
}

export default async function BusinessPortalLayout({ children, params }: LayoutProps) {
  const session = await getOwnerSession()

  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/${params.locale}/business-login`)
  }

  const locale = params.locale
  const isRTL = locale === 'he'

  const navLinks = [
    {
      href: `/${locale}/business-portal`,
      label: isRTL ? 'לוח בקרה' : 'Панель управления',
      icon: '📊',
    },
    {
      href: `/${locale}/business-portal/add`,
      label: isRTL ? 'הוסף עסק' : 'Добавить бизнес',
      icon: '➕',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand Section (Right in RTL) */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <BusinessPortalMobileMenu
                  locale={locale}
                  userName={session.name}
                  navLinks={navLinks}
                />
              </div>

              {/* Logo/Brand - Links to main site */}
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 text-primary-600 transition hover:text-primary-700"
              >
                <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {/* Mobile: Short brand name */}
                <span className="text-base font-bold sm:hidden">
                  {isRTL ? 'קהילת נתניה' : 'Netanya'}
                </span>
                {/* Desktop: Full brand with subtitle */}
                <div className="hidden flex-col sm:flex">
                  <span className="text-lg font-bold leading-tight">
                    {isRTL ? 'קהילת נתניה' : 'Сообщество Нетании'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isRTL ? 'פורטל בעלי עסקים' : 'Портал владельцев'}
                  </span>
                </div>
              </Link>
            </div>

            {/* User Section (Left in RTL) - Desktop */}
            <div className="hidden md:block">
              <BusinessPortalUserMenu
                name={session.name}
                email={session.email}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
