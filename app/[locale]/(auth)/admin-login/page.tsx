import { getTranslations } from 'next-intl/server'
import AdminLoginForm from '@/components/client/AdminLoginForm'

interface AdminLoginPageProps {
  params: {
    locale: string
  }
}

export default async function AdminLoginPage({
  params: { locale },
}: AdminLoginPageProps) {
  const t = await getTranslations('admin.login')

  const tCommon = await getTranslations('common')

  return (
    <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg">
        {/* Back to Home Link */}
        <div className="mb-4">
          <a
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-primary-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={locale === 'he' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
              />
            </svg>
            <span>{tCommon('back')}</span>
          </a>
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold">{t('title')}</h1>
        <AdminLoginForm locale={locale} />
      </div>
    </main>
  )
}
