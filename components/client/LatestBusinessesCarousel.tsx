'use client'

import { useEffect, useState, useRef } from 'react'

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
  const [isTransitioning, setIsTransitioning] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Create infinite loop by triplicating the array
  // This ensures smooth loop without jumps
  const infiniteBusinesses = [...businesses, ...businesses, ...businesses]

  // Start from the middle copy to allow seamless backward loop
  const startIndex = businesses.length

  useEffect(() => {
    // Set initial position to middle copy (without animation)
    setCurrentIndex(startIndex)
    setIsTransitioning(false)

    const timer = setTimeout(() => {
      setIsTransitioning(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [startIndex])

  // Auto-scroll every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  // Handle seamless loop reset
  useEffect(() => {
    if (currentIndex >= businesses.length * 2) {
      // Reached end of second copy, jump back to start of second copy
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(startIndex)

        setTimeout(() => {
          setIsTransitioning(true)
        }, 50)
      }, 1000) // Wait for transition to complete

      return () => clearTimeout(timer)
    }
  }, [currentIndex, businesses.length, startIndex])

  // Calculate which business from original array is currently shown
  const displayIndex = currentIndex % businesses.length

  return (
    <div className="rounded-xl border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-sm">
      {/* Section Header */}
      <div className="border-b border-gray-100 px-6 py-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {locale === 'he' ? 'הצטרפו לאחרונה' : 'Недавно присоединились'}
        </h3>
      </div>

      {/* Carousel Container - Fixed height for 3 items */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height: '195px' }} // ~65px per item × 3 = 195px
      >
        <div
          className="divide-y divide-gray-100"
          style={{
            transform: `translateY(-${currentIndex * 65}px)`,
            transition: isTransitioning ? 'transform 1000ms ease-in-out' : 'none',
          }}
        >
          {infiniteBusinesses.map((business, index) => (
            <div
              key={`${business.id}-${index}`}
              className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-gray-50/50"
              style={{ minHeight: '65px' }}
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
      <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 px-6 py-3">
        {businesses.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === displayIndex
                ? 'w-6 bg-primary-600'
                : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
