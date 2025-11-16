'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

interface BusinessFiltersProps {
  locale: string
  neighborhoods: Array<{
    id: string
    name_he: string
    name_ru: string
  }>
  categories: Array<{
    id: string
    name_he: string
    name_ru: string
  }>
}

export default function BusinessFilters({
  locale,
  neighborhoods,
  categories,
}: BusinessFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const selectedNeighborhood = searchParams.get('neighborhood') || ''
  const selectedCategory = searchParams.get('category') || ''

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    startTransition(() => {
      router.push(`/${locale}/admin/businesses`)
    })
  }

  const hasActiveFilters = selectedNeighborhood || selectedCategory

  return (
    <div className="mb-6 rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {locale === 'he' ? 'סינון' : 'Фильтры'}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
            disabled={isPending}
          >
            {locale === 'he' ? 'נקה סינון' : 'Очистить фильтры'}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Neighborhood Filter */}
        <div>
          <label
            htmlFor="neighborhood-filter"
            className="mb-2 block text-sm font-medium"
          >
            {locale === 'he' ? 'שכונה' : 'Район'}
          </label>
          <select
            id="neighborhood-filter"
            value={selectedNeighborhood}
            onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            disabled={isPending}
          >
            <option value="">
              {locale === 'he' ? 'כל השכונות' : 'Все районы'}
            </option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.id}>
                {locale === 'he' ? neighborhood.name_he : neighborhood.name_ru}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label
            htmlFor="category-filter"
            className="mb-2 block text-sm font-medium"
          >
            {locale === 'he' ? 'קטגוריה' : 'Категория'}
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            disabled={isPending}
          >
            <option value="">
              {locale === 'he' ? 'כל הקטגוריות' : 'Все категории'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {locale === 'he' ? category.name_he : category.name_ru}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="mt-3 text-sm text-gray-500">
          {locale === 'he' ? 'מעדכן...' : 'Обновление...'}
        </div>
      )}
    </div>
  )
}
