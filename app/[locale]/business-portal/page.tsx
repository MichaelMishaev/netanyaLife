import { getTranslations } from 'next-intl/server'
import { getOwnerSession } from '@/lib/auth-owner.server'
import { getOwnerBusinesses, getOwnerPendingEdits } from '@/lib/actions/business-owner'
import Link from 'next/link'
import type { Metadata } from 'next'
import DismissRejectedEditButton from '@/components/client/DismissRejectedEditButton'

interface PageProps {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'businessOwner.dashboard' })

  return {
    title: `${t('title')} | ${params.locale === 'he' ? 'קהילת נתניה' : 'Сообщество Нетании'}`,
  }
}

export default async function BusinessPortalDashboard({ params }: PageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'businessOwner.dashboard' })
  const session = await getOwnerSession()
  const locale = params.locale

  if (!session) {
    return null // Layout will redirect
  }

  // Get owner's businesses and pending edits
  const [businessResult, pendingEditsResult] = await Promise.all([
    getOwnerBusinesses(),
    getOwnerPendingEdits(),
  ])

  if (businessResult.error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-800">
        {locale === 'he' ? 'שגיאה בטעינת העסקים' : 'Ошибка загрузки бизнесов'}
      </div>
    )
  }

  const businesses = businessResult.businesses || []
  const pendingEdits = pendingEditsResult.edits || []

  // Create maps of business IDs with pending/rejected edits
  const businessesWithPendingEdits = new Set(
    pendingEdits.filter(edit => edit.status === 'PENDING').map(edit => edit.business_id)
  )

  const rejectedEditsMap = new Map(
    pendingEdits
      .filter(edit => edit.status === 'REJECTED')
      .map(edit => [edit.business_id, edit])
  )

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
                  business.status === 'pending'
                    ? 'border-2 border-yellow-300'
                    : business.status === 'rejected'
                      ? 'border-2 border-red-300'
                      : ''
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
                  <>
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

                    {/* Pending Edits Indicator */}
                    {businessesWithPendingEdits.has(business.id) && (
                      <div className="mb-4 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
                        <div className="flex items-start gap-2">
                          <div className="text-lg">⏳</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-blue-900">
                              {locale === 'he'
                                ? 'שינויים ממתינים לאישור'
                                : 'Изменения ожидают одобрения'}
                            </p>
                            <p className="mt-1 text-xs text-blue-800">
                              {locale === 'he'
                                ? 'העסק מקוון, אך העדכונים האחרונים ממתינים לאישור מנהל'
                                : 'Бизнес онлайн, но последние обновления ожидают одобрения администратора'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rejected Edits Indicator */}
                    {rejectedEditsMap.has(business.id) && (
                      <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4">
                        <div className="flex items-start gap-2">
                          <div className="text-lg">❌</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-red-900">
                              {locale === 'he'
                                ? 'השינויים נדחו על ידי המנהל'
                                : 'Изменения отклонены администратором'}
                            </p>
                            <p className="mt-1 text-xs text-red-800">
                              {locale === 'he'
                                ? 'העסק מקוון, אך השינויים האחרונים נדחו'
                                : 'Бизнес онлайн, но последние изменения отклонены'}
                            </p>
                            {rejectedEditsMap.get(business.id)?.rejection_reason && (
                              <div className="mt-3 rounded border border-red-200 bg-white p-3">
                                <p className="mb-1 text-xs font-medium text-red-700">
                                  {locale === 'he' ? 'סיבת הדחייה:' : 'Причина отклонения:'}
                                </p>
                                <p className="text-sm text-gray-800" dir={locale === 'he' ? 'rtl' : 'ltr'}>
                                  {rejectedEditsMap.get(business.id)?.rejection_reason}
                                </p>
                              </div>
                            )}
                            {rejectedEditsMap.get(business.id)?.reviewed_at && (
                              <p className="mt-2 text-xs text-red-600">
                                {locale === 'he' ? 'נדחה ב: ' : 'Отклонено: '}
                                {new Date(rejectedEditsMap.get(business.id)!.reviewed_at!).toLocaleDateString(locale)}
                              </p>
                            )}
                            <DismissRejectedEditButton
                              businessId={business.id}
                              locale={locale}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : business.status === 'pending' ? (
                  <div className="mb-4 rounded-lg bg-yellow-50 p-4 text-center">
                    <p className="text-sm font-medium text-yellow-800">
                      ⏳{' '}
                      {locale === 'he'
                        ? 'ממתין לאישור מנהל'
                        : 'Ожидает одобрения администратора'}
                    </p>
                  </div>
                ) : business.status === 'rejected' ? (
                  <div className="mb-4 rounded-lg bg-red-50 p-4">
                    <p className="mb-2 text-center text-sm font-bold text-red-800">
                      ✕{' '}
                      {locale === 'he'
                        ? 'נדחה על ידי המנהל'
                        : 'Отклонено администратором'}
                    </p>
                    {'rejection_reason' in business && business.rejection_reason && (
                      <div className="mt-3 rounded border border-red-200 bg-white p-3">
                        <p className="mb-1 text-xs font-medium text-red-700">
                          {locale === 'he' ? 'סיבת הדחייה:' : 'Причина отклонения:'}
                        </p>
                        <p
                          className="text-sm text-gray-700"
                          dir={locale === 'he' ? 'rtl' : 'ltr'}
                        >
                          {business.rejection_reason}
                        </p>
                      </div>
                    )}
                    {'reviewed_at' in business && business.reviewed_at && (
                      <p className="mt-2 text-center text-xs text-gray-500">
                        {new Date(business.reviewed_at).toLocaleDateString(locale)}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Badges */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {business.status === 'pending' && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                      ⏳ {locale === 'he' ? 'ממתין לאישור' : 'Ожидает одобрения'}
                    </span>
                  )}
                  {business.status === 'rejected' && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                      ✕ {locale === 'he' ? 'נדחה' : 'Отклонено'}
                    </span>
                  )}
                  {business.status === 'approved' && businessesWithPendingEdits.has(business.id) && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      ⏳ {locale === 'he' ? 'עדכונים ממתינים' : 'Обновления ожидают'}
                    </span>
                  )}
                  {business.status === 'approved' && rejectedEditsMap.has(business.id) && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                      ❌ {locale === 'he' ? 'עדכונים נדחו' : 'Обновления отклонены'}
                    </span>
                  )}
                  {business.is_verified && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
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
                  ) : business.status === 'rejected' ? (
                    <Link
                      href={`/${locale}/business-portal/resubmit/${business.id}`}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      {locale === 'he' ? 'ערוך ושלח שוב' : 'Редактировать и отправить снова'}
                    </Link>
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
