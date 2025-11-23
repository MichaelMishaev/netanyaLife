'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

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
  testBusinessCount?: number
  realBusinessCount?: number
}

export default function BusinessFilters({
  locale,
  neighborhoods,
  categories,
  testBusinessCount = 0,
  realBusinessCount = 0,
}: BusinessFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const selectedNeighborhood = searchParams.get('neighborhood') || ''
  const selectedCategory = searchParams.get('category') || ''
  const showTestBusinesses = searchParams.get('showTest') === 'true'
  const searchQuery = searchParams.get('search') || ''
  const [searchInput, setSearchInput] = useState(searchQuery)

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
    setSearchInput('')
    startTransition(() => {
      router.push(`/${locale}/admin/businesses`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange('search', searchInput.trim())
  }

  const hasActiveFilters = selectedNeighborhood || selectedCategory || showTestBusinesses || searchQuery

  const handleToggleTest = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (showTestBusinesses) {
      params.delete('showTest')
    } else {
      params.set('showTest', 'true')
    }
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

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

      {/* Search by Name */}
      <form onSubmit={handleSearch} className="mb-4">
        <label htmlFor="search-input" className="mb-2 block text-sm font-medium">
          {locale === 'he' ? 'חיפוש לפי שם' : 'Поиск по названию'}
        </label>
        <div className="flex gap-2">
          <input
            id="search-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={locale === 'he' ? 'הקלד שם עסק...' : 'Введите название...'}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !searchInput.trim()}
            className="rounded-lg bg-primary-600 px-4 py-2 text-white transition hover:bg-primary-700 disabled:bg-gray-300"
          >
            {locale === 'he' ? 'חפש' : 'Найти'}
          </button>
        </div>
      </form>

      {/* Test Business Toggle */}
      <div className={`mb-4 flex items-center justify-between rounded-lg p-3 ${
        showTestBusinesses ? 'bg-amber-50' : 'bg-green-50'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            showTestBusinesses ? 'text-amber-800' : 'text-green-800'
          }`}>
            {showTestBusinesses
              ? (locale === 'he' ? '🧪 עסקי בדיקה' : '🧪 Тестовые')
              : (locale === 'he' ? '✅ עסקים אמיתיים' : '✅ Реальные')
            }
          </span>
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${
            showTestBusinesses
              ? 'bg-amber-200 text-amber-800'
              : 'bg-green-200 text-green-800'
          }`}>
            {showTestBusinesses ? testBusinessCount : realBusinessCount}
          </span>
        </div>
        <button
          onClick={handleToggleTest}
          disabled={isPending}
          dir="ltr"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showTestBusinesses ? 'bg-amber-500' : 'bg-green-500'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showTestBusinesses ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
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
