'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBusiness } from '@/lib/actions/admin'

interface AdminBusinessFormProps {
  categories: Array<{
    id: string
    name_he: string
    name_ru: string
    subcategories: Array<{
      id: string
      name_he: string
      name_ru: string
      slug: string
    }>
  }>
  neighborhoods: Array<{
    id: string
    name_he: string
    name_ru: string
  }>
  locale: string
}

export default function AdminBusinessForm({
  categories,
  neighborhoods,
  locale,
}: AdminBusinessFormProps) {
  const router = useRouter()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    neighborhoodId: '',
    description: '',
    phone: '',
    whatsappNumber: '',
    websiteUrl: '',
    email: '',
    address: '',
    openingHours: '',
    isVisible: true,
    isVerified: false,
    isPinned: false,
  })

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.id === formData.categoryId)
  const availableSubcategories = selectedCategory?.subcategories || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    categoryId?: string
    neighborhoodId?: string
    contact?: string
  }>({})

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      // If category changes, reset subcategory
      if (name === 'categoryId') {
        setFormData((prev) => ({
          ...prev,
          categoryId: value,
          subcategoryId: '',
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Client-side validation
    const errors: typeof fieldErrors = {}

    if (!formData.name.trim()) {
      errors.name = locale === 'he' ? 'שדה חובה' : 'Обязательное поле'
    }

    if (!formData.categoryId) {
      errors.categoryId = locale === 'he' ? 'שדה חובה' : 'Обязательное поле'
    }

    if (!formData.neighborhoodId) {
      errors.neighborhoodId = locale === 'he' ? 'שדה חובה' : 'Обязательное поле'
    }

    // At least phone or whatsapp required
    if (!formData.phone && !formData.whatsappNumber) {
      errors.contact =
        locale === 'he'
          ? 'חובה למלא טלפון או מספר ווטסאפ אחד לפחות'
          : 'Требуется телефон или WhatsApp'
    }

    // If there are errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError(
        locale === 'he' ? 'יש לתקן את השגיאות' : 'Пожалуйста, исправьте ошибки'
      )
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createBusiness(locale, formData)

      if (result.success) {
        setSuccess(true)
        // Redirect to businesses list after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/admin/businesses`)
        }, 2000)
      } else {
        setError(
          result.error ||
            (locale === 'he'
              ? 'שגיאה ביצירת העסק'
              : 'Ошибка создания бизнеса')
        )
      }
    } catch (err) {
      setError(
        locale === 'he' ? 'שגיאה ביצירת העסק' : 'Ошибка создания бизнеса'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success message
  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <div className="mb-4 text-6xl">✓</div>
        <h2 className="mb-2 text-2xl font-bold text-green-800">
          {locale === 'he' ? 'העסק נוצר בהצלחה!' : 'Бизнес успешно создан!'}
        </h2>
        <p className="text-green-700">
          {locale === 'he'
            ? 'מעביר לרשימת העסקים...'
            : 'Перенаправление в список...'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Name */}
      <div>
        <label htmlFor="name" className="mb-2 block font-medium text-gray-700">
          {locale === 'he' ? 'שם העסק' : 'Название бизнеса'}{' '}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
            fieldErrors.name
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          placeholder={
            locale === 'he' ? 'לדוגמה: חשמלאי יוסי' : 'Например: Электрик Иосиф'
          }
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
        )}
      </div>

      {/* Category and Neighborhood - Side by Side on Desktop */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Category */}
        <div>
          <label
            htmlFor="categoryId"
            className="mb-2 block font-medium text-gray-700"
          >
            {locale === 'he' ? 'קטגוריה' : 'Категория'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
              fieldErrors.categoryId
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
          >
            <option value="">
              {locale === 'he' ? 'בחר קטגוריה' : 'Выберите категорию'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {locale === 'he' ? category.name_he : category.name_ru}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.categoryId}</p>
          )}
        </div>

        {/* Neighborhood */}
        <div>
          <label
            htmlFor="neighborhoodId"
            className="mb-2 block font-medium text-gray-700"
          >
            {locale === 'he' ? 'שכונה' : 'Район'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <select
            id="neighborhoodId"
            name="neighborhoodId"
            value={formData.neighborhoodId}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
              fieldErrors.neighborhoodId
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
          >
            <option value="">
              {locale === 'he' ? 'בחר שכונה' : 'Выберите район'}
            </option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.id}>
                {locale === 'he' ? neighborhood.name_he : neighborhood.name_ru}
              </option>
            ))}
          </select>
          {fieldErrors.neighborhoodId && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.neighborhoodId}
            </p>
          )}
        </div>
      </div>

      {/* Subcategory - Only shown if category has subcategories */}
      {availableSubcategories.length > 0 && (
        <div>
          <label
            htmlFor="subcategoryId"
            className="mb-2 block font-medium text-gray-700"
          >
            {locale === 'he' ? 'תת-קטגוריה' : 'Подкатегория'}{' '}
            <span className="text-gray-400">
              {locale === 'he' ? '(אופציונלי)' : '(необязательно)'}
            </span>
          </label>
          <select
            id="subcategoryId"
            name="subcategoryId"
            value={formData.subcategoryId}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">
              {locale === 'he' ? 'בחר תת-קטגוריה (אופציונלי)' : 'Выберите подкатегорию (необязательно)'}
            </option>
            {availableSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {locale === 'he' ? subcategory.name_he : subcategory.name_ru}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block font-medium text-gray-700"
        >
          {locale === 'he' ? 'תיאור' : 'Описание'}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={
            locale === 'he'
              ? 'תאר את השירותים שהעסק מציע...'
              : 'Опишите услуги бизнеса...'
          }
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Contact Info Section */}
      <div
        className={`rounded-lg border p-4 ${
          fieldErrors.contact
            ? 'border-red-500 bg-red-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <h3 className="mb-4 font-bold text-gray-900">
          {locale === 'he' ? 'פרטי התקשרות' : 'Контактная информация'}{' '}
          <span className="text-red-500">*</span>
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block font-medium text-gray-700"
            >
              {locale === 'he' ? 'טלפון' : 'Телефон'}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="050-1234567"
              dir="ltr"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label
              htmlFor="whatsappNumber"
              className="mb-2 block font-medium text-gray-700"
            >
              {locale === 'he' ? 'וואטסאפ' : 'WhatsApp'}
            </label>
            <input
              type="tel"
              id="whatsappNumber"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="050-1234567"
              dir="ltr"
            />
          </div>
        </div>
        {fieldErrors.contact && (
          <p className="mt-4 font-medium text-sm text-red-600">
            {fieldErrors.contact}
          </p>
        )}
      </div>

      {/* Website and Email - Side by Side on Desktop */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Website */}
        <div>
          <label
            htmlFor="websiteUrl"
            className="mb-2 block font-medium text-gray-700"
          >
            {locale === 'he' ? 'אתר אינטרנט' : 'Веб-сайт'}
          </label>
          <input
            type="text"
            id="websiteUrl"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="example.com"
            dir="ltr"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-medium text-gray-700"
          >
            {locale === 'he' ? 'אימייל' : 'Email'}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="email@example.com"
            dir="ltr"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="address"
          className="mb-2 block font-medium text-gray-700"
        >
          {locale === 'he' ? 'כתובת' : 'Адрес'}
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={
            locale === 'he' ? 'רחוב הרצל 1, נתניה' : 'ул. Герцль 1, Нетания'
          }
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Opening Hours */}
      <div>
        <label
          htmlFor="openingHours"
          className="mb-2 block font-medium text-gray-700"
        >
          {locale === 'he' ? 'שעות פתיחה' : 'Часы работы'}
        </label>
        <input
          type="text"
          id="openingHours"
          name="openingHours"
          value={formData.openingHours}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={
            locale === 'he'
              ? "א'-ו' 9:00-18:00"
              : 'Вс-Чт 9:00-18:00'
          }
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Admin-only Settings */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-4 font-bold text-gray-900">
          {locale === 'he' ? 'הגדרות מנהל' : 'Настройки администратора'}
        </h3>

        <div className="space-y-3">
          {/* Is Visible */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isVisible"
              checked={formData.isVisible}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">
              {locale === 'he' ? 'גלוי באתר' : 'Видимый на сайте'}
            </span>
          </label>

          {/* Is Verified */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">
              {locale === 'he' ? 'מאומת' : 'Проверено'}
            </span>
          </label>

          {/* Is Pinned */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-gray-700">
              {locale === 'he' ? 'מוצמד (יופיע ראשון)' : 'Закреплено (появится первым)'}
            </span>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
          {error}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? locale === 'he'
              ? 'שומר...'
              : 'Сохранение...'
            : locale === 'he'
              ? 'צור עסק'
              : 'Создать бизнес'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {locale === 'he' ? 'ביטול' : 'Отмена'}
        </button>
      </div>
    </form>
  )
}
