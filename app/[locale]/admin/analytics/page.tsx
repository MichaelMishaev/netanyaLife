import { useTranslations } from 'next-intl'
import {
  getAnalyticsSummary,
  getTopCategories,
  getTopNeighborhoods,
  getCTADistribution,
  getLanguageDistribution,
  getAccessibilityUsage,
} from '@/lib/queries/analytics'

interface AdminAnalyticsPageProps {
  params: {
    locale: string
  }
}

export default async function AdminAnalyticsPage({
  params: { locale },
}: AdminAnalyticsPageProps) {
  const t = useTranslations('admin.analytics')

  // Get last 7 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  // Fetch all analytics data
  const [
    summary,
    topCategories,
    topNeighborhoods,
    ctaDistribution,
    languageDistribution,
    accessibilityUsage,
  ] = await Promise.all([
    getAnalyticsSummary(startDate, endDate),
    getTopCategories(startDate, endDate, 5),
    getTopNeighborhoods(startDate, endDate, 5),
    getCTADistribution(startDate, endDate),
    getLanguageDistribution(startDate, endDate),
    getAccessibilityUsage(startDate, endDate),
  ])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'he' ? 'ניתוח נתונים' : 'Аналитика'}
          </h1>
          <p className="text-gray-600">
            {locale === 'he'
              ? '7 ימים אחרונים'
              : 'Последние 7 дней'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm font-medium text-gray-600">
            {locale === 'he' ? 'חיפושים' : 'Поиски'}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summary.totalSearches}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm font-medium text-gray-600">
            {locale === 'he' ? 'צפיות בעסקים' : 'Просмотры'}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summary.totalBusinessViews}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm font-medium text-gray-600">
            {locale === 'he' ? 'ביקורות' : 'Отзывы'}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summary.totalReviews}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm font-medium text-gray-600">
            {locale === 'he' ? 'לחיצות CTA' : 'Клики CTA'}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summary.totalCTAClicks}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Categories */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">
            {locale === 'he' ? 'קטגוריות מובילות' : 'Топ категории'}
          </h2>
          <div className="space-y-3">
            {topCategories.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium text-primary-600">
                  {item.count}
                </span>
              </div>
            ))}
            {topCategories.length === 0 && (
              <p className="text-gray-500">
                {locale === 'he'
                  ? 'אין נתונים עדיין'
                  : 'Нет данных'}
              </p>
            )}
          </div>
        </div>

        {/* Top Neighborhoods */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">
            {locale === 'he' ? 'שכונות מובילות' : 'Топ районы'}
          </h2>
          <div className="space-y-3">
            {topNeighborhoods.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium text-primary-600">
                  {item.count}
                </span>
              </div>
            ))}
            {topNeighborhoods.length === 0 && (
              <p className="text-gray-500">
                {locale === 'he'
                  ? 'אין נתונים עדיין'
                  : 'Нет данных'}
              </p>
            )}
          </div>
        </div>

        {/* CTA Distribution */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">
            {locale === 'he'
              ? 'התפלגות לחיצות CTA'
              : 'Распределение CTA'}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">💬 WhatsApp</span>
              <span className="font-medium text-primary-600">
                {ctaDistribution.whatsapp}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">📞 {locale === 'he' ? 'שיחה' : 'Звонок'}</span>
              <span className="font-medium text-primary-600">
                {ctaDistribution.call}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">🗺️ {locale === 'he' ? 'הוראות הגעה' : 'Маршрут'}</span>
              <span className="font-medium text-primary-600">
                {ctaDistribution.directions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">🌐 {locale === 'he' ? 'אתר' : 'Сайт'}</span>
              <span className="font-medium text-primary-600">
                {ctaDistribution.website}
              </span>
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">
            {locale === 'he' ? 'שפות' : 'Языки'}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">עברית (Hebrew)</span>
              <span className="font-medium text-primary-600">
                {languageDistribution.he}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Русский (Russian)</span>
              <span className="font-medium text-primary-600">
                {languageDistribution.ru}
              </span>
            </div>
          </div>
        </div>

        {/* Accessibility Usage */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">
            {locale === 'he' ? 'שימוש בנגישות' : 'Использование доступности'}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">♿ {locale === 'he' ? 'פתיחות' : 'Открытий'}</span>
              <span className="font-medium text-primary-600">
                {accessibilityUsage.opened}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{locale === 'he' ? 'שינוי גופן' : 'Изменение шрифта'}</span>
              <span className="font-medium text-primary-600">
                {accessibilityUsage.fontChanged}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{locale === 'he' ? 'ניגודיות' : 'Контрастность'}</span>
              <span className="font-medium text-primary-600">
                {accessibilityUsage.contrastToggled}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
