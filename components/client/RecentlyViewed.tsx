'use client'

import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext'
import Link from 'next/link'

interface RecentlyViewedProps {
  locale: string
}

export default function RecentlyViewed({ locale }: RecentlyViewedProps) {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed()

  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {locale === 'he' ? 'נצפו לאחרונה' : 'Просмотрено недавно'}
        </h2>
        <button
          onClick={clearRecentlyViewed}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {locale === 'he' ? 'נקה היסטוריה' : 'Очистить историю'}
        </button>
      </div>

      {/* Horizontal Scrollable List */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {recentlyViewed.map((business) => {
            const name =
              locale === 'he'
                ? business.name_he
                : business.name_ru || business.name_he

            return (
              <Link
                key={business.id}
                href={`/${locale}/business/${business.slug}`}
                className="min-w-[200px] flex-shrink-0 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-primary-500 hover:shadow-md"
              >
                <h3 className="mb-2 line-clamp-2 font-medium text-gray-900">
                  {name}
                </h3>
                <p className="text-xs text-gray-500">
                  {new Date(business.viewedAt).toLocaleDateString(
                    locale === 'he' ? 'he-IL' : 'ru-RU',
                    {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
