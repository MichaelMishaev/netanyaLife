'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface SearchFormProps {
  categories: Array<{
    id: string
    name_he: string
    name_ru: string
    slug: string
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
  const [categorySlug, setCategorySlug] = useState('')
  const [neighborhoodSlug, setNeighborhoodSlug] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!categorySlug || !neighborhoodSlug) {
      setError(t('requiredFields'))
      return
    }

    // Navigate to results page
    const url = `/${locale}/search/${categorySlug}/${neighborhoodSlug}`
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
          <select
            id="category"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

        {/* Neighborhood Select */}
        <div>
          <label
            htmlFor="neighborhood"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t('neighborhoodPlaceholder')}
          </label>
          <select
            id="neighborhood"
            value={neighborhoodSlug}
            onChange={(e) => setNeighborhoodSlug(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">{t('neighborhoodPlaceholder')}</option>
            <option value="all">{t('allNetanya')}</option>
            {neighborhoods.map((hood) => (
              <option key={hood.id} value={hood.slug}>
                {locale === 'he' ? hood.name_he : hood.name_ru}
              </option>
            ))}
          </select>
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
          className="w-full rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {t('searchButton')}
        </button>
      </div>
    </form>
  )
}
