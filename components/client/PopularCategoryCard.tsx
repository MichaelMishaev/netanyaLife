'use client'

import { useRouter } from 'next/navigation'

interface PopularCategoryCardProps {
  categoryId: string
  categorySlug: string
  categoryName: string
  icon: string | null
  locale: string
  defaultNeighborhoodSlug: string
}

export default function PopularCategoryCard({
  categoryId,
  categorySlug,
  categoryName,
  icon,
  locale,
  defaultNeighborhoodSlug,
}: PopularCategoryCardProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // Read LATEST neighborhood from localStorage at click time
    let neighborhoodSlug = defaultNeighborhoodSlug

    if (typeof window !== 'undefined') {
      const lastFormValues = localStorage.getItem('lastSearchFormValues')
      if (lastFormValues) {
        try {
          const parsed = JSON.parse(lastFormValues)
          if (parsed.neighborhoodSlug) {
            neighborhoodSlug = parsed.neighborhoodSlug
          }
        } catch (e) {
          console.error('Error reading last neighborhood:', e)
        }
      }
    }

    // Navigate with the latest neighborhood
    router.push(`/${locale}/search/${categorySlug}/${neighborhoodSlug}`)
  }

  return (
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
  )
}
