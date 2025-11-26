'use client'

import Link from 'next/link'
import { useAnalytics } from '@/contexts/AnalyticsContext'

interface ViewAllCityButtonProps {
  href: string
  locale: string
  categoryName: string
  neighborhoodName: string
  currentCount: number
}

export default function ViewAllCityButton({
  href,
  locale,
  categoryName,
  neighborhoodName,
  currentCount,
}: ViewAllCityButtonProps) {
  const { trackEvent } = useAnalytics()

  const handleClick = () => {
    trackEvent('search_all_city_clicked', {
      original_neighborhood: neighborhoodName,
      category: categoryName,
      current_results_count: currentCount,
    })
  }

  return (
    <div className="mt-8 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex items-center gap-2">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-semibold text-blue-900">
            {locale === 'he'
              ? `מציג ${currentCount} תוצאות ב${neighborhoodName}`
              : `Показано ${currentCount} результатов в ${neighborhoodName}`}
          </p>
        </div>

        <p className="mb-4 text-sm text-blue-700">
          {locale === 'he'
            ? 'רוצה לראות עוד אפשרויות? חפש בכל נתניה'
            : 'Хотите увидеть больше вариантов? Ищите по всей Нетании'}
        </p>

        <Link
          href={href}
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary-600 bg-white px-6 py-3 font-medium text-primary-700 shadow-sm transition hover:bg-primary-50 hover:shadow-md active:scale-[0.98]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <span>
            {locale === 'he'
              ? 'צפה בכל התוצאות בנתניה'
              : 'Посмотреть все результаты в Нетании'}
          </span>
        </Link>
      </div>
    </div>
  )
}
