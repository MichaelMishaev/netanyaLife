'use client'

import { useState } from 'react'
import TimelineSelector, { TimeRange } from './TimelineSelector'
import AnalyticsDrillDown, { DrillDownType } from './AnalyticsDrillDown'
import type {
  AnalyticsSummary,
  TopItem,
  CTADistribution,
} from '@/lib/queries/analytics'

export interface AnalyticsDashboardProps {
  initialSummary: AnalyticsSummary
  initialTopCategories: TopItem[]
  initialTopNeighborhoods: TopItem[]
  initialCTADistribution: CTADistribution
  locale: string
}

export default function AnalyticsDashboard({
  initialSummary,
  initialTopCategories,
  initialTopNeighborhoods,
  initialCTADistribution,
  locale,
}: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState(initialSummary)
  const [topCategories, setTopCategories] = useState(initialTopCategories)
  const [topNeighborhoods, setTopNeighborhoods] = useState(initialTopNeighborhoods)
  const [ctaDistribution, setCTADistribution] = useState(initialCTADistribution)

  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date
  })
  const [endDate, setEndDate] = useState(new Date())

  const [drillDownOpen, setDrillDownOpen] = useState(false)
  const [drillDownType, setDrillDownType] = useState<DrillDownType>('searches')
  const [loading, setLoading] = useState(false)

  const handleTimelineChange = async (
    range: TimeRange,
    newStartDate?: Date,
    newEndDate?: Date
  ) => {
    if (!newStartDate || !newEndDate) return

    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setLoading(true)

    try {
      const params = new URLSearchParams({
        startDate: newStartDate.toISOString(),
        endDate: newEndDate.toISOString(),
      })

      const response = await fetch(`/api/analytics/summary?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
        setTopCategories(data.topCategories)
        setTopNeighborhoods(data.topNeighborhoods)
        setCTADistribution(data.ctaDistribution)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const openDrillDown = (type: DrillDownType) => {
    setDrillDownType(type)
    setDrillDownOpen(true)
  }

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
    const start = startDate.toLocaleDateString(locale === 'he' ? 'he-IL' : 'ru-RU', options)
    const end = endDate.toLocaleDateString(locale === 'he' ? 'he-IL' : 'ru-RU', options)
    return `${start} - ${end}`
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'he' ? 'ניתוח נתונים' : 'Аналитика'}
          </h1>
          <p className="text-gray-600">{formatDateRange()}</p>
        </div>
      </div>

      {/* Timeline Selector */}
      <div className="mb-8">
        <TimelineSelector onChange={handleTimelineChange} locale={locale} />
      </div>

      {loading && (
        <div className="mb-8 flex items-center justify-center rounded-lg border bg-white p-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">
            {locale === 'he' ? 'טוען נתונים...' : 'Загрузка данных...'}
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => openDrillDown('searches')}
          className="group cursor-pointer rounded-lg border bg-white p-6 text-right transition hover:shadow-lg"
        >
          <p className="text-sm font-medium text-gray-600">
            {locale === 'he' ? 'חיפושים' : 'Поиски'}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summary.totalSearches}
          </p>
          <p className="mt-2 text-xs text-primary-600 opacity-0 transition group-hover:opacity-100">
            {locale === 'he' ? 'לחץ לפירוט ←' : 'Нажмите для деталей →'}
          </p>
        </button>

        <button
          onClick={() => openDrillDown('views')}
          className="group cursor-pointer rounded-lg border bg-white p-6 text-right transition hover:shadow-lg"
        >
          <p className="text-sm font-medium text-gray-600">
            {locale === 'he' ? 'צפיות בעסקים' : 'Просмотры'}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summary.totalBusinessViews}
          </p>
          <p className="mt-2 text-xs text-primary-600 opacity-0 transition group-hover:opacity-100">
            {locale === 'he' ? 'לחץ לפירוט ←' : 'Нажмите для деталей →'}
          </p>
        </button>

        <button
          onClick={() => openDrillDown('reviews')}
          className="group cursor-pointer rounded-lg border bg-white p-6 text-right transition hover:shadow-lg"
        >
          <p className="text-sm font-medium text-gray-600">
            {locale === 'he' ? 'ביקורות' : 'Отзывы'}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summary.totalReviews}
          </p>
          <p className="mt-2 text-xs text-primary-600 opacity-0 transition group-hover:opacity-100">
            {locale === 'he' ? 'לחץ לפירוט ←' : 'Нажмите для деталей →'}
          </p>
        </button>

        <button
          onClick={() => openDrillDown('cta')}
          className="group cursor-pointer rounded-lg border bg-white p-6 text-right transition hover:shadow-lg"
        >
          <p className="text-sm font-medium text-gray-600">
            {locale === 'he' ? 'לחיצות CTA' : 'Клики CTA'}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {summary.totalCTAClicks}
          </p>
          <p className="mt-2 text-xs text-primary-600 opacity-0 transition group-hover:opacity-100">
            {locale === 'he' ? 'לחץ לפירוט ←' : 'Нажмите для деталей →'}
          </p>
        </button>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Categories */}
        <button
          onClick={() => openDrillDown('categories')}
          className="group cursor-pointer rounded-lg border bg-white p-6 text-right transition hover:shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {locale === 'he' ? 'קטגוריות מובילות' : 'Топ категории'}
            </h2>
            <span className="text-xs text-primary-600 opacity-0 transition group-hover:opacity-100">
              {locale === 'he' ? 'לחץ לפירוט ←' : 'Нажмите для деталей →'}
            </span>
          </div>
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
        </button>

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
      </div>

      {/* Drill-Down Modal */}
      {drillDownOpen && (
        <AnalyticsDrillDown
          type={drillDownType}
          startDate={startDate}
          endDate={endDate}
          locale={locale}
          onClose={() => setDrillDownOpen(false)}
        />
      )}
    </div>
  )
}
