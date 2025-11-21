'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import type {
  SearchDetail,
  BusinessViewDetail,
  ReviewDetail,
  CTAClickDetail,
} from '@/lib/queries/analytics'

export type DrillDownType = 'searches' | 'views' | 'reviews' | 'cta' | 'categories'

export interface AnalyticsDrillDownProps {
  type: DrillDownType
  startDate: Date
  endDate: Date
  locale: string
  onClose: () => void
}

export default function AnalyticsDrillDown({
  type,
  startDate,
  endDate,
  locale,
  onClose,
}: AnalyticsDrillDownProps) {
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    neighborhood: '',
    businessName: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const observerTarget = useRef<HTMLDivElement>(null)
  const limit = 50

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setOffset(0)
      setData([])
    }

    try {
      const params = new URLSearchParams({
        type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: limit.toString(),
        offset: isLoadMore ? offset.toString() : '0',
      })

      // Add filters
      if (filters.category) params.append('category', filters.category)
      if (filters.neighborhood) params.append('neighborhood', filters.neighborhood)
      if (filters.businessName) params.append('businessName', filters.businessName)

      const response = await fetch(`/api/analytics/drill-down?${params}`)
      if (response.ok) {
        const result = await response.json()
        const newData = result.data || []

        if (isLoadMore) {
          setData(prev => [...prev, ...newData])
        } else {
          setData(newData)
        }

        setTotal(result.total || newData.length)
        setHasMore(newData.length === limit)

        if (isLoadMore) {
          setOffset(prev => prev + limit)
        } else {
          setOffset(limit)
        }
      }
    } catch (error) {
      console.error('Failed to fetch drill-down data:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [type, startDate, endDate, offset, filters])

  useEffect(() => {
    fetchData(false)
  }, [type, startDate, endDate, filters])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchData(true)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, loadingMore, fetchData])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      neighborhood: '',
      businessName: '',
    })
  }

  const getTitle = () => {
    const titles = {
      searches: { he: 'פירוט חיפושים', ru: 'Детали поисков' },
      views: { he: 'פירוט צפיות בעסקים', ru: 'Детали просмотров' },
      reviews: { he: 'פירוט ביקורות', ru: 'Детали отзывов' },
      cta: { he: 'פירוט לחיצות CTA', ru: 'Детали кликов CTA' },
      categories: { he: 'קטגוריות מובילות', ru: 'Топ категории' },
    }
    return locale === 'he' ? titles[type].he : titles[type].ru
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(locale === 'he' ? 'he-IL' : 'ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">
            {locale === 'he' ? 'טוען נתונים...' : 'Загрузка...'}
          </p>
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="py-12 text-center text-gray-600">
          {locale === 'he' ? 'אין נתונים להצגה' : 'Нет данных'}
        </div>
      )
    }

    switch (type) {
      case 'searches':
        return renderSearches(data as SearchDetail[])
      case 'views':
        return renderViews(data as BusinessViewDetail[])
      case 'reviews':
        return renderReviews(data as ReviewDetail[])
      case 'cta':
        return renderCTA(data as CTAClickDetail[])
      case 'categories':
        return renderCategories(data)
      default:
        return null
    }
  }

  const renderSearches = (searches: SearchDetail[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 z-10 border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'קטגוריה' : 'Категория'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'שכונה' : 'Район'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'תוצאות' : 'Результаты'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'שפה' : 'Язык'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'תאריך ושעה' : 'Дата и время'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {searches.map((search, index) => (
            <tr key={`${search.id}-${index}`} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{search.category}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{search.neighborhood}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{search.resultsCount}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {search.language === 'he' ? 'עברית' : 'Русский'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(search.timestamp.toString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderViews = (views: BusinessViewDetail[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 z-10 border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'שם עסק' : 'Название'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'קטגוריה' : 'Категория'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'שכונה' : 'Район'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'מקור' : 'Источник'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'תאריך ושעה' : 'Дата и время'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {views.map((view, index) => (
            <tr key={`${view.id}-${index}`} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{view.businessName}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{view.category}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{view.neighborhood}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {view.source === 'search' && (locale === 'he' ? 'חיפוש' : 'Поиск')}
                {view.source === 'direct' && (locale === 'he' ? 'ישיר' : 'Прямой')}
                {view.source === 'recent' && (locale === 'he' ? 'לאחרונה' : 'Недавние')}
                {!['search', 'direct', 'recent'].includes(view.source) && view.source}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(view.timestamp.toString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderReviews = (reviews: ReviewDetail[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 z-10 border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'שם עסק' : 'Название'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'דירוג' : 'Рейтинг'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'תגובה' : 'Комментарий'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'תאריך ושעה' : 'Дата и время'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {reviews.map((review, index) => (
            <tr key={`${review.id}-${index}`} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{review.businessName}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
              </td>
              <td className="max-w-md px-4 py-3 text-sm text-gray-600">
                {review.comment || (locale === 'he' ? 'אין תגובה' : 'Нет комментария')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(review.timestamp.toString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCTA = (ctas: CTAClickDetail[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 z-10 border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'שם עסק' : 'Название'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'סוג פעולה' : 'Тип действия'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
              {locale === 'he' ? 'תאריך ושעה' : 'Дата и время'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {ctas.map((cta, index) => (
            <tr key={`${cta.id}-${index}`} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{cta.businessName}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {cta.type === 'whatsapp' && '💬 WhatsApp'}
                {cta.type === 'call' && `📞 ${locale === 'he' ? 'שיחה' : 'Звонок'}`}
                {cta.type === 'directions' && `🗺️ ${locale === 'he' ? 'הוראות הגעה' : 'Маршрут'}`}
                {cta.type === 'website' && `🌐 ${locale === 'he' ? 'אתר' : 'Сайт'}`}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(cta.timestamp.toString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCategories = (categories: any[]) => (
    <div className="space-y-3">
      {categories.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border bg-white p-4 transition hover:shadow-md"
        >
          <span className="text-lg font-medium text-gray-900">{item.name}</span>
          <span className="rounded-full bg-primary-100 px-4 py-1 text-lg font-bold text-primary-700">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  )

  const hasActiveFilters = filters.category || filters.neighborhood || filters.businessName

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
            {type !== 'categories' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                  hasActiveFilters
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔍 {locale === 'he' ? 'סינון' : 'Фильтр'}
                {hasActiveFilters && ` (${Object.values(filters).filter(Boolean).length})`}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-200"
            aria-label={locale === 'he' ? 'סגור' : 'Закрыть'}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && type !== 'categories' && (
          <div className="border-b bg-gray-50 px-6 py-4">
            <div className="grid gap-4 md:grid-cols-3">
              {(type === 'views' || type === 'cta' || type === 'reviews') && (
                <input
                  type="text"
                  placeholder={locale === 'he' ? 'שם עסק...' : 'Название бизнеса...'}
                  value={filters.businessName}
                  onChange={(e) => handleFilterChange('businessName', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                />
              )}
              {type === 'searches' && (
                <>
                  <input
                    type="text"
                    placeholder={locale === 'he' ? 'קטגוריה...' : 'Категория...'}
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder={locale === 'he' ? 'שכונה...' : 'Район...'}
                    value={filters.neighborhood}
                    onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
              >
                {locale === 'he' ? 'נקה סינונים' : 'Очистить фильтры'}
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="py-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
            </div>
          )}

          {/* Infinite scroll target */}
          <div ref={observerTarget} className="h-4" />

          {/* End of data message */}
          {!hasMore && data.length > 0 && (
            <div className="py-4 text-center text-sm text-gray-500">
              {locale === 'he' ? 'אין עוד תוצאות' : 'Больше нет результатов'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {locale === 'he' ? 'מציג' : 'Показано'} {data.length}{' '}
              {locale === 'he' ? 'מתוך' : 'из'} {total}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition hover:bg-primary-700"
            >
              {locale === 'he' ? 'סגור' : 'Закрыть'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
