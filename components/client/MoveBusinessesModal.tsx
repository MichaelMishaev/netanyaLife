'use client'

import { useState } from 'react'
import { moveBusinessesToCategory } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'

interface MoveBusinessesModalProps {
  isOpen: boolean
  onClose: () => void
  businesses: Array<{
    id: string
    name_he: string
    name_ru: string | null
  }>
  currentCategoryId: string
  allCategories: Array<{
    id: string
    name_he: string
    name_ru: string | null
    subcategories: Array<{
      id: string
      name_he: string
      name_ru: string | null
    }>
  }>
  locale: string
}

export default function MoveBusinessesModal({
  isOpen,
  onClose,
  businesses,
  currentCategoryId,
  allCategories,
  locale,
}: MoveBusinessesModalProps) {
  const router = useRouter()
  const { showAlert } = useNotification()
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get subcategories for selected category
  const selectedCategory = allCategories.find((c) => c.id === selectedCategoryId)
  const subcategories = selectedCategory?.subcategories || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategoryId) {
      showAlert(locale === 'he' ? 'יש לבחור קטגוריה' : 'Выберите категорию', 'warning')
      return
    }

    if (selectedCategoryId === currentCategoryId) {
      showAlert(
        locale === 'he'
          ? 'אי אפשר להעביר לאותה קטגוריה'
          : 'Нельзя переместить в ту же категорию',
        'warning'
      )
      return
    }

    setIsSubmitting(true)

    const result = await moveBusinessesToCategory(
      businesses.map((b) => b.id),
      selectedCategoryId,
      selectedSubcategoryId,
      locale
    )

    setIsSubmitting(false)

    if (result.success) {
      showAlert(result.message || 'Businesses moved successfully', 'success')
      router.refresh()
      onClose()
    } else {
      showAlert(result.error || 'Error moving businesses', 'error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        dir={locale === 'he' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'he' ? 'העברת עסקים לקטגוריה אחרת' : 'Перемещение бизнесов в другую категорию'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label={locale === 'he' ? 'סגור' : 'Закрыть'}
          >
            ✕
          </button>
        </div>

        {/* Businesses being moved */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-700">
            {locale === 'he'
              ? `${businesses.length} עסקים שיועברו:`
              : `${businesses.length} бизнесов для перемещения:`}
          </p>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
            <ul className="space-y-1 text-sm text-gray-600">
              {businesses.map((business) => (
                <li key={business.id}>
                  • {locale === 'he' ? business.name_he : business.name_ru || business.name_he}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Category Select */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {locale === 'he' ? 'העבר לקטגוריה:' : 'Переместить в категорию:'}
              <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value)
                setSelectedSubcategoryId(null) // Reset subcategory when category changes
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">
                {locale === 'he' ? 'בחר קטגוריה...' : 'Выберите категорию...'}
              </option>
              {allCategories
                .filter((cat) => cat.id !== currentCategoryId)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {locale === 'he' ? category.name_he : category.name_ru || category.name_he}
                  </option>
                ))}
            </select>
          </div>

          {/* Subcategory Select (optional) */}
          {subcategories.length > 0 && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {locale === 'he' ? 'תת-קטגוריה (אופציונלי):' : 'Подкатегория (необязательно):'}
              </label>
              <select
                value={selectedSubcategoryId || ''}
                onChange={(e) => setSelectedSubcategoryId(e.target.value || null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">
                  {locale === 'he' ? 'ללא תת-קטגוריה' : 'Без подкатегории'}
                </option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {locale === 'he' ? sub.name_he : sub.name_ru || sub.name_he}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              disabled={isSubmitting}
            >
              {locale === 'he' ? 'ביטול' : 'Отмена'}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? locale === 'he'
                  ? 'מעביר...'
                  : 'Перемещение...'
                : locale === 'he'
                  ? 'העבר עסקים'
                  : 'Переместить бизнесы'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
