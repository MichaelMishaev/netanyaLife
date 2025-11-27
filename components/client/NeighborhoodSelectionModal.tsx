'use client'

import { ReactNode } from 'react'

interface Neighborhood {
  id: string
  slug: string
  name_he: string
  name_ru: string
}

interface NeighborhoodSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (neighborhoodSlug: string) => void
  neighborhoods: Neighborhood[]
  locale: string
  categoryName?: string
  categoryIcon?: ReactNode
}

export default function NeighborhoodSelectionModal({
  isOpen,
  onClose,
  onSelect,
  neighborhoods,
  locale,
  categoryName,
  categoryIcon,
}: NeighborhoodSelectionModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-6 text-center">
          {categoryIcon && (
            <div className="mb-3 text-5xl">{categoryIcon}</div>
          )}
          {categoryName && (
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {categoryName}
            </h2>
          )}
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
                onClick={() => onSelect(neighborhood.slug)}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-center font-medium text-gray-900 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {name}
              </button>
            )
          })}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          {locale === 'he' ? 'ביטול' : 'Отмена'}
        </button>
      </div>
    </div>
  )
}
