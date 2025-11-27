'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NeighborhoodSelectionModal from './NeighborhoodSelectionModal'

interface Neighborhood {
  id: string
  slug: string
  name_he: string
  name_ru: string
}

interface PopularCategoryCardProps {
  categoryId: string
  categorySlug: string
  categoryName: string
  icon: string | null
  locale: string
  neighborhoods: Neighborhood[]
}

export default function PopularCategoryCard({
  categoryId,
  categorySlug,
  categoryName,
  icon,
  locale,
  neighborhoods,
}: PopularCategoryCardProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowModal(true)
  }

  const handleNeighborhoodSelect = (neighborhoodSlug: string) => {
    router.push(`/${locale}/search/${categorySlug}/${neighborhoodSlug}`)
    setShowModal(false)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-full"
      >
        {icon && (
          <div className="mb-3 text-4xl transition-transform group-hover:scale-110">
            {icon}
          </div>
        )}
        <span className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
          {categoryName}
        </span>
      </button>

      <NeighborhoodSelectionModal
        isOpen={showModal}
        onClose={handleClose}
        onSelect={handleNeighborhoodSelect}
        neighborhoods={neighborhoods}
        locale={locale}
        categoryName={categoryName}
        categoryIcon={icon ? <div>{icon}</div> : undefined}
      />
    </>
  )
}
