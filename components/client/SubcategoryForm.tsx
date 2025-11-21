'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  createSubcategory,
  updateSubcategory,
} from '@/lib/actions/admin'

interface SubcategoryFormProps {
  categoryId: string
  subcategory?: any
  locale: string
  mode: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  nextDisplayOrder: number
}

export default function SubcategoryForm({
  categoryId,
  subcategory,
  locale,
  mode,
  isOpen,
  onClose,
  nextDisplayOrder,
}: SubcategoryFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name_he: subcategory?.name_he || '',
    name_ru: subcategory?.name_ru || '',
    slug: subcategory?.slug || '',
    display_order: subcategory?.display_order || nextDisplayOrder,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugError, setSlugError] = useState<string>('')

  // Reset form when subcategory changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name_he: subcategory?.name_he || '',
        name_ru: subcategory?.name_ru || '',
        slug: subcategory?.slug || '',
        display_order: subcategory?.display_order || nextDisplayOrder,
      })
      setError(null)
      setSlugError('')
    }
  }, [isOpen, subcategory, nextDisplayOrder])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Real-time validation for slug
    if (name === 'slug') {
      const error = validateSlug(value)
      setSlugError(error)
    }

    // Auto-generate slug from Hebrew name
    if (name === 'name_he' && mode === 'create') {
      // Transliteration map for Hebrew to Latin characters
      const hebrewToLatin: { [key: string]: string } = {
        'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v',
        'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k',
        'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's',
        'ע': 'a', 'פ': 'p', 'ף': 'p', 'צ': 'ts', 'ץ': 'ts', 'ק': 'k',
        'ר': 'r', 'ש': 'sh', 'ת': 't'
      }

      const generatedSlug = value
        .trim()
        .split('')
        .map(char => hebrewToLatin[char] || char)
        .join('')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      // Validate the auto-generated slug
      const slugValidationError = validateSlug(generatedSlug)
      setSlugError(slugValidationError)

      setFormData((prev) => ({ ...prev, slug: generatedSlug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate slug before submitting
    const error = validateSlug(formData.slug)
    if (error) {
      setSlugError(error)
      return
    }

    setIsSubmitting(true)

    try {
      const result =
        mode === 'create'
          ? await createSubcategory({
              category_id: categoryId,
              ...formData,
              locale,
            })
          : await updateSubcategory(subcategory.id, {
              ...formData,
              locale,
            })

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error || 'Failed to save subcategory')
      }
    } catch (err) {
      console.error('Error saving subcategory:', err)
      setError('Failed to save subcategory')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:p-4">
      <div className="flex h-full w-full flex-col bg-white md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-lg md:shadow-xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 border-b bg-white px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 md:text-2xl">
              {mode === 'create'
                ? locale === 'he'
                  ? 'הוסף תת-קטגוריה'
                  : 'Добавить подкатегорию'
                : locale === 'he'
                  ? 'ערוך תת-קטגוריה'
                  : 'Редактировать подкатегорию'}
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              aria-label={locale === 'he' ? 'סגור' : 'Закрыть'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
          <div className="space-y-4">
            {/* Hebrew Name */}
            <div>
              <label htmlFor="name_he" className="mb-2 block text-sm font-medium text-gray-700">
                {locale === 'he' ? 'שם בעברית' : 'Название на иврите'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name_he"
                name="name_he"
                value={formData.name_he}
                onChange={handleChange}
                required
                dir="rtl"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={locale === 'he' ? 'לדוגמה: שירותי מזגנים' : 'Например: услуги кондиционеров'}
              />
            </div>

            {/* Russian Name */}
            <div>
              <label htmlFor="name_ru" className="mb-2 block text-sm font-medium text-gray-700">
                {locale === 'he' ? 'שם ברוסית' : 'Название на русском'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name_ru"
                name="name_ru"
                value={formData.name_ru}
                onChange={handleChange}
                required
                dir="ltr"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={locale === 'he' ? 'Например: услуги кондиционеров' : 'Например: услуги кондиционеров'}
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="mb-2 block text-sm font-medium text-gray-700">
                {locale === 'he' ? 'Slug (URL)' : 'Slug (URL)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                dir="ltr"
                className={`w-full rounded-lg border px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 md:text-base ${
                  slugError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
                placeholder="air-conditioning-services"
              />
              {slugError ? (
                <p className="mt-1 text-xs text-red-600 font-medium">{slugError}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'he'
                    ? 'רק אותיות אנגליות קטנות, מספרים ומקפים'
                    : 'Только строчные буквы, цифры и дефисы'}
                </p>
              )}
            </div>

          </div>
          </div>

          {/* Sticky Footer - Action Buttons */}
          <div className="sticky bottom-0 border-t bg-white px-4 py-3 md:px-6 md:py-4">
            {/* Error Message */}
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !!slugError}
                className="min-h-[44px] flex-1 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition hover:bg-primary-700 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? locale === 'he'
                    ? 'שומר...'
                    : 'Сохранение...'
                  : locale === 'he'
                    ? 'שמור'
                    : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-h-[44px] rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locale === 'he' ? 'ביטול' : 'Отмена'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
