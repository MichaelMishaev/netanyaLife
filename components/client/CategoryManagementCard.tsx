'use client'

import { useState } from 'react'
import {
  toggleCategoryActive,
  deleteCategory,
} from '@/lib/actions/admin'
import CategoryForm from './CategoryForm'

interface CategoryManagementCardProps {
  category: any
  locale: string
}

export default function CategoryManagementCard({
  category,
  locale,
}: CategoryManagementCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const name = locale === 'he' ? category.name_he : category.name_ru

  const handleToggleActive = async () => {
    setIsUpdating(true)
    await toggleCategoryActive(category.id, locale)
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
    const result = await deleteCategory(category.id, locale)
    if (!result.success) {
      alert(result.error)
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={`rounded-lg border bg-white p-6 shadow-sm ${
        !category.is_active ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">
              {category.icon_name && `${category.icon_name} `}
              {name}
            </h3>
            {category.is_popular && (
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                ⭐ {locale === 'he' ? 'פופולרי' : 'Популярное'}
              </span>
            )}
            {!category.is_active && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                🚫 {locale === 'he' ? 'לא פעיל' : 'Неактивно'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>
              Slug: <code className="font-mono">{category.slug}</code>
            </span>
            <span>•</span>
            <span>
              {locale === 'he' ? 'סדר' : 'Порядок'}: {category.display_order}
            </span>
            <span>•</span>
            <span>
              {category._count.businesses}{' '}
              {locale === 'he' ? 'עסקים' : 'предприятий'}
            </span>
          </div>

          {category.description_he && locale === 'he' && (
            <p className="mt-2 text-sm text-gray-600">
              {category.description_he}
            </p>
          )}
          {category.description_ru && locale === 'ru' && (
            <p className="mt-2 text-sm text-gray-600">
              {category.description_ru}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleToggleActive}
            disabled={isUpdating}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              category.is_active
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
            title={
              category.is_active
                ? locale === 'he'
                  ? 'השבת'
                  : 'Деактивировать'
                : locale === 'he'
                  ? 'הפעל'
                  : 'Активировать'
            }
          >
            {category.is_active
              ? locale === 'he'
                ? 'השבת'
                : 'Деактивировать'
              : locale === 'he'
                ? 'הפעל'
                : 'Активировать'}
          </button>

          <CategoryForm
            locale={locale}
            mode="edit"
            category={category}
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
