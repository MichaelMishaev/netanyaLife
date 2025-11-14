import { useTranslations } from 'next-intl'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface AdminDashboardProps {
  params: {
    locale: string
  }
}

export default async function AdminDashboard({
  params: { locale },
}: AdminDashboardProps) {
  const t = useTranslations('admin.dashboard')

  // Get statistics
  const [
    totalBusinesses,
    pendingCount,
    totalCategories,
    totalReviews,
    visibleBusinesses,
    verifiedBusinesses,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.pendingBusiness.count({ where: { status: 'pending' } }),
    prisma.category.count({ where: { is_active: true } }),
    prisma.review.count(),
    prisma.business.count({ where: { is_visible: true } }),
    prisma.business.count({ where: { is_verified: true } }),
  ])

  const stats = [
    {
      label: t('stats.businesses'),
      value: totalBusinesses,
      subtext: `${visibleBusinesses} ${locale === 'he' ? 'גלויים' : 'видимых'}`,
      href: `/${locale}/admin/businesses`,
      color: 'bg-blue-500',
    },
    {
      label: t('stats.pending'),
      value: pendingCount,
      subtext: locale === 'he' ? 'ממתינים לאישור' : 'ожидают одобрения',
      href: `/${locale}/admin/pending`,
      color: 'bg-yellow-500',
    },
    {
      label: t('stats.categories'),
      value: totalCategories,
      subtext: locale === 'he' ? 'קטגוריות פעילות' : 'активных категорий',
      href: '#',
      color: 'bg-green-500',
    },
    {
      label: t('stats.reviews'),
      value: totalReviews,
      subtext: locale === 'he' ? 'ביקורות כולל' : 'всего отзывов',
      href: '#',
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>

      {/* Statistics Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="block rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <div className={`h-3 w-3 rounded-full ${stat.color}`} />
            </div>
            <p className="mb-1 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.subtext}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">
          {locale === 'he' ? 'פעולות מהירות' : 'Быстрые действия'}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href={`/${locale}/admin/pending`}
            className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 transition hover:bg-yellow-100"
          >
            <h3 className="mb-2 font-bold text-yellow-900">
              {locale === 'he' ? 'אשר עסקים' : 'Одобрить предприятия'}
            </h3>
            <p className="text-sm text-yellow-700">
              {pendingCount}{' '}
              {locale === 'he' ? 'ממתינים לאישור' : 'ожидают одобрения'}
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/businesses`}
            className="rounded-lg border border-blue-200 bg-blue-50 p-6 transition hover:bg-blue-100"
          >
            <h3 className="mb-2 font-bold text-blue-900">
              {locale === 'he' ? 'נהל עסקים' : 'Управление предприятиями'}
            </h3>
            <p className="text-sm text-blue-700">
              {locale === 'he'
                ? 'ערוך, הסתר או מחק עסקים'
                : 'Редактировать, скрыть или удалить'}
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/settings`}
            className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:bg-gray-100"
          >
            <h3 className="mb-2 font-bold text-gray-900">
              {locale === 'he' ? 'הגדרות מערכת' : 'Настройки системы'}
            </h3>
            <p className="text-sm text-gray-700">
              {locale === 'he'
                ? 'שנה הגדרות כלליות'
                : 'Изменить общие настройки'}
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-xl font-bold">
          {locale === 'he' ? 'פעילות אחרונה' : 'Последняя активность'}
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-gray-600">
            {locale === 'he'
              ? 'תכונה זו תתווסף בגרסאות הבאות'
              : 'Эта функция будет добавлена в следующих версиях'}
          </p>
        </div>
      </div>
    </div>
  )
}
