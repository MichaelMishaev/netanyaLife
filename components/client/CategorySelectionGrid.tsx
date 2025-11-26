'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface Category {
  id: string
  slug: string
  name_he: string
  name_ru: string
  icon?: ReactNode
}

interface Neighborhood {
  id: string
  slug: string
  name_he: string
  name_ru: string
}

interface CategorySelectionGridProps {
  categories: Category[]
  neighborhoods: Neighborhood[]
  locale: string
}

export default function CategorySelectionGrid({
  categories,
  neighborhoods,
  locale,
}: CategorySelectionGridProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [defaultNeighborhood, setDefaultNeighborhood] = useState<string>(neighborhoods[0]?.slug || '')

  // Load last selected neighborhood from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastFormValues = localStorage.getItem('lastSearchFormValues')
      if (lastFormValues) {
        try {
          const parsed = JSON.parse(lastFormValues)
          if (parsed.neighborhoodSlug) {
            // Verify the neighborhood still exists
            const validNeighborhood = neighborhoods.find(n => n.slug === parsed.neighborhoodSlug)
            if (validNeighborhood) {
              setDefaultNeighborhood(parsed.neighborhoodSlug)
            }
          }
        } catch (e) {
          console.error('Error reading last neighborhood:', e)
        }
      }
    }
  }, [neighborhoods])

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
  }

  const handleNeighborhoodSelect = (neighborhoodSlug: string) => {
    if (selectedCategory) {
      router.push(`/${locale}/search/${selectedCategory.slug}/${neighborhoodSlug}`)
    }
  }

  const handleCancel = () => {
    setSelectedCategory(null)
  }

  return (
    <>
      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category) => {
          const name = locale === 'he' ? category.name_he : category.name_ru
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {category.icon && (
                <div className="mb-3 text-4xl transition-transform group-hover:scale-110">
                  {category.icon}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                {name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Neighborhood Selection Modal */}
      {selectedCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-6 text-center">
              {selectedCategory.icon && (
                <div className="mb-3 text-5xl">{selectedCategory.icon}</div>
              )}
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {locale === 'he' ? selectedCategory.name_he : selectedCategory.name_ru}
              </h2>
              <p className="text-gray-600">
                {locale === 'he'
                  ? 'באיזו שכונה אתה מחפש?'
                  : 'В каком районе вы ищете?'}
              </p>
            </div>

            {/* Neighborhood Buttons */}
            <div className="space-y-3">
              {neighborhoods.map((neighborhood) => {
                const name = locale === 'he' ? neighborhood.name_he : neighborhood.name_ru
                return (
                  <button
                    key={neighborhood.id}
                    onClick={() => handleNeighborhoodSelect(neighborhood.slug)}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-center font-medium text-gray-900 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    {name}
                  </button>
                )
              })}

              {/* All City Option - Searches across all neighborhoods */}
              <button
                onClick={() => handleNeighborhoodSelect('all')}
                className="w-full rounded-lg border-2 border-primary-500 bg-primary-50 px-4 py-3 text-center font-semibold text-primary-700 transition-all hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {locale === 'he' ? 'כל נתניה' : 'Вся Нетания'}
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="mt-4 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              {locale === 'he' ? 'ביטול' : 'Отмена'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
