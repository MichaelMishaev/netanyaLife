'use client'

import { useState } from 'react'
import {
  toggleNeighborhoodActive,
  deleteNeighborhood,
} from '@/lib/actions/admin'
import NeighborhoodForm from './NeighborhoodForm'

interface NeighborhoodManagementCardProps {
  neighborhood: any
  locale: string
  cityId: string
}

export default function NeighborhoodManagementCard({
  neighborhood,
  locale,
  cityId,
}: NeighborhoodManagementCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const name = locale === 'he' ? neighborhood.name_he : neighborhood.name_ru

  const handleToggleActive = async () => {
    setIsUpdating(true)
    await toggleNeighborhoodActive(neighborhood.id, locale)
    setIsUpdating(false)
  }

  const handleDelete = async () => {
    const confirmMessage =
      locale === 'he'
        ? `האם אתה בטוח שברצונך למחוק את "${name}"?`
        : `Вы уверены, что хотите удалить "${name}"?`

    if (!confirm(confirmMessage)) {
      return
    }

    setIsUpdating(true)
    const result = await deleteNeighborhood(neighborhood.id, locale)
    if (!result.success) {
      alert(result.error)
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={`rounded-lg border bg-white p-6 shadow-sm ${
        !neighborhood.is_active ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            {!neighborhood.is_active && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                🚫 {locale === 'he' ? 'לא פעיל' : 'Неактивно'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>
              Slug: <code className="font-mono">{neighborhood.slug}</code>
            </span>
            <span>•</span>
            <span>
              {locale === 'he' ? 'סדר' : 'Порядок'}: {neighborhood.display_order}
            </span>
            <span>•</span>
            <span>
              {neighborhood._count.businesses}{' '}
              {locale === 'he' ? 'עסקים' : 'предприятий'}
            </span>
          </div>

          {neighborhood.description_he && locale === 'he' && (
            <p className="mt-2 text-sm text-gray-600">
              {neighborhood.description_he}
            </p>
          )}
          {neighborhood.description_ru && locale === 'ru' && (
            <p className="mt-2 text-sm text-gray-600">
              {neighborhood.description_ru}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleToggleActive}
            disabled={isUpdating}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              neighborhood.is_active
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
            title={
              neighborhood.is_active
                ? locale === 'he'
                  ? 'השבת'
                  : 'Деактивировать'
                : locale === 'he'
                  ? 'הפעל'
                  : 'Активировать'
            }
          >
            {neighborhood.is_active
              ? locale === 'he'
                ? 'השבת'
                : 'Деактивировать'
              : locale === 'he'
                ? 'הפעל'
                : 'Активировать'}
          </button>

          <NeighborhoodForm
            locale={locale}
            mode="edit"
            neighborhood={neighborhood}
            cityId={cityId}
            nextDisplayOrder={0}
          />

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
