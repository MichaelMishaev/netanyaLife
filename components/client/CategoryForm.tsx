'use client'

import { useState } from 'react'
import { createCategory, updateCategory } from '@/lib/actions/admin'

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
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      alert(result.error)
    }

    setIsSubmitting(false)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
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
            ? 'rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700'
            : 'rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50'
        }
      >
        {mode === 'create'
          ? locale === 'he'
            ? '+ הוסף קטגוריה'
            : '+ Добавить категорию'
          : '✏️'}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              {mode === 'create'
                ? locale === 'he'
                  ? 'הוסף קטגוריה חדשה'
                  : 'Добавить новую категорию'
                : locale === 'he'
                  ? 'ערוך קטגוריה'
                  : 'Редактировать категорию'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Hebrew */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'שם בעברית' : 'Название на иврите'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_he"
                  value={formData.name_he}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="חשמלאים"
                />
              </div>

              {/* Name Russian */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'שם ברוסית' : 'Название на русском'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_ru"
                  value={formData.name_ru}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Электрики"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="hashmalim"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'he'
                    ? 'אותיות אנגליות קטנות, מספרים ומקפים בלבד'
                    : 'Только строчные латинские буквы, цифры и дефисы'}
                </p>
              </div>

              {/* Icon Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'אייקון (אימוג\'י)' : 'Иконка (эмодзи)'}
                </label>
                <input
                  type="text"
                  name="icon_name"
                  value={formData.icon_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="⚡"
                  maxLength={2}
                />
              </div>

              {/* Description Hebrew */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'תיאור בעברית' : 'Описание на иврите'}
                </label>
                <textarea
                  name="description_he"
                  value={formData.description_he}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="תיאור אופציונלי לקטגוריה"
                />
              </div>

              {/* Description Russian */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {locale === 'he' ? 'תיאור ברוסית' : 'Описание на русском'}
                </label>
                <textarea
                  name="description_ru"
                  value={formData.description_ru}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Необязательное описание категории"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'he'
                    ? 'מספר נמוך יופיע ראשון'
                    : 'Меньшее число отображается первым'}
                </p>
              </div>

              {/* Is Popular */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_popular"
                  id="is_popular"
                  checked={formData.is_popular}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="is_popular"
                  className="text-sm font-medium text-gray-700"
                >
                  ⭐ {locale === 'he' ? 'סמן כפופולרי' : 'Отметить как популярное'}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {locale === 'he' ? 'ביטול' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            </form>
          </div>
        </div>
      )}
    </>
  )
}
