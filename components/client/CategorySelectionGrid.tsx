'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import NeighborhoodSelectionModal from './NeighborhoodSelectionModal'

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
      <NeighborhoodSelectionModal
        isOpen={!!selectedCategory}
        onClose={handleCancel}
        onSelect={handleNeighborhoodSelect}
        neighborhoods={neighborhoods}
        locale={locale}
        categoryName={selectedCategory ? (locale === 'he' ? selectedCategory.name_he : selectedCategory.name_ru) : undefined}
        categoryIcon={selectedCategory?.icon}
      />
    </>
  )
}
