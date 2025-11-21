'use client'

import { useState, useMemo } from 'react'
import CategoryManagementCard from './CategoryManagementCard'

interface CategoriesListWithSearchProps {
  categories: any[]
  locale: string
  isSuperAdmin: boolean
}

export default function CategoriesListWithSearch({
  categories,
  locale,
  isSuperAdmin,
}: CategoriesListWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories

    const query = searchQuery.toLowerCase().trim()

    return categories.filter((category) => {
      // Search in Hebrew name
      if (category.name_he?.toLowerCase().includes(query)) return true

      // Search in Russian name
      if (category.name_ru?.toLowerCase().includes(query)) return true

      // Search in slug
      if (category.slug?.toLowerCase().includes(query)) return true

      // Search in subcategories
      if (category.subcategories?.some((sub: any) =>
        sub.name_he?.toLowerCase().includes(query) ||
        sub.name_ru?.toLowerCase().includes(query) ||
        sub.slug?.toLowerCase().includes(query)
      )) return true

      return false
    })
  }, [categories, searchQuery])

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === 'he'
                ? 'חיפוש קטגוריות...'
                : 'Поиск категорий...'
            }
            className="w-full rounded-lg border border-gray-300 py-3 pe-4 ps-10 text-base transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir={locale === 'he' ? 'rtl' : 'ltr'}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
              aria-label={locale === 'he' ? 'נקה חיפוש' : 'Очистить поиск'}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            {locale === 'he'
              ? `נמצאו ${filteredCategories.length} קטגוריות`
              : `Найдено ${filteredCategories.length} категорий`}
          </p>
        )}
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <CategoryManagementCard
            key={category.id}
            category={category}
            locale={locale}
            isSuperAdmin={isSuperAdmin}
            allCategories={categories}
          />
        ))}

        {/* No results */}
        {filteredCategories.length === 0 && searchQuery && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-gray-500">
              {locale === 'he'
                ? `לא נמצאו קטגוריות עבור "${searchQuery}"`
                : `Категорий не найдено для "${searchQuery}"`}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-primary-600 hover:text-primary-700"
            >
              {locale === 'he' ? 'נקה חיפוש' : 'Очистить поиск'}
            </button>
          </div>
        )}

        {/* Empty state (no categories at all) */}
        {categories.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-gray-500">
              {locale === 'he'
                ? 'אין קטגוריות עדיין. הוסף קטגוריה ראשונה!'
                : 'Категорий пока нет. Добавьте первую категорию!'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
