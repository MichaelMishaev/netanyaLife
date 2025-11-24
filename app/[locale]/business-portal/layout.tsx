import { redirect } from 'next/navigation'
import { getOwnerSession } from '@/lib/auth-owner.server'
import BusinessPortalMobileMenu from '@/components/client/BusinessPortalMobileMenu'
import Link from 'next/link'

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
                  {isRTL ? 'נתניה לוקאל' : 'Netanya'}
                </span>
                {/* Desktop: Full brand with subtitle */}
                <div className="hidden flex-col sm:flex">
                  <span className="text-lg font-bold leading-tight">
                    {isRTL ? 'נתניה לוקאל' : 'Netanya Local'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isRTL ? 'פורטל בעלי עסקים' : 'Портал владельцев'}
                  </span>
                </div>
              </Link>
            </div>

            {/* User Section (Left in RTL) */}
            <div className="flex items-center gap-2">
              {/* User Info - Desktop */}
              <div className="hidden items-center gap-3 rounded-lg bg-gray-50 px-3 py-1.5 md:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {session.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{session.name}</span>
                  <span className="text-xs text-gray-500">
                    {isRTL ? 'בעל עסק' : 'Владелец'}
                  </span>
                </div>
              </div>

              {/* Logout Button - Desktop */}
              <form action="/api/auth/owner/logout" method="POST" className="hidden md:block">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                  title={isRTL ? 'התנתק' : 'Выйти'}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
