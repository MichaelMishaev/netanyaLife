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

      {/* Modal - Optimized for mobile thumb accessibility */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white shadow-xl sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="flex justify-center pb-2 pt-3 sm:hidden">
              <div className="h-1 w-12 rounded-full bg-gray-300" />
            </div>

            {/* Content */}
            <div className="p-4 pb-6 sm:p-6">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {locale === 'he' ? 'סינון ומיון' : 'Фильтр и сортировка'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label={locale === 'he' ? 'סגור' : 'Закрыть'}
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Sort Section */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  {locale === 'he' ? 'מיון לפי' : 'Сортировать по'}
                </h3>
                <div className="space-y-3">
                  {(['rating-high', 'rating-low', 'newest', 'alphabetical'] as SortOption[]).map(
                    (sort) => (
                      <label
                        key={sort}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-3.5 transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-50"
                        data-checked={currentSort === sort}
                      >
                        <input
                          type="radio"
                          name="sort"
                          value={sort}
                          checked={currentSort === sort}
                          onChange={() => handleSortChange(sort)}
                          className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="flex-1 text-sm font-medium text-gray-700">
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
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-3.5 transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-50"
                    data-checked={currentFilters.verifiedOnly}>
                    <input
                      type="checkbox"
                      checked={currentFilters.verifiedOnly}
                      onChange={(e) =>
                        handleFilterChange('verifiedOnly', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      ✓ {locale === 'he' ? 'מאומתים בלבד' : 'Только проверенные'}
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-3.5 transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-50"
                    data-checked={currentFilters.hasReviewsOnly}>
                    <input
                      type="checkbox"
                      checked={currentFilters.hasReviewsOnly}
                      onChange={(e) =>
                        handleFilterChange('hasReviewsOnly', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      ⭐ {locale === 'he' ? 'עם ביקורות בלבד' : 'Только с отзывами'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons - Larger for mobile thumb accessibility */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] sm:py-3"
                >
                  {locale === 'he' ? 'אפס' : 'Сброс'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-700 active:scale-[0.98] sm:py-3"
                >
                  {locale === 'he' ? 'החל' : 'Применить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
