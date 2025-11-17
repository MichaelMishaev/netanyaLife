'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useAnalytics } from '@/contexts/AnalyticsContext'

interface SearchFormProps {
  categories: Array<{
    id: string
    name_he: string
    name_ru: string
    slug: string
    subcategories: Array<{
      id: string
      name_he: string
      name_ru: string
      slug: string
    }>
  }>
  neighborhoods: Array<{
    id: string
    name_he: string
    name_ru: string
    slug: string
  }>
  locale: string
}

export default function SearchForm({
  categories,
  neighborhoods,
  locale,
}: SearchFormProps) {
  const t = useTranslations('home.search')
  const router = useRouter()
  const { trackEvent } = useAnalytics()
  const [categorySlug, setCategorySlug] = useState('')
  const [subcategorySlug, setSubcategorySlug] = useState('')
  const [neighborhoodSlug, setNeighborhoodSlug] = useState('')
  const [error, setError] = useState('')
  const categoryRef = useRef<HTMLSelectElement>(null)
  const neighborhoodRef = useRef<HTMLSelectElement>(null)

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.slug === categorySlug)
  const availableSubcategories = selectedCategory?.subcategories || []

  // Load previously selected values from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCategory = localStorage.getItem('lastSearchCategory')
      const savedNeighborhood = localStorage.getItem('lastSearchNeighborhood')
      
      if (savedCategory && categories.some((cat) => cat.slug === savedCategory)) {
        setCategorySlug(savedCategory)
      }
      if (savedNeighborhood && neighborhoods.some((hood) => hood.slug === savedNeighborhood)) {
        setNeighborhoodSlug(savedNeighborhood)
      }
    }
  }, [categories, neighborhoods])

  // Set custom validation messages in the selected language
  useEffect(() => {
    const categoryEl = categoryRef.current
    const neighborhoodEl = neighborhoodRef.current

    const handleCategoryInvalid = () => {
      if (categoryEl) {
        categoryEl.setCustomValidity(t('categoryPlaceholder'))
      }
    }

    const handleNeighborhoodInvalid = () => {
      if (neighborhoodEl) {
        neighborhoodEl.setCustomValidity(t('neighborhoodPlaceholder'))
      }
    }

    const handleCategoryChange = () => {
      if (categoryEl) {
        categoryEl.setCustomValidity('')
      }
    }

    const handleNeighborhoodChange = () => {
      if (neighborhoodEl) {
        neighborhoodEl.setCustomValidity('')
      }
    }

    if (categoryEl) {
      categoryEl.addEventListener('invalid', handleCategoryInvalid)
      categoryEl.addEventListener('change', handleCategoryChange)
    }

    if (neighborhoodEl) {
      neighborhoodEl.addEventListener('invalid', handleNeighborhoodInvalid)
      neighborhoodEl.addEventListener('change', handleNeighborhoodChange)
    }

    return () => {
      if (categoryEl) {
        categoryEl.removeEventListener('invalid', handleCategoryInvalid)
        categoryEl.removeEventListener('change', handleCategoryChange)
      }
      if (neighborhoodEl) {
        neighborhoodEl.removeEventListener('invalid', handleNeighborhoodInvalid)
        neighborhoodEl.removeEventListener('change', handleNeighborhoodChange)
      }
    }
  }, [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!categorySlug || !neighborhoodSlug) {
      setError(t('requiredFields'))
      return
    }

    // Save selected values to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSearchCategory', categorySlug)
      localStorage.setItem('lastSearchNeighborhood', neighborhoodSlug)
    }

    // Track search event
    await trackEvent('search_performed', {
      category: categorySlug,
      subcategory: subcategorySlug || undefined,
      neighborhood: neighborhoodSlug,
      language: locale,
    })

    // Navigate to results page
    const url = subcategorySlug
      ? `/${locale}/search/${categorySlug}/${neighborhoodSlug}?subcategory=${subcategorySlug}`
      : `/${locale}/search/${categorySlug}/${neighborhoodSlug}`
    router.push(url)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="space-y-4">
        {/* Category Select */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t('categoryPlaceholder')}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <select
              id="category"
              ref={categoryRef}
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value)
                setSubcategorySlug('') // Reset subcategory when category changes
              }}
              className="w-full rounded-lg border border-gray-300 py-3 pe-4 ps-10 transition-all duration-200 hover:border-primary-400 hover:shadow-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">{t('categoryPlaceholder')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {locale === 'he' ? cat.name_he : cat.name_ru}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subcategory Select - Only shown if category has subcategories */}
        {availableSubcategories.length > 0 && (
          <div className="animate-fade-in-up">
            <label
              htmlFor="subcategory"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {locale === 'he' ? 'תת-קטגוריה' : 'Подкатегория'}{' '}
              <span className="text-xs text-gray-500">
                ({locale === 'he' ? 'אופציונלי' : 'необязательно'})
              </span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <select
                id="subcategory"
                value={subcategorySlug}
                onChange={(e) => setSubcategorySlug(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pe-4 ps-10 transition-all duration-200 hover:border-primary-400 hover:shadow-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">
                  {locale === 'he' ? 'כל התת-קטגוריות' : 'Все подкатегории'}
                </option>
                {availableSubcategories.map((subcat) => (
                  <option key={subcat.id} value={subcat.slug}>
                    {locale === 'he' ? subcat.name_he : subcat.name_ru}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Neighborhood Select */}
        <div>
          <label
            htmlFor="neighborhood"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t('neighborhoodPlaceholder')}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <select
              id="neighborhood"
              ref={neighborhoodRef}
              value={neighborhoodSlug}
              onChange={(e) => setNeighborhoodSlug(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pe-4 ps-10 transition-all duration-200 hover:border-primary-400 hover:shadow-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">{t('neighborhoodPlaceholder')}</option>
              {neighborhoods.map((hood) => (
                <option key={hood.id} value={hood.slug}>
                  {locale === 'he' ? hood.name_he : hood.name_ru}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-primary-700 hover:to-primary-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98]"
        >
          {t('searchButton')}
        </button>
      </div>
    </form>
  )
}
