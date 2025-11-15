'use client'

import { useState } from 'react'

export type SortOption =
  | 'rating-high'
  | 'rating-low'
  | 'newest'
  | 'alphabetical'

export interface FilterOptions {
  verifiedOnly: boolean
  hasReviewsOnly: boolean
}

interface FilterSheetProps {
  locale: string
  onSortChange: (sort: SortOption) => void
  onFilterChange: (filters: FilterOptions) => void
  currentSort: SortOption
  currentFilters: FilterOptions
}

export default function FilterSheet({
  locale,
  onSortChange,
  onFilterChange,
  currentSort,
  currentFilters,
}: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSortChange = (sort: SortOption) => {
    onSortChange(sort)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: boolean) => {
    onFilterChange({
      ...currentFilters,
      [key]: value,
    })
  }

  const handleReset = () => {
    onSortChange('rating-high')
    onFilterChange({
      verifiedOnly: false,
      hasReviewsOnly: false,
    })
  }

  const getSortLabel = (sort: SortOption) => {
    if (locale === 'he') {
      switch (sort) {
        case 'rating-high':
          return 'דירוג: גבוה לנמוך'
        case 'rating-low':
          return 'דירוג: נמוך לגבוה'
        case 'newest':
          return 'החדשים ביותר'
        case 'alphabetical':
          return 'אלפבתי'
      }
    } else {
      switch (sort) {
        case 'rating-high':
          return 'Рейтинг: высокий → низкий'
        case 'rating-low':
          return 'Рейтинг: низкий → высокий'
        case 'newest':
          return 'Новейшие'
        case 'alphabetical':
          return 'По алфавиту'
      }
    }
  }

  const hasActiveFilters =
    currentFilters.verifiedOnly || currentFilters.hasReviewsOnly

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        <span>🔧</span>
        <span>{locale === 'he' ? 'סינון ומיון' : 'Фильтр и сортировка'}</span>
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
            {(currentFilters.verifiedOnly ? 1 : 0) +
              (currentFilters.hasReviewsOnly ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {locale === 'he' ? 'סינון ומיון' : 'Фильтр и сортировка'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Sort Section */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                {locale === 'he' ? 'מיון לפי' : 'Сортировать по'}
              </h3>
              <div className="space-y-2">
                {(['rating-high', 'rating-low', 'newest', 'alphabetical'] as SortOption[]).map(
                  (sort) => (
                    <label
                      key={sort}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="sort"
                        value={sort}
                        checked={currentSort === sort}
                        onChange={() => handleSortChange(sort)}
                        className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {getSortLabel(sort)}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                {locale === 'he' ? 'סינון' : 'Фильтры'}
              </h3>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={currentFilters.verifiedOnly}
                    onChange={(e) =>
                      handleFilterChange('verifiedOnly', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    ✓ {locale === 'he' ? 'מאומתים בלבד' : 'Только проверенные'}
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={currentFilters.hasReviewsOnly}
                    onChange={(e) =>
                      handleFilterChange('hasReviewsOnly', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    ⭐ {locale === 'he' ? 'עם ביקורות בלבד' : 'Только с отзывами'}
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {locale === 'he' ? 'אפס' : 'Сброс'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                {locale === 'he' ? 'החל' : 'Применить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
