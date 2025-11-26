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
  const [isPaused, setIsPaused] = useState(false)
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

  // Auto-scroll every 3.5 seconds (only if not paused)
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 3500)

    return () => clearInterval(interval)
  }, [isPaused])

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
      {/* Section Header with Pause Button */}
      <div className="border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          {locale === 'he' ? 'הצטרפו לאחרונה' : 'Недавно присоединились'}
        </h3>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={isPaused ? (locale === 'he' ? 'המשך' : 'Возобновить') : (locale === 'he' ? 'עצור' : 'Приостановить')}
          title={isPaused ? (locale === 'he' ? 'המשך גלילה אוטומטית' : 'Возобновить автоматическую прокрутку') : (locale === 'he' ? 'עצור גלילה אוטומטית' : 'Приостановить автоматическую прокрутку')}
        >
          {isPaused ? (
            // Play icon
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          ) : (
            // Pause icon
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
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
