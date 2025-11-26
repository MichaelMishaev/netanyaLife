'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import {
  getRecentSearches,
  saveRecentSearch,
  formatRecentSearch,
  type RecentSearch,
} from '@/lib/utils/recentSearches'
import { getVariant } from '@/lib/utils/ab-test'
import { detectNeighborhood, isGeolocationSupported } from '@/lib/utils/geolocation'
import { getCategoryIcon } from '@/lib/utils/categoryIcons'
import SearchableSelect from './SearchableSelect'

// A/B Test Configuration
const AB_TEST_ENABLED = false // Set to false to show new design to everyone
const TREATMENT_PERCENTAGE = 50 // 50% of users see new design

interface SearchFormProps {
  categories: Array<{
    id: string
    name_he: string
    name_ru: string
    slug: string
    is_popular: boolean
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
  const [neighborhoodSlug, setNeighborhoodSlug] = useState('') // Empty by default
  const [error, setError] = useState('')
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [variant, setVariant] = useState<'control' | 'treatment'>('treatment')
  const [valuesRestored, setValuesRestored] = useState(false)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const neighborhoodRef = useRef<HTMLSelectElement>(null)
  const isInitialMount = useRef(true)

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.slug === categorySlug)
  const availableSubcategories = selectedCategory?.subcategories || []

  // Load recent searches and restore form values on back navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const recent = getRecentSearches()
      setRecentSearches(recent.slice(0, 3)) // Show max 3

      // Detect if user arrived via back/forward navigation
      const isBackForwardNavigation =
        window.performance?.navigation?.type === 2 || // Legacy API
        (window.performance?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined)?.type === 'back_forward' // New API

