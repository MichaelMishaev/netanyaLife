import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLogoutButton from '@/components/client/AdminLogoutButton'
import AdminMobileMenu from '@/components/client/AdminMobileMenu'

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Check authentication - login page is now in (auth) route group so bypasses this layout
  const session = await getSession()

  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/${locale}/admin-login`)
  }

  // Render full admin layout for authenticated pages
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 lg:gap-4 lg:py-4">
          {/* Left: Mobile Menu + Title */}
          <div className="flex items-center gap-2 lg:gap-4">
            <AdminMobileMenu locale={locale} />
            <h1 className="text-base font-bold text-gray-900 lg:text-xl">
              {locale === 'he' ? 'ניהול מערכת' : 'Панель'}
            </h1>

            {/* Desktop Navigation - Hidden on Mobile */}
            <nav className="hidden gap-4 lg:flex xl:gap-6">
              <Link
                href={`/${locale}/admin`}
                className="whitespace-nowrap text-sm text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'ראשי' : 'Главная'}
              </Link>
              <Link
                href={`/${locale}/admin/pending`}
                className="whitespace-nowrap text-sm text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'ממתינים' : 'Ожидают'}
              </Link>
              <Link
                href={`/${locale}/admin/category-requests`}
                className="whitespace-nowrap text-sm text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'קטגוריות' : 'Категории'}
              </Link>
              <Link
                href={`/${locale}/admin/businesses`}
                className="whitespace-nowrap text-sm text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'עסקים' : 'Бизнесы'}
              </Link>
              <Link
                href={`/${locale}/admin/analytics`}
                className="whitespace-nowrap text-sm text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'ניתוח' : 'Аналитика'}
              </Link>
              <Link
                href={`/${locale}/admin/settings`}
                className="whitespace-nowrap text-sm text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'הגדרות' : 'Настройки'}
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Email - Hidden on small mobile */}
            <span className="hidden text-sm text-gray-600 sm:inline">
              {session.email}
            </span>
            <AdminLogoutButton locale={locale} />
            <Link
              href={`/${locale}`}
              className="whitespace-nowrap rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 sm:px-3 sm:py-2 sm:text-sm lg:px-4"
            >
              {locale === 'he' ? 'לאתר' : 'На сайт'}
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 lg:py-8">{children}</main>
    </div>
  )
}
