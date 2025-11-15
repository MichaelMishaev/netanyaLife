import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLogoutButton from '@/components/client/AdminLogoutButton'

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
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900">
              {locale === 'he' ? 'ניהול מערכת' : 'Панель администратора'}
            </h1>

            <nav className="flex gap-6">
              <Link
                href={`/${locale}/admin`}
                className="text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'ראשי' : 'Главная'}
              </Link>
              <Link
                href={`/${locale}/admin/pending`}
                className="text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'ממתינים לאישור' : 'Ожидают одобрения'}
              </Link>
              <Link
                href={`/${locale}/admin/businesses`}
                className="text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'עסקים' : 'Предприятия'}
              </Link>
              <Link
                href={`/${locale}/admin/analytics`}
                className="text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'ניתוח נתונים' : 'Аналитика'}
              </Link>
              <Link
                href={`/${locale}/admin/settings`}
                className="text-gray-600 hover:text-primary-600"
              >
                {locale === 'he' ? 'הגדרות' : 'Настройки'}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.email}</span>
            <AdminLogoutButton locale={locale} />
            <Link
              href={`/${locale}`}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              {locale === 'he' ? 'חזור לאתר' : 'Вернуться на сайт'}
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
