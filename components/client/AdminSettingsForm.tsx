'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { updateAdminSetting } from '@/lib/actions/admin'

interface AdminSettingsFormProps {
  locale: string
  initialSettings: {
    topPinnedCount: number
    showHomepageStats: boolean
    statsBusinessThreshold: number
    showBusinessCount: boolean
    showReviewCount: boolean
    showNeighborhoodCount: boolean
  }
}

export default function AdminSettingsForm({
  locale,
  initialSettings,
}: AdminSettingsFormProps) {
  const t = useTranslations('admin.settings')

  // Search settings state
  const [topPinnedCount, setTopPinnedCount] = useState(initialSettings.topPinnedCount)

  // Homepage stats settings state
  const [showHomepageStats, setShowHomepageStats] = useState(initialSettings.showHomepageStats)
  const [statsBusinessThreshold, setStatsBusinessThreshold] = useState(initialSettings.statsBusinessThreshold)
  const [showBusinessCount, setShowBusinessCount] = useState(initialSettings.showBusinessCount)
  const [showReviewCount, setShowReviewCount] = useState(initialSettings.showReviewCount)
  const [showNeighborhoodCount, setShowNeighborhoodCount] = useState(initialSettings.showNeighborhoodCount)

  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccess(false)

    // Update all settings
    await Promise.all([
      updateAdminSetting('top_pinned_count', String(topPinnedCount), locale),
      updateAdminSetting('show_homepage_stats', String(showHomepageStats), locale),
      updateAdminSetting('stats_business_threshold', String(statsBusinessThreshold), locale),
      updateAdminSetting('show_business_count', String(showBusinessCount), locale),
      updateAdminSetting('show_review_count', String(showReviewCount), locale),
      updateAdminSetting('show_neighborhood_count', String(showNeighborhoodCount), locale),
    ])

    setIsSaving(false)
    setSuccess(true)

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Search Settings Section */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          {locale === 'he' ? 'הגדרות חיפוש' : 'Настройки поиска'}
        </h2>

        <div>
          <label
            htmlFor="topPinnedCount"
            className="mb-2 block font-medium text-gray-700"
          >
            {locale === 'he' ? 'עסקים מוצמדים בתוצאות חיפוש' : 'Закрепленные предприятия в результатах'}
          </label>
          <input
            type="number"
            id="topPinnedCount"
            value={topPinnedCount}
            onChange={(e) => setTopPinnedCount(parseInt(e.target.value, 10))}
            min="0"
            max="20"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-2 text-sm text-gray-500">
            {locale === 'he'
              ? 'מספר העסקים המוצמדים שיוצגו בראש תוצאות החיפוש (0-20)'
              : 'Количество закрепленных предприятий в верхней части результатов поиска (0-20)'}
          </p>
        </div>
      </div>

      {/* Homepage Stats Section */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {locale === 'he' ? 'סטטיסטיקות בעמוד הבית' : 'Статистика на главной странице'}
          </h2>
          <label className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {locale === 'he' ? 'הפעל' : 'Включить'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showHomepageStats}
              onClick={() => setShowHomepageStats(!showHomepageStats)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                showHomepageStats ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showHomepageStats ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>

        <p className="mb-6 text-sm text-gray-600">
          {locale === 'he'
            ? 'הצג סטטיסטיקות (מספר עסקים, ביקורות, שכונות) בעמוד הבית מתחת לטופס החיפוש'
            : 'Показать статистику (количество предприятий, отзывов, районов) на главной странице под формой поиска'}
        </p>

        {showHomepageStats && (
          <div className="space-y-6 border-t pt-6">
            {/* Threshold Setting */}
            <div>
              <label
                htmlFor="statsBusinessThreshold"
                className="mb-2 block font-medium text-gray-700"
              >
                {locale === 'he' ? 'סף תצוגת סטטיסטיקות' : 'Порог отображения статистики'}
              </label>
              <input
                type="number"
                id="statsBusinessThreshold"
                value={statsBusinessThreshold}
                onChange={(e) => setStatsBusinessThreshold(parseInt(e.target.value, 10))}
                min="1"
                max="500"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                {locale === 'he'
                  ? 'מספר עסקים מינימלי להצגת סטטיסטיקות. אם יש פחות עסקים, הסטטיסטיקות לא יוצגו'
                  : 'Минимальное количество предприятий для отображения статистики. Если предприятий меньше, статистика не будет отображаться'}
              </p>
            </div>

            {/* Individual Stat Toggles */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">
                {locale === 'he' ? 'סטטיסטיקות מוצגות' : 'Отображаемая статистика'}
              </h3>

              {/* Business Count Toggle */}
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div>
                  <span className="font-medium text-gray-900">
                    {locale === 'he' ? 'מספר עסקים' : 'Количество предприятий'}
                  </span>
                  <p className="mt-1 text-sm text-gray-500">
                    {locale === 'he' ? 'הצג מספר עסקים כולל בפורטל' : 'Показать общее количество предприятий в портале'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showBusinessCount}
                  onClick={() => setShowBusinessCount(!showBusinessCount)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    showBusinessCount ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showBusinessCount ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>

              {/* Review Count Toggle */}
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div>
                  <span className="font-medium text-gray-900">
                    {locale === 'he' ? 'מספר ביקורות' : 'Количество отзывов'}
                  </span>
                  <p className="mt-1 text-sm text-gray-500">
                    {locale === 'he' ? 'הצג מספר ביקורות כולל שנכתבו' : 'Показать общее количество написанных отзывов'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showReviewCount}
                  onClick={() => setShowReviewCount(!showReviewCount)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    showReviewCount ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showReviewCount ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>

              {/* Neighborhood Count Toggle */}
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <div>
                  <span className="font-medium text-gray-900">
                    {locale === 'he' ? 'מספר שכונות' : 'Количество районов'}
                  </span>
                  <p className="mt-1 text-sm text-gray-500">
                    {locale === 'he' ? 'הצג מספר שכונות שמכוסות' : 'Показать количество охваченных районов'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showNeighborhoodCount}
                  onClick={() => setShowNeighborhoodCount(!showNeighborhoodCount)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    showNeighborhoodCount ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showNeighborhoodCount ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          {locale === 'he'
            ? '✓ ההגדרות נשמרו בהצלחה'
            : '✓ Настройки успешно сохранены'}
        </div>
      )}

      {/* Save Button */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? locale === 'he'
            ? 'שומר...'
            : 'Сохранение...'
          : locale === 'he'
            ? 'שמור שינויים'
            : 'Сохранить изменения'}
      </button>
    </form>
  )
}
