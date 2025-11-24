import { getTranslations } from 'next-intl/server'
import { getOwnerSession } from '@/lib/auth-owner.server'
import { getOwnerBusinesses } from '@/lib/actions/business-owner'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'businessOwner.dashboard' })

  return {
    title: `${t('title')} | Netanya Local`,
  }
}

export default async function BusinessPortalDashboard({ params }: PageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'businessOwner.dashboard' })
  const session = await getOwnerSession()
  const locale = params.locale

  if (!session) {
    return null // Layout will redirect
  }

  // Get owner's businesses
  const result = await getOwnerBusinesses()

  if (result.error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-800">
        {locale === 'he' ? 'שגיאה בטעינת העסקים' : 'Ошибка загрузки бизнесов'}
      </div>
    )
  }

  const businesses = result.businesses || []

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('welcome', { name: session.name })}
        </h1>
        <p className="mt-2 text-gray-600">{t('title')}</p>
      </div>

      {/* My Businesses Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('myBusinesses')}</h2>
          <Link
            href={`/${locale}/business-portal/add`}
            className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition hover:bg-primary-700"
          >
            {locale === 'he' ? '+ הוסף עסק' : '+ Добавить бизнес'}
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <p className="text-lg text-gray-600">{t('noBusinesses')}</p>
            <Link
              href={`/${locale}/business-portal/add`}
              className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700"
            >
              {t('addFirst')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className={`rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg ${
                  business.status === 'pending' ? 'border-2 border-yellow-300' : ''
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {locale === 'he' ? business.name_he : business.name_ru || business.name_he}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {locale === 'he'
                      ? business.category.name_he
                      : business.category.name_ru || business.category.name_he}
                    {' • '}
                    {locale === 'he'
                      ? business.neighborhood.name_he
                      : business.neighborhood.name_ru}
                  </p>
                </div>

                {/* Stats - Only show for approved businesses */}
                {business.status === 'approved' ? (
                  <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('reviews')}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {business.totalReviews}
                        {business.averageRating > 0 && (
                          <span className="ml-1 text-sm text-yellow-600">
                            ★ {business.averageRating.toFixed(1)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {locale === 'he' ? 'סטטוס' : 'Статус'}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {business.is_visible
                          ? locale === 'he'
                            ? '✓ פעיל'
                            : '✓ Активен'
                          : locale === 'he'
                            ? '✕ מוסתר'
                            : '✕ Скрыт'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 rounded-lg bg-yellow-50 p-4 text-center">
                    <p className="text-sm font-medium text-yellow-800">
                      ⏳{' '}
                      {locale === 'he'
                        ? 'ממתין לאישור מנהל'
                        : 'Ожидает одобрения администратора'}
                    </p>
                  </div>
                )}

                {/* Badges */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {business.status === 'pending' && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                      ⏳ {locale === 'he' ? 'ממתין לאישור' : 'Ожидает одобрения'}
                    </span>
                  )}
                  {business.is_verified && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      {locale === 'he' ? '✓ מאומת' : '✓ Проверен'}
                    </span>
                  )}
                  {business.status === 'approved' && !business.is_visible && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                      {locale === 'he' ? 'מוסתר' : 'Скрыт'}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {business.status === 'approved' ? (
                    <>
                      <Link
                        href={`/${locale}/business-portal/business/${business.id}`}
                        className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-primary-700"
                      >
                        {locale === 'he' ? 'ערוך' : 'Редактировать'}
                      </Link>
                      <Link
                        href={`/${locale}/business/${business.slug_he}`}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        target="_blank"
                      >
                        {locale === 'he' ? 'צפה' : 'Просмотр'}
                      </Link>
                    </>
                  ) : (
                    <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-center text-sm font-medium text-gray-400">
                      {locale === 'he'
                        ? 'פעולות יהיו זמינות לאחר אישור'
                        : 'Действия будут доступны после одобрения'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
