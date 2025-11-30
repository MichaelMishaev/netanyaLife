'use client'

import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

interface RecentlyViewedProps {
  locale: string
}

export default function RecentlyViewed({ locale }: RecentlyViewedProps) {
  const { recentlyViewed, clearRecentlyViewed, isHydrated } = useRecentlyViewed()
  const t = useTranslations('home.recentlyViewed')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Don't render during SSR to prevent hydration mismatch
  if (!isHydrated || recentlyViewed.length === 0) {
    return null
  }

  const handleClearClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmClear = () => {
    clearRecentlyViewed()
    setShowConfirmDialog(false)
  }

  const handleCancelClear = () => {
    setShowConfirmDialog(false)
  }

  return (
    <div className="mb-12">
      {/* Header Section */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 md:text-2xl">
              {t('title')}
            </h2>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {/* Mobile: show count of displayed items (max 3) */}
              <span className="md:hidden">
                {Math.min(recentlyViewed.length, 3)}{' '}
                {locale === 'he' ? 'עסקים נצפו לאחרונה' : 'недавно просмотренных'}
              </span>
              {/* Desktop: show total count */}
              <span className="hidden md:inline">
                {recentlyViewed.length}{' '}
                {locale === 'he' ? 'עסקים נצפו לאחרונה' : 'недавно просмотренных'}
              </span>
            </p>
          </div>

          <button
            onClick={handleClearClick}
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto sm:px-4 sm:text-sm"
            aria-label={t('clearHistory')}
          >
            {/* Trash Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform group-hover:scale-110"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{t('clearHistory')}</span>
          </button>
        </div>
      </div>

      {/* Mobile: Vertical Stack, Desktop: Horizontal Scroll */}
      <div className="space-y-3 md:space-y-0">
        {/* Mobile: Stacked Cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {recentlyViewed.slice(0, 3).map((business) => {
            const name =
              locale === 'he'
                ? business.name_he
                : business.name_ru || business.name_he

            const categoryName =
              locale === 'he'
                ? business.category_name_he
                : business.category_name_ru || business.category_name_he

            const neighborhoodName =
              locale === 'he'
                ? business.neighborhood_name_he
                : business.neighborhood_name_ru || business.neighborhood_name_he

            const formattedDate = new Date(business.viewedAt).toLocaleDateString(
              locale === 'he' ? 'he-IL' : 'ru-RU',
              {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }
            )

            return (
              <Link
                key={business.id}
                href={`/${locale}/business/${business.slug}`}
                className="relative flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {/* Test Badge - Top Left */}
                {business.is_test && (
                  <div className="absolute left-1 top-0 z-10">
                    <div className="flex items-center gap-0.5 rounded-br-lg bg-gradient-to-r from-orange-400 to-orange-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-md">
                      <span>🧪</span>
                      <span>{locale === 'he' ? 'בדיקה' : 'Тест'}</span>
                    </div>
                  </div>
                )}

                {/* Left accent bar */}
                <div className="w-1 flex-shrink-0 bg-gradient-to-b from-primary-500 to-primary-600" />

                {/* Card content */}
                <div className={`flex flex-1 flex-col p-3 ${business.is_test ? 'pt-6' : ''}`}>
                  {/* Business Name */}
                  <h3 className="mb-1.5 line-clamp-1 text-sm font-semibold text-gray-900">
                    {name}
                  </h3>

                  {/* Meta row */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex rounded bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                      {categoryName}
                    </span>
                    <span className="text-[10px] text-gray-500">•</span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="truncate">{neighborhoodName}</span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <time dateTime={business.viewedAt}>{formattedDate}</time>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Desktop: Horizontal Scroll */}
        <div className="relative hidden md:block">
          <div className="scrollbar-hide overflow-x-auto pb-4">
            <div className="flex gap-4">
              {recentlyViewed.map((business) => {
                const name =
                  locale === 'he'
                    ? business.name_he
                    : business.name_ru || business.name_he

                const categoryName =
                  locale === 'he'
                    ? business.category_name_he
                    : business.category_name_ru || business.category_name_he

                const neighborhoodName =
                  locale === 'he'
                    ? business.neighborhood_name_he
                    : business.neighborhood_name_ru || business.neighborhood_name_he

                const formattedDate = new Date(business.viewedAt).toLocaleDateString(
                  locale === 'he' ? 'he-IL' : 'ru-RU',
                  {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )

                return (
                  <Link
                    key={business.id}
                    href={`/${locale}/business/${business.slug}`}
                    className="group relative flex min-w-[280px] max-w-[280px] flex-shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    {/* Test Badge - Top Left */}
                    {business.is_test && (
                      <div className="absolute left-0 top-1 z-10">
                        <div className="flex items-center gap-1 rounded-br-lg bg-gradient-to-r from-orange-400 to-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
                          <span>🧪</span>
                          <span>{locale === 'he' ? 'בדיקה' : 'Тест'}</span>
                        </div>
                      </div>
                    )}

                    {/* Top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-primary-600" />

                    {/* Card content */}
                    <div className={`flex flex-1 flex-col p-4 ${business.is_test ? 'pt-6' : ''}`}>
                      {/* Business Name */}
                      <h3
                        className="mb-2 line-clamp-2 text-base font-semibold text-gray-900"
                        title={name}
                      >
                        {name}
                      </h3>

                      {/* Category Badge */}
                      <div className="mb-2.5">
                        <span className="inline-flex rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                          {categoryName}
                        </span>
                      </div>

                      {/* Neighborhood */}
                      <div className="mb-auto flex items-center gap-1.5 text-xs text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 flex-shrink-0 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="truncate">{neighborhoodName}</span>
                      </div>

                      {/* Timestamp */}
                      <div className="mt-2.5 flex items-center gap-1.5 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <time dateTime={business.viewedAt}>{formattedDate}</time>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={handleCancelClear}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            {/* Dialog Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3
                  id="dialog-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {t('clearHistoryConfirmTitle')}
                </h3>
              </div>
            </div>

            {/* Dialog Message */}
            <p className="mb-6 text-sm text-gray-600">
              {t('clearHistoryConfirmMessage')}
            </p>

            {/* Dialog Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelClear}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t('cancelClear')}
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {t('confirmClear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
