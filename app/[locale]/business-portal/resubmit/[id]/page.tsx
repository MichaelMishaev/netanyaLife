import { getTranslations } from 'next-intl/server'
import { getOwnerSession } from '@/lib/auth-owner.server'
import { getRejectedPendingBusiness } from '@/lib/actions/business-owner'
import { getCategories } from '@/lib/queries/categories'
import { getNeighborhoods, getNetanyaCity } from '@/lib/queries/neighborhoods'
import OwnerResubmitBusinessForm from '@/components/client/OwnerResubmitBusinessForm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    locale: string
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `${params.locale === 'he' ? 'ערוך ושלח שוב' : 'Редактировать и отправить снова'} | ${params.locale === 'he' ? 'קהילת נתניה' : 'Сообщество Нетании'}`,
  }
}

export default async function ResubmitBusinessPage({ params }: PageProps) {
  const locale = params.locale
  const pendingId = params.id
  const session = await getOwnerSession()

  if (!session) {
    return null // Layout will redirect to login
  }

  // Fetch the rejected pending business
  const result = await getRejectedPendingBusiness(pendingId)

  if (result.error || !result.business) {
    redirect(`/${locale}/business-portal`)
  }

  const pendingBusiness = result.business

  // Fetch categories and neighborhoods for the form
  const city = await getNetanyaCity()

  if (!city) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-800">
        {locale === 'he' ? 'שגיאה בטעינת הנתונים' : 'Ошибка загрузки данных'}
      </div>
    )
  }

  const [categories, neighborhoods] = await Promise.all([
    getCategories(),
    getNeighborhoods(city.id),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'he' ? 'ערוך ושלח שוב' : 'Редактировать и отправить снова'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {locale === 'he' ? pendingBusiness.name : pendingBusiness.name}
            </p>
          </div>
          <Link
            href={`/${locale}/business-portal`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {locale === 'he' ? 'חזרה ללוח הבקרה' : 'Назад к панели'}
          </Link>
        </div>

        {/* Rejection Reason Alert */}
        {pendingBusiness.rejection_reason && (
          <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {locale === 'he' ? 'סיבת הדחייה מהמנהל' : 'Причина отклонения от администратора'}
                </h3>
                <div className="mt-2 text-sm text-red-700" dir={locale === 'he' ? 'rtl' : 'ltr'}>
                  {pendingBusiness.rejection_reason}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-white p-4 md:p-8 shadow-sm">
        <OwnerResubmitBusinessForm
          pendingId={pendingId}
          initialData={pendingBusiness}
          categories={categories}
          neighborhoods={neighborhoods}
          cityId={city.id}
          locale={locale}
        />
      </div>
    </div>
  )
}