      if (isBackForwardNavigation) {
        // User pressed back/forward - restore their last choice
        const lastFormValues = localStorage.getItem('lastSearchFormValues')
        if (lastFormValues) {
          try {
            const parsed = JSON.parse(lastFormValues)
            if (parsed.categorySlug) {
              setCategorySlug(parsed.categorySlug)
            }
            if (parsed.subcategorySlug) {
              setSubcategorySlug(parsed.subcategorySlug)
            }
            if (parsed.neighborhoodSlug) {
              // Verify the neighborhood still exists
              const validNeighborhood = neighborhoods.find(n => n.slug === parsed.neighborhoodSlug)
              if (validNeighborhood) {
                setNeighborhoodSlug(parsed.neighborhoodSlug)
              }
            }
            setValuesRestored(true)
          } catch (e) {
            console.error('Error restoring form values:', e)
          }
        }
      } else {
        // Fresh page load or refresh - clear everything (empty state)
        localStorage.removeItem('lastSearchFormValues')
        // All filters remain empty - geolocation will handle neighborhood if user approves
      }
    }
  }, [neighborhoods])

  // A/B Test: Assign variant on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && AB_TEST_ENABLED) {
      const assignedVariant = getVariant('search_form_design', TREATMENT_PERCENTAGE)
      setVariant(assignedVariant)

      // Track variant assignment
      trackEvent('search_form_view', {
        variant: assignedVariant,
        test_name: 'search_form_design',
      })
    }
  }, [trackEvent])

  // Geolocation: Auto-detect neighborhood on mount (only if no previous selection exists)
  useEffect(() => {
    const autoDetectLocation = async () => {
      // Check if there's a saved location in localStorage - if so, don't override with geolocation
      if (typeof window !== 'undefined') {
        const lastFormValues = localStorage.getItem('lastSearchFormValues')
        if (lastFormValues) {
          try {
            const parsed = JSON.parse(lastFormValues)
            if (parsed.neighborhoodSlug) {
              // User has a previous selection, don't override with geolocation
              return
            }
          } catch (e) {
            // If parsing fails, continue with geolocation
          }
        }
      }

      // Geolocation is opt-in - will ask user for permission
      if (isGeolocationSupported()) {
        const detectedSlug = await detectNeighborhood()

        // If user denies or geolocation fails, falls back to default/last selection
        if (detectedSlug) {
          // Check if the detected slug exists in neighborhoods
          const validNeighborhood = neighborhoods.find((n) => n.slug === detectedSlug)
          if (validNeighborhood) {
            setNeighborhoodSlug(detectedSlug)

            // Track geolocation success
            trackEvent('geolocation_detected', {
              neighborhood: detectedSlug,
            })
          }
        }
      }
    }

    autoDetectLocation()
  }, [neighborhoods, trackEvent])

  // Mark initial mount as complete after first render
  useEffect(() => {
    isInitialMount.current = false
  }, [])

  // Save neighborhood selection to localStorage immediately (for cross-component consistency)
  // This ensures PopularCategoryCard and other components can read the latest selection
  useEffect(() => {
    // Skip during initial mount (prevents saving geolocation/restored values)
    // After that, save any neighborhood change to localStorage
    if (!isInitialMount.current && typeof window !== 'undefined' && neighborhoodSlug) {
      const currentValues = localStorage.getItem('lastSearchFormValues')
      const parsed = currentValues ? JSON.parse(currentValues) : {}

      localStorage.setItem('lastSearchFormValues', JSON.stringify({
        ...parsed,
        neighborhoodSlug
      }))
    }
  }, [neighborhoodSlug])

  // Set custom validation messages for category
  useEffect(() => {
    const categoryEl = categoryRef.current

    const handleCategoryInvalid = () => {
      if (categoryEl) {
        categoryEl.setCustomValidity(t('categoryPlaceholder'))
      }
    }

    const handleCategoryChange = () => {
      if (categoryEl) {
        categoryEl.setCustomValidity('')
      }
    }

    if (categoryEl) {
      categoryEl.addEventListener('invalid', handleCategoryInvalid)
      categoryEl.addEventListener('change', handleCategoryChange)
    }

    return () => {
      if (categoryEl) {
        categoryEl.removeEventListener('invalid', handleCategoryInvalid)
        categoryEl.removeEventListener('change', handleCategoryChange)
      }
    }
  }, [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!categorySlug) {
      setError(t('requiredFields'))
      return
    }

    // Get category and subcategory data for saving
    const category = categories.find((c) => c.slug === categorySlug)
    const subcategory = availableSubcategories.find((s) => s.slug === subcategorySlug)
    const neighborhood = neighborhoods.find((n) => n.slug === neighborhoodSlug)

    // Save to recent searches
    if (category && neighborhood) {
      const recentSearch: RecentSearch = {
        categorySlug: category.slug,
        categoryName_he: category.name_he,
        categoryName_ru: category.name_ru,
        subcategorySlug: subcategory?.slug,
        subcategoryName_he: subcategory?.name_he,
        subcategoryName_ru: subcategory?.name_ru,
        neighborhoodSlug: neighborhoodSlug,
        neighborhoodName_he: neighborhood.name_he,
        neighborhoodName_ru: neighborhood.name_ru,
        timestamp: new Date().toISOString(),
      }
      saveRecentSearch(recentSearch)
    }

    // Track search event
    await trackEvent('search_performed', {
      category: categorySlug,
      subcategory: subcategorySlug || undefined,
      neighborhood: neighborhoodSlug,
      language: locale,
    })

    // Save current form values for restoration on back navigation
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSearchFormValues', JSON.stringify({
        categorySlug,
        subcategorySlug,
        neighborhoodSlug
      }))
    }

    // Navigate to results page
    const url = subcategorySlug
      ? `/${locale}/search/${categorySlug}/${neighborhoodSlug}?subcategory=${subcategorySlug}`
      : `/${locale}/search/${categorySlug}/${neighborhoodSlug}`
    router.push(url)
  }

  // Handle clicking a recent search
  const handleRecentSearchClick = async (search: RecentSearch) => {
    setCategorySlug(search.categorySlug)
    setSubcategorySlug(search.subcategorySlug || '')
    setNeighborhoodSlug(search.neighborhoodSlug)

    // Track event
    await trackEvent('recent_search_clicked', {
      category: search.categorySlug,
      subcategory: search.subcategorySlug,
      neighborhood: search.neighborhoodSlug,
    })
  }

  // Check if any filters are applied
  const hasFiltersApplied = categorySlug !== '' || subcategorySlug !== ''

  // Clear all filters - reset to empty state
  const handleClearFilters = () => {
    setCategorySlug('')
    setSubcategorySlug('')
    setError('')

    // Clear localStorage when user manually clears
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lastSearchFormValues')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="space-y-4">
        {/* Clear Filters Button - Only shown when filters applied */}
        {hasFiltersApplied && (
          <div className="flex justify-end animate-fade-in-up">
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{locale === 'he' ? 'נקה סינונים' : 'Очистить фильтры'}</span>
            </button>
          </div>
        )}

        {/* Category Select */}
        <div>
          <SearchableSelect
            options={[...categories]
              .sort((a, b) => {
                // Popular categories first
                if (a.is_popular && !b.is_popular) return -1
                if (!a.is_popular && b.is_popular) return 1
                // Then maintain original order (already sorted by display_order from server)
                return 0
              })
              .map((cat) => {
                const icon = getCategoryIcon(cat.slug)
                const name = locale === 'he' ? cat.name_he : cat.name_ru
                return {
                  value: cat.slug,
                  label: name,
                  icon: icon || undefined,
                }
              })}
            value={categorySlug}
            onChange={(value) => {
              setCategorySlug(value)
              setSubcategorySlug('') // Reset subcategory when category changes
            }}
            placeholder={t('categoryPlaceholder')}
            searchPlaceholder={locale === 'he' ? 'חיפוש קטגוריה...' : 'Поиск категории...'}
            emptyMessage={locale === 'he' ? 'לא נמצאו קטגוריות' : 'Категории не найдены'}
            label={t('categoryPlaceholder')}
            required={true}
            icon={
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            dir={locale === 'he' ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Subcategory Select - Only shown if category has subcategories */}
        {availableSubcategories.length > 0 && (
          <div className="animate-fade-in-up">
            <SearchableSelect
              options={[
                {
                  value: '',
                  label: locale === 'he' ? 'כל התת-קטגוריות' : 'Все подкатегории',
                },
                ...availableSubcategories.map((subcat) => ({
                  value: subcat.slug,
                  label: locale === 'he' ? subcat.name_he : subcat.name_ru,
                })),
              ]}
              value={subcategorySlug}
              onChange={(value) => setSubcategorySlug(value)}
              placeholder={locale === 'he' ? 'כל התת-קטגוריות' : 'Все подкатегории'}
              searchPlaceholder={locale === 'he' ? 'חיפוש תת-קטגוריה...' : 'Поиск подкатегории...'}
              emptyMessage={locale === 'he' ? 'לא נמצאו תת-קטגוריות' : 'Подкатегории не найдены'}
              label={
                <>
                  {locale === 'he' ? 'תת-קטגוריה' : 'Подкатегория'}{' '}
                  <span className="text-xs text-gray-500">
                    ({locale === 'he' ? 'אופציונלי' : 'необязательно'})
                  </span>
                </>
              }
              required={false}
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
              dir={locale === 'he' ? 'rtl' : 'ltr'}
            />
          </div>
        )}

        {/* Neighborhood Selection - A/B Test */}
        <div>
          <label
            htmlFor={variant === 'control' ? 'neighborhood-select' : 'neighborhood-label'}
            id="neighborhood-label"
            className={variant === 'control' ? 'mb-2 block text-sm font-medium text-gray-700' : 'mb-3 block text-sm font-medium text-gray-700'}
          >
            {t('neighborhoodPlaceholder')}
          </label>

          {variant === 'control' ? (
            /* CONTROL: Old Dropdown Design */
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <select
                id="neighborhood-select"
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
          ) : (
            /* TREATMENT: New Segmented Buttons Design - Responsive grid */
            <div
              role="radiogroup"
              aria-labelledby="neighborhood-label"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {neighborhoods.map((hood) => (
                <button
                  key={hood.id}
                  type="button"
                  role="radio"
                  aria-checked={neighborhoodSlug === hood.slug}
                  aria-label={
                    locale === 'he'
                      ? `${hood.name_he} נתניה`
                      : `${hood.name_ru} Нетания`
                  }
                  onClick={() => setNeighborhoodSlug(hood.slug)}
                  className={`
                    rounded-lg border-2 px-2 py-3 text-sm sm:text-base font-medium flex items-center justify-center transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${
                      neighborhoodSlug === hood.slug
                        ? 'border-primary-600 bg-primary-600 text-white shadow-md hover:bg-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'
                    }
                  `}
                >
                  {locale === 'he' ? hood.name_he : hood.name_ru}
                </button>
              ))}
            </div>
          )}
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
          className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-primary-700 hover:to-primary-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98]"
        >
          {t('searchButton')}
        </button>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {locale === 'he' ? 'חיפושים אחרונים' : 'Недавние поиски'}
            </div>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-start text-sm text-gray-600 transition-colors duration-150 hover:text-primary-600 hover:underline"
                >
                  • {formatRecentSearch(search, locale as 'he' | 'ru')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
