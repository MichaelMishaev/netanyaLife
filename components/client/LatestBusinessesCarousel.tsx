'use client'

import { useEffect, useState } from 'react'

interface Business {
  id: string
  name_he: string
  name_ru: string | null
  category: {
    name_he: string
    name_ru: string
  } | null
}

interface LatestBusinessesCarouselProps {
  businesses: Business[]
  locale: string
}

export default function LatestBusinessesCarousel({
  businesses,
  locale,
}: LatestBusinessesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Move to next business, loop back to start if at end
        const nextIndex = prevIndex + 1
        return nextIndex >= businesses.length ? 0 : nextIndex
      })
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [businesses.length])

  // Create extended list for seamless loop (duplicate businesses for smooth transition)
  const extendedBusinesses = [...businesses, ...businesses.slice(0, 3)]

  return (
    <div className="rounded-xl border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-sm">
      {/* Section Header */}
      <div className="border-b border-gray-100 px-6 py-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {locale === 'he' ? 'הצטרפו לאחרונה' : 'Недавно присоединились'}
        </h3>
      </div>

      {/* Latest Businesses List with Scrolling Animation */}
      <div className="overflow-hidden">
        <div
          className="divide-y divide-gray-100 p-2 transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateY(-${currentIndex * 33.33}%)`,
          }}
        >
          {extendedBusinesses.map((business, index) => (
            <div
              key={`${business.id}-${index}`}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50/50"
            >
              <div className="flex min-w-0 flex-col">
                <div className="truncate text-sm font-semibold text-gray-800">
                  {locale === 'he' ? business.name_he : business.name_ru || business.name_he}
                </div>
                <div className="truncate text-xs text-gray-500">
                  {business.category
                    ? locale === 'he'
                      ? business.category.name_he
                      : business.category.name_ru
                    : ''}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {locale === 'he' ? 'חדש' : 'Новый'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 px-6 py-3">
        {businesses.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex % businesses.length
                ? 'w-6 bg-primary-600'
                : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
