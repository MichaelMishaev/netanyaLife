'use client'

import { useState, useEffect } from 'react'
import { submitCategoryRequest } from '@/lib/actions/categories'

interface InitialData {
  categoryNameHe?: string
  categoryNameRu?: string
  description?: string
  businessName?: string
  requesterName?: string
  requesterEmail?: string
  requesterPhone?: string
}

interface CategoryRequestModalProps {
  isOpen: boolean
  onClose: () => void
  locale: string
  businessName?: string
  initialData?: InitialData
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string | undefined): string {
  if (!input) return ''
  // Remove HTML tags and trim
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500) // Max 500 chars
}

export default function CategoryRequestModal({
  isOpen,
  onClose,
  locale,
  businessName,
  initialData,
}: CategoryRequestModalProps) {
  const [formData, setFormData] = useState({
    categoryNameHe: sanitizeInput(initialData?.categoryNameHe) || '',
    categoryNameRu: sanitizeInput(initialData?.categoryNameRu) || '',
    description: sanitizeInput(initialData?.description) || '',
    requesterName: sanitizeInput(initialData?.requesterName) || '',
    requesterEmail: sanitizeInput(initialData?.requesterEmail) || '',
    requesterPhone: sanitizeInput(initialData?.requesterPhone) || '',
    businessName: sanitizeInput(initialData?.businessName || businessName) || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Log when form is pre-filled from URL params
  useEffect(() => {
    if (initialData) {
      console.log('✅ Category request form pre-filled with URL params:', {
        categoryNameHe: formData.categoryNameHe,
        categoryNameRu: formData.categoryNameRu,
        description: formData.description,
        businessName: formData.businessName,
      })
    }
  }, [initialData, formData.categoryNameHe, formData.categoryNameRu, formData.description, formData.businessName])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    console.log('📝 Submitting category request:', formData)

    try {
      const result = await submitCategoryRequest(formData)

      console.log('✅ Category request result:', result)

      if (result.success) {
        setSuccess(true)
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
          // Reset form
          setFormData({
            categoryNameHe: '',
            categoryNameRu: '',
            description: '',
            requesterName: '',
            requesterEmail: '',
            requesterPhone: '',
            businessName: businessName || '',
          })
          setSuccess(false)
        }, 2000)
      } else {
        setError(result.error || (locale === 'he' ? 'שגיאה בשליחת הבקשה' : 'Ошибка отправки запроса'))
      }
    } catch (err) {
      console.error('Category request error:', err)
      setError(locale === 'he' ? 'שגיאה בשליחת הבקשה' : 'Ошибка отправки запроса')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'he' ? 'בקשת קטגוריה חדשה' : 'Запрос новой категории'}
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label={locale === 'he' ? 'סגור' : 'Закрыть'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
              <div className="mb-4 text-6xl">✓</div>
              <h3 className="mb-2 text-xl font-bold text-green-800">
                {locale === 'he' ? 'הבקשה נשלחה בהצלחה!' : 'Запрос успешно отправлен!'}
              </h3>
              <p className="text-green-700">
                {locale === 'he'
                  ? 'נבדוק את הבקשה ונעדכן אותך בהקדם'
                  : 'Мы рассмотрим ваш запрос и свяжемся с вами в ближайшее время'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info Box */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  {locale === 'he'
                    ? 'לא מצאת את הקטגוריה המתאימה? מלא את הטופס למטה ונוסיף אותה במהירות האפשרית.'
                    : 'Не нашли подходящую категорию? Заполните форму ниже, и мы добавим её как можно скорее.'}
                </p>
              </div>

              {/* Category Name Hebrew (Required) */}
              <div>
                <label htmlFor="categoryNameHe" className="mb-2 block font-medium text-gray-700">
                  {locale === 'he' ? 'שם הקטגוריה בעברית' : 'Название категории на иврите'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="categoryNameHe"
                  name="categoryNameHe"
                  value={formData.categoryNameHe}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'he' ? 'לדוגמה: מתקין מזגנים' : 'Например: установщики кондиционеров'}
                  dir="rtl"
                />
              </div>

              {/* Category Name Russian (Optional) */}
              <div>
                <label htmlFor="categoryNameRu" className="mb-2 block font-medium text-gray-700">
                  {locale === 'he' ? 'שם הקטגוריה ברוסית' : 'Название категории на русском'}{' '}
                  <span className="text-gray-400 text-sm">
                    ({locale === 'he' ? 'אופציונלי' : 'необязательно'})
                  </span>
                </label>
                <input
                  type="text"
                  id="categoryNameRu"
                  name="categoryNameRu"
                  value={formData.categoryNameRu}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'he' ? 'לדוגמה: Установщики кондиционеров' : 'Например: Установщики кондиционеров'}
                  dir="ltr"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-2 block font-medium text-gray-700">
                  {locale === 'he' ? 'למה קטגוריה זו חשובה?' : 'Почему эта категория важна?'}{' '}
                  <span className="text-gray-400 text-sm">
                    ({locale === 'he' ? 'אופציונלי' : 'необязательно'})
                  </span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'he' ? 'תאר בקצרה למה הקטגוריה הזו חסרה...' : 'Кратко опишите, почему эта категория необходима...'}
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="mb-2 block font-medium text-gray-700">
                  {locale === 'he' ? 'שם העסק (אם רלוונטי)' : 'Название бизнеса (если применимо)'}{' '}
                  <span className="text-gray-400 text-sm">
                    ({locale === 'he' ? 'אופציונלי' : 'необязательно'})
                  </span>
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'he' ? 'שם העסק שלך' : 'Название вашего бизнеса'}
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Contact Info Section */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-4 font-bold text-gray-900">
                  {locale === 'he' ? 'פרטי יצירת קשר (למעקב)' : 'Контактная информация (для связи)'}
                </h3>

                <div className="space-y-4">
                  {/* Requester Name */}
                  <div>
                    <label htmlFor="requesterName" className="mb-2 block font-medium text-gray-700">
                      {locale === 'he' ? 'שם מלא' : 'Полное имя'}
                    </label>
                    <input
                      type="text"
                      id="requesterName"
                      name="requesterName"
                      value={formData.requesterName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={locale === 'he' ? 'שם ושם משפחה' : 'Имя и фамилия'}
                      dir={locale === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>

                  {/* Requester Email */}
                  <div>
                    <label htmlFor="requesterEmail" className="mb-2 block font-medium text-gray-700">
                      {locale === 'he' ? 'אימייל' : 'Email'}
                    </label>
                    <input
                      type="email"
                      id="requesterEmail"
                      name="requesterEmail"
                      value={formData.requesterEmail}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={locale === 'he' ? 'example@email.com' : 'example@email.com'}
                      dir="ltr"
                    />
                  </div>

                  {/* Requester Phone */}
                  <div>
                    <label htmlFor="requesterPhone" className="mb-2 block font-medium text-gray-700">
                      {locale === 'he' ? 'טלפון' : 'Телефон'}
                    </label>
                    <input
                      type="tel"
                      id="requesterPhone"
                      name="requesterPhone"
                      value={formData.requesterPhone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={locale === 'he' ? '050-1234567' : '050-1234567'}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? (locale === 'he' ? 'שולח...' : 'Отправка...')
                    : (locale === 'he' ? 'שלח בקשה' : 'Отправить запрос')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {locale === 'he' ? 'ביטול' : 'Отмена'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
