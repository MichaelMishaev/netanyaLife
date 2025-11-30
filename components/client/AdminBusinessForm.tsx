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
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    address: '',
    openingHours: '',
    isVisible: true,
    isVerified: false,
    isPinned: false,
    isTest: true, // Default to true for new businesses in testing
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

      {/* Social Media Links */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <h3 className="mb-4 font-bold text-gray-900">
          {locale === 'he' ? 'רשתות חברתיות' : 'Социальные сети'}{' '}
          <span className="text-gray-500 text-sm font-normal">
            {locale === 'he' ? '(אופציונלי)' : '(необязательно)'}
          </span>
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Instagram */}
          <div>
            <label
              htmlFor="instagramUrl"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </div>
            </label>
            <input
              type="text"
              id="instagramUrl"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="instagram.com/username"
              dir="ltr"
            />
          </div>

          {/* Facebook */}
          <div>
            <label
              htmlFor="facebookUrl"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </div>
            </label>
            <input
              type="text"
              id="facebookUrl"
              name="facebookUrl"
              value={formData.facebookUrl}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="facebook.com/page"
              dir="ltr"
            />
          </div>

          {/* TikTok */}
          <div>
            <label
              htmlFor="tiktokUrl"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                </svg>
                TikTok
              </div>
            </label>
            <input
              type="text"
              id="tiktokUrl"
              name="tiktokUrl"
              value={formData.tiktokUrl}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="tiktok.com/@username"
              dir="ltr"
            />
          </div>
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

          {/* Is Test */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isTest"
              checked={formData.isTest}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-700">
              {locale === 'he' ? 'עסק בדיקה (לא יופיע ביצור)' : 'Тестовый бизнес (не будет показан на продакшене)'}
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
