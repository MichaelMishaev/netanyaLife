import { getTranslations } from 'next-intl/server'
import BusinessOwnerLoginForm from '@/components/client/BusinessOwnerLoginForm'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    locale: string
  }
  searchParams?: {
    redirect?: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'businessOwner.login' })

  return {
    title: `${t('title')} | ${params.locale === 'he' ? 'קהילת נתניה' : 'Сообщество Нетании'}`,
    description: t('subtitle'),
  }
}

export default async function BusinessLoginPage({ params, searchParams }: PageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'businessOwner.login' })
  const locale = params.locale
  const redirectTo = searchParams?.redirect

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-md">
          {/* Logo/Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('title')}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('subtitle')}
            </p>
          </div>

          {/* Login Form Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <BusinessOwnerLoginForm locale={locale} redirectTo={redirectTo} />
          </div>

          {/* Back to home link */}
          <div className="mt-6 text-center">
            <a
              href={`/${locale}`}
              className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
            >
              ← {locale === 'he' ? 'חזור לדף הבית' : 'Вернуться на главную'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
