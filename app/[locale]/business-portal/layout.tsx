import { redirect } from 'next/navigation'
import { getOwnerSession } from '@/lib/auth-owner.server'
import Link from 'next/link'
import BusinessPortalMobileMenu from '@/components/client/BusinessPortalMobileMenu'

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
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left Side: Mobile Menu + Desktop Navigation */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button - Now on the left */}
              <BusinessPortalMobileMenu
                locale={locale}
                userName={session.name}
                navLinks={navLinks}
              />

              {/* Desktop Navigation */}
              <nav className="hidden items-center gap-1 md:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Portal Badge */}
              <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                {isRTL ? 'פורטל בעלי עסקים' : 'Портал владельцев'}
              </span>

              {/* User Menu - Desktop */}
              <div className="hidden items-center gap-3 md:flex">
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {session.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {session.name}
                  </span>
                </div>

                <form action="/api/auth/owner/logout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{isRTL ? 'התנתק' : 'Выйти'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
