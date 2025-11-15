'use client'

import { useState, useMemo } from 'react'
import BusinessCard from './BusinessCard'
import FilterSheet, { SortOption, FilterOptions } from './FilterSheet'

interface SearchResultsClientProps {
  businesses: any[]
  locale: string
}

export default function SearchResultsClient({
  businesses,
  locale,
}: SearchResultsClientProps) {
  const [sortOption, setSortOption] = useState<SortOption>('rating-high')
  const [filters, setFilters] = useState<FilterOptions>({
    verifiedOnly: false,
    hasReviewsOnly: false,
  })

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

    // Apply sorting
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

    return result
  }, [businesses, sortOption, filters, locale])

  const resultCount = filteredAndSortedBusinesses.length

  return (
    <div>
      {/* Filter/Sort Controls */}
      <div className="mb-6 flex items-center justify-between">
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

      {/* Results Grid */}
      {filteredAndSortedBusinesses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-lg text-gray-600">
            {locale === 'he'
              ? 'לא נמצאו תוצאות עם הסינונים שנבחרו'
              : 'Результаты с выбранными фильтрами не найдены'}
          </p>
          <button
            onClick={() => {
              setSortOption('rating-high')
              setFilters({ verifiedOnly: false, hasReviewsOnly: false })
            }}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            {locale === 'he' ? 'אפס סינונים' : 'Сбросить фильтры'}
          </button>
        </div>
      )}
    </div>
  )
}
