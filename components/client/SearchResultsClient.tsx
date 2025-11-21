'use client'

import { useState, useMemo, useEffect } from 'react'
import BusinessCard from './BusinessCard'
import FilterSheet, { SortOption, FilterOptions } from './FilterSheet'

interface SearchResultsClientProps {
  businesses: any[]
  locale: string
  showSubcategories?: boolean
}

export default function SearchResultsClient({
  businesses,
  locale,
  showSubcategories = false,
}: SearchResultsClientProps) {
  // Use 'default' to preserve server ordering initially (prevents hydration errors)
  const [sortOption, setSortOption] = useState<SortOption>('rating-high')
  const [filters, setFilters] = useState<FilterOptions>({
    verifiedOnly: false,
    hasReviewsOnly: false,
  })
  const [isInitialRender, setIsInitialRender] = useState(true)

  // Mark as not initial render after first client-side update
  useEffect(() => {
    setIsInitialRender(false)
  }, [])

  // Apply filters and sorting
  const filteredAndSortedBusinesses = useMemo(() => {
    let result = [...businesses]

    // Apply filters
    if (filters.verifiedOnly) {
      result = result.filter((b) => b.is_verified)
    }
    if (filters.hasReviewsOnly) {
      result = result.filter((b) => b._count?.reviews > 0)
    }

    // Only apply sorting after initial render to prevent hydration errors
    // Server already provides optimized ordering (pinned → random 5 → rest by rating)
    if (!isInitialRender) {
      result.sort((a, b) => {
        switch (sortOption) {
          case 'rating-high':
            return (b.avg_rating || 0) - (a.avg_rating || 0)
          case 'rating-low':
            return (a.avg_rating || 0) - (b.avg_rating || 0)
          case 'newest':
            return (
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          case 'alphabetical':
            const nameA = locale === 'he' ? a.name_he : a.name_ru || a.name_he
            const nameB = locale === 'he' ? b.name_he : b.name_ru || b.name_he
            return nameA.localeCompare(nameB, locale === 'he' ? 'he' : 'ru')
          default:
            return 0
        }
      })
    }

    return result
  }, [businesses, sortOption, filters, locale, isInitialRender])

  const resultCount = filteredAndSortedBusinesses.length

  const getSortLabel = (sort: SortOption) => {
    if (locale === 'he') {
      switch (sort) {
        case 'rating-high': return 'דירוג: גבוה לנמוך'
        case 'rating-low': return 'דירוג: נמוך לגבוה'
        case 'newest': return 'החדשים ביותר'
        case 'alphabetical': return 'אלפבתי'
      }
    } else {
      switch (sort) {
        case 'rating-high': return 'Рейтинг: высокий → низкий'
        case 'rating-low': return 'Рейтинг: низкий → высокий'
        case 'newest': return 'Новейшие'
        case 'alphabetical': return 'По алфавиту'
      }
    }
  }

  const hasActiveFilters = filters.verifiedOnly || filters.hasReviewsOnly

  return (
    <div>
      {/* Filter/Sort Controls */}
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {locale === 'he' ? 'מציג' : 'Показано'} {resultCount}{' '}
            {locale === 'he'
              ? resultCount === 1
                ? 'תוצאה'
                : 'תוצאות'
              : resultCount === 1
                ? 'результат'
                : resultCount < 5
                  ? 'результата'
                  : 'результатов'}
          </p>
          <FilterSheet
            locale={locale}
            onSortChange={setSortOption}
            onFilterChange={setFilters}
            currentSort={sortOption}
            currentFilters={filters}
          />
        </div>

        {/* Active Filters Badges */}
        {(hasActiveFilters || sortOption !== 'rating-high') && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Badge - Only show if not default */}
            {sortOption !== 'rating-high' && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <span>📊</span>
                <span>{getSortLabel(sortOption)}</span>
                <button
                  onClick={() => setSortOption('rating-high')}
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200"
                  aria-label={locale === 'he' ? 'הסר מיון' : 'Удалить сортировку'}
                >
                  ×
                </button>
              </div>
            )}

            {/* Verified Filter Badge */}
            {filters.verifiedOnly && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <span>✓</span>
                <span>{locale === 'he' ? 'מאומתים בלבד' : 'Только проверенные'}</span>
                <button
                  onClick={() => setFilters({ ...filters, verifiedOnly: false })}
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-green-200"
                  aria-label={locale === 'he' ? 'הסר סינון' : 'Удалить фильтр'}
                >
                  ×
                </button>
              </div>
            )}

            {/* Has Reviews Filter Badge */}
            {filters.hasReviewsOnly && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                <span>⭐</span>
                <span>{locale === 'he' ? 'עם ביקורות בלבד' : 'Только с отзывами'}</span>
                <button
                  onClick={() => setFilters({ ...filters, hasReviewsOnly: false })}
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-yellow-200"
                  aria-label={locale === 'he' ? 'הסר סינון' : 'Удалить фильтр'}
                >
                  ×
                </button>
              </div>
            )}

            {/* Clear All Badge */}
            {(hasActiveFilters || sortOption !== 'rating-high') && (
              <button
                onClick={() => {
                  setSortOption('rating-high')
                  setFilters({ verifiedOnly: false, hasReviewsOnly: false })
                }}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline"
              >
                {locale === 'he' ? 'נקה הכל' : 'Очистить все'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Divider for mixed subcategory results */}
      {showSubcategories && filteredAndSortedBusinesses.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 shadow-sm">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-purple-900">
              {locale === 'he'
                ? 'תוצאות מתת-קטגוריות שונות:'
                : 'Результаты из разных подкатегорий:'}
            </p>
            <p className="text-sm text-purple-700">
              {locale === 'he'
                ? 'כל עסק מסומן עם הסוג המדויק שלו'
                : 'Каждое предприятие помечено своим точным типом'}
            </p>
          </div>
        </div>
      )}

      {/* Results Grid - With fade-in animation */}
      {filteredAndSortedBusinesses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedBusinesses.map((business, index) => (
            <div
              key={business.id}
              className="h-full animate-fade-in-up"
              style={{
                animationDelay: `${Math.min(index * 50, 300)}ms`,
                animationFillMode: 'backwards',
              }}
            >
              <BusinessCard
                business={business}
                locale={locale}
                showSubcategory={showSubcategories}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 py-12 text-center">
          {/* Icon */}
          <div className="mb-6 rounded-full bg-gray-100 p-6">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          {/* Message */}
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            {locale === 'he'
              ? 'לא נמצאו תוצאות עם הסינונים שנבחרו'
              : 'Результаты с выбранными фильтрами не найдены'}
          </h3>
          <p className="mb-6 max-w-md text-sm text-gray-600">
            {locale === 'he'
              ? 'נסה להסיר כמה סינונים או לאפס את הכל כדי לראות יותר תוצאות.'
              : 'Попробуйте удалить некоторые фильтры или сбросить все, чтобы увидеть больше результатов.'}
          </p>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSortOption('rating-high')
              setFilters({ verifiedOnly: false, hasReviewsOnly: false })
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-primary-700 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>{locale === 'he' ? 'אפס הכל' : 'Сбросить все'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
