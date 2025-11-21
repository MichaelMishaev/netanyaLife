'use client'

import { useState } from 'react'
import { createCategory, updateCategory } from '@/lib/actions/admin'
import { useNotification } from '@/contexts/NotificationContext'

interface CategoryFormProps {
  locale: string
  mode: 'create' | 'edit'
  category?: any
  nextDisplayOrder: number
}

export default function CategoryForm({
  locale,
  mode,
  category,
  nextDisplayOrder,
}: CategoryFormProps) {
  const { showAlert } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slugError, setSlugError] = useState<string>('')

  const [formData, setFormData] = useState({
    name_he: category?.name_he || '',
    name_ru: category?.name_ru || '',
    slug: category?.slug || '',
    icon_name: category?.icon_name || '',
    description_he: category?.description_he || '',
    description_ru: category?.description_ru || '',
    is_popular: category?.is_popular || false,
    display_order: category?.display_order || nextDisplayOrder,
  })

  const validateSlug = (slug: string): string => {
    // Check for Hebrew characters (U+0590 to U+05FF)
    const hebrewPattern = /[\u0590-\u05FF]/
    // Check for Russian characters (U+0400 to U+04FF)
    const russianPattern = /[\u0400-\u04FF]/
    // Valid slug pattern: lowercase letters, numbers, hyphens
    const validSlugPattern = /^[a-z0-9-]+$/

    if (hebrewPattern.test(slug)) {
      return locale === 'he'
        ? '❌ Slug לא יכול להכיל תווים בעברית. השתמש באותיות לטיניות בלבד.'
        : '❌ Slug не может содержать ивритские символы. Используйте только латинские буквы.'
    }

    if (russianPattern.test(slug)) {
      return locale === 'he'
        ? '❌ Slug לא יכול להכיל תווים ברוסית. השתמש באותיות לטיניות בלבד.'
        : '❌ Slug не может содержать русские символы. Используйте только латинские буквы.'
    }

    if (slug && !validSlugPattern.test(slug)) {
      return locale === 'he'
        ? '❌ Slug יכול להכיל רק אותיות אנגליות קטנות, מספרים ומקפים.'
        : '❌ Slug может содержать только строчные латинские буквы, цифры и дефисы.'
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate slug before submitting
    const error = validateSlug(formData.slug)
    if (error) {
      setSlugError(error)
      return
    }

    setIsSubmitting(true)

    const data = {
      ...formData,
      locale,
    }

    const result =
      mode === 'create'
        ? await createCategory(data)
        : await updateCategory(category.id, data)

    if (result.success) {
      setIsOpen(false)
      setSlugError('')
      // Reset form if creating
      if (mode === 'create') {
        setFormData({
          name_he: '',
          name_ru: '',
          slug: '',
          icon_name: '',
          description_he: '',
          description_ru: '',
          is_popular: false,
          display_order: nextDisplayOrder,
        })
      }
    } else {
      showAlert(result.error || 'Error saving category', 'error')
    }

    setIsSubmitting(false)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    // Real-time validation for slug
    if (name === 'slug') {
      const error = validateSlug(value)
      setSlugError(error)
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={
          mode === 'create'
            ? 'min-h-[44px] rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 active:bg-blue-800'
            : 'min-h-[44px] rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:bg-gray-100'
        }
        aria-label={mode === 'create'
          ? (locale === 'he' ? 'הוסף קטגוריה' : 'Добавить категорию')
          : (locale === 'he' ? 'ערוך קטגוריה' : 'Редактировать категорию')
        }
      >
        {mode === 'create'
          ? locale === 'he'
            ? '+ הוסף קטגוריה'
            : '+ Добавить категорию'
          : '✏️'}
      </button>

      {/* Modal - Full Screen on Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:p-4">
          <div className="flex h-full w-full flex-col bg-white md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-lg md:shadow-xl">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 border-b bg-white px-4 py-4 md:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 md:text-2xl">
                  {mode === 'create'
                    ? locale === 'he'
                      ? 'הוסף קטגוריה חדשה'
                      : 'Добавить новую категорию'
                    : locale === 'he'
                      ? 'ערוך קטגוריה'
                      : 'Редактировать категорию'}
                </h2>
                {/* Close Button - Mobile */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 md:hidden"
                  aria-label={locale === 'he' ? 'סגור' : 'Закрыть'}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
                <div className="space-y-4">
              {/* Name Hebrew */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'שם בעברית' : 'Название на иврите'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_he"
                  value={formData.name_he}
                  onChange={handleChange}
                  required
                  dir="rtl"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="חשמלאים"
                />
              </div>

              {/* Name Russian */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'שם ברוסית' : 'Название на русском'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_ru"
                  value={formData.name_ru}
                  onChange={handleChange}
                  required
                  dir="ltr"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Электрики"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'Slug (URL)' : 'Slug (URL)'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  pattern="[a-z0-9-]+"
                  dir="ltr"
                  className={`w-full rounded-lg border px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 md:text-base ${
                    slugError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="hashmalim"
                />
                {slugError ? (
                  <p className="mt-1 text-xs text-red-600 font-medium">{slugError}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    {locale === 'he'
                      ? 'אותיות אנגליות קטנות, מספרים ומקפים בלבד'
                      : 'Только строчные латинские буквы, цифры и дефисы'}
                  </p>
                )}
              </div>

              {/* Icon Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'אייקון (אימוג\'י)' : 'Иконка (эмодзи)'}
                </label>
                <input
                  type="text"
                  name="icon_name"
                  value={formData.icon_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="⚡"
                  maxLength={2}
                />
              </div>

              {/* Description Hebrew */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'תיאור בעברית' : 'Описание на иврите'}
                </label>
                <textarea
                  name="description_he"
                  value={formData.description_he}
                  onChange={handleChange}
                  rows={3}
                  dir="rtl"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="תיאור אופציונלי לקטגוריה"
                />
              </div>

              {/* Description Russian */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'תיאור ברוסית' : 'Описание на русском'}
                </label>
                <textarea
                  name="description_ru"
                  value={formData.description_ru}
                  onChange={handleChange}
                  rows={3}
                  dir="ltr"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Необязательное описание категории"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'סדר תצוגה' : 'Порядок отображения'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  required
                  min={1}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'he'
                    ? 'מספר נמוך יופיע ראשון'
                    : 'Меньшее число отображается первым'}
                </p>
              </div>

              {/* Is Popular */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_popular"
                  id="is_popular"
                  checked={formData.is_popular}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="is_popular"
                  className="text-sm font-medium text-gray-700 md:text-base"
                >
                  ⭐ {locale === 'he' ? 'סמן כפופולרי' : 'Отметить как популярное'}
                </label>
              </div>

                </div>
              </div>

              {/* Sticky Footer - Action Buttons */}
              <div className="sticky bottom-0 border-t bg-white px-4 py-3 md:px-6 md:py-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {locale === 'he' ? 'ביטול' : 'Отмена'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !!slugError}
                    className="min-h-[44px] flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? locale === 'he'
                        ? 'שומר...'
                        : 'Сохранение...'
                      : locale === 'he'
                        ? 'שמור'
                        : 'Сохранить'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
