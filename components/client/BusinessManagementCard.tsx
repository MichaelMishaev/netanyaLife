'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  toggleBusinessVisibility,
  toggleBusinessVerification,
  deleteBusiness,
} from '@/lib/actions/admin'

interface BusinessManagementCardProps {
  business: any
  locale: string
}

export default function BusinessManagementCard({
  business,
  locale,
}: BusinessManagementCardProps) {
  const t = useTranslations('admin.businesses')
  const [isUpdating, setIsUpdating] = useState(false)

  const name =
    locale === 'he'
      ? business.name_he || business.name_ru
      : business.name_ru || business.name_he
  const categoryName =
    locale === 'he' ? business.category.name_he : business.category.name_ru
  const neighborhoodName =
    locale === 'he'
      ? business.neighborhood.name_he
      : business.neighborhood.name_ru

  const handleToggleVisibility = async () => {
    setIsUpdating(true)
    await toggleBusinessVisibility(business.id, locale)
    setIsUpdating(false)
  }

  const handleToggleVerification = async () => {
    setIsUpdating(true)
    await toggleBusinessVerification(business.id, locale)
    setIsUpdating(false)
  }

  const handleDelete = async () => {
    if (
      !confirm(
        locale === 'he'
          ? 'האם אתה בטוח שברצונך למחוק עסק זה?'
          : 'Вы уверены, что хотите удалить это предприятие?'
      )
    ) {
      return
    }

    setIsUpdating(true)
    await deleteBusiness(business.id, locale)
    // Page will revalidate automatically
  }

  return (
    <div
      className={`rounded-lg border bg-white p-6 shadow-sm ${
        !business.is_visible ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            {business.is_verified && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                ✓ {locale === 'he' ? 'מאומת' : 'Проверено'}
              </span>
            )}
            {business.is_pinned && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                📌 {locale === 'he' ? 'מוצמד' : 'Закреплено'}
              </span>
            )}
            {!business.is_visible && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                🚫 {locale === 'he' ? 'מוסתר' : 'Скрыто'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>{categoryName}</span>
            <span>•</span>
            <span>{neighborhoodName}</span>
            <span>•</span>
            <span>
              {business._count.reviews}{' '}
              {locale === 'he' ? 'ביקורות' : 'отзывов'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleToggleVisibility}
            disabled={isUpdating}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_visible
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
            title={
              business.is_visible
                ? locale === 'he'
                  ? 'הסתר'
                  : 'Скрыть'
                : locale === 'he'
                  ? 'הצג'
                  : 'Показать'
            }
          >
            {business.is_visible
              ? locale === 'he'
                ? 'הסתר'
                : 'Скрыть'
              : locale === 'he'
                ? 'הצג'
                : 'Показать'}
          </button>

          <button
            onClick={handleToggleVerification}
            disabled={isUpdating}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_verified
                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title={
              business.is_verified
                ? locale === 'he'
                  ? 'בטל אימות'
                  : 'Снять проверку'
                : locale === 'he'
                  ? 'אמת'
                  : 'Проверить'
            }
          >
            ✓
          </button>

          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            title={locale === 'he' ? 'מחק' : 'Удалить'}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
