'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBusinessDetails } from '@/lib/actions/business-owner'

interface BusinessEditFormProps {
  locale: string
  business: {
    id: string
    name_he: string
    name_ru: string | null
    description_he: string | null
    description_ru: string | null
    phone: string | null
    whatsapp_number: string | null
    website_url: string | null
    email: string | null
    opening_hours_he: string | null
    opening_hours_ru: string | null
    address_he: string | null
    address_ru: string | null
    category: { name_he: string; name_ru: string | null } | null
    neighborhood: { name_he: string; name_ru: string }
  }
}

export default function BusinessEditForm({ locale, business }: BusinessEditFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    const data = {
      description_he: formData.get('description_he') as string,
      description_ru: formData.get('description_ru') as string,
      phone: formData.get('phone') as string,
      whatsapp_number: formData.get('whatsapp_number') as string,
      website_url: formData.get('website_url') as string,
      email: formData.get('email') as string,
      opening_hours_he: formData.get('opening_hours_he') as string,
      opening_hours_ru: formData.get('opening_hours_ru') as string,
      address_he: formData.get('address_he') as string,
      address_ru: formData.get('address_ru') as string,
    }

    try {
      const result = await updateBusinessDetails(business.id, data)

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/${locale}/business-portal`)
      }, 2000)
    } catch (err) {
      setError(locale === 'he' ? 'שגיאה בשמירת השינויים' : 'Ошибка сохранения изменений')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Read-only fields - Name & Category */}
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">
          {locale === 'he' ? 'שם העסק (לקריאה בלבד)' : 'Название (только для чтения)'}
        </p>
        <p className="text-lg font-bold text-gray-900">
          {locale === 'he' ? business.name_he : business.name_ru || business.name_he}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          {locale === 'he' ? business.category?.name_he : business.category?.name_ru || business.category?.name_he}
          {' • '}
          {locale === 'he' ? business.neighborhood.name_he : business.neighborhood.name_ru}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          {locale === 'he'
            ? '* לשינוי שם, קטגוריה או שכונה יש לפנות למנהל'
            : '* Для изменения названия, категории или района обратитесь к администратору'}
        </p>
      </div>

      {/* Description Hebrew */}
      <div>
        <label htmlFor="description_he" className="mb-2 block font-medium text-gray-700">
          {locale === 'he' ? 'תיאור (עברית)' : 'Описание (иврит)'}
        </label>
        <textarea
          id="description_he"
          name="description_he"
          rows={4}
          defaultValue={business.description_he || ''}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          dir="rtl"
        />
      </div>

      {/* Description Russian */}
      <div>
        <label htmlFor="description_ru" className="mb-2 block font-medium text-gray-700">
          {locale === 'he' ? 'תיאור (רוסית)' : 'Описание (русский)'}
        </label>
        <textarea
          id="description_ru"
          name="description_ru"
          rows={4}
          defaultValue={business.description_ru || ''}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          dir="ltr"
        />
      </div>

      {/* Contact Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-2 block font-medium text-gray-700">
            {locale === 'he' ? 'טלפון' : 'Телефон'}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={business.phone || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="ltr"
            placeholder="+972-50-123-4567"
          />
        </div>

        <div>
          <label htmlFor="whatsapp_number" className="mb-2 block font-medium text-gray-700">
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp_number"
            name="whatsapp_number"
            defaultValue={business.whatsapp_number || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="ltr"
            placeholder="+972-50-123-4567"
          />
        </div>
      </div>

      <p className="text-sm text-red-600">
        {locale === 'he'
          ? '* חובה למלא טלפון או WhatsApp (לפחות אחד)'
          : '* Необходимо заполнить телефон или WhatsApp (хотя бы один)'}
      </p>

      {/* Website & Email */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="website_url" className="mb-2 block font-medium text-gray-700">
            {locale === 'he' ? 'אתר אינטרנט' : 'Веб-сайт'}
          </label>
          <input
            type="url"
            id="website_url"
            name="website_url"
            defaultValue={business.website_url || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="ltr"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-medium text-gray-700">
            {locale === 'he' ? 'דוא״ל' : 'Email'}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={business.email || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="ltr"
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* Opening Hours */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="opening_hours_he" className="mb-2 block font-medium text-gray-700">
            {locale === 'he' ? 'שעות פתיחה (עברית)' : 'Часы работы (иврит)'}
          </label>
          <textarea
            id="opening_hours_he"
            name="opening_hours_he"
            rows={3}
            defaultValue={business.opening_hours_he || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="rtl"
            placeholder="א׳-ה׳: 08:00-17:00"
          />
        </div>

        <div>
          <label htmlFor="opening_hours_ru" className="mb-2 block font-medium text-gray-700">
            {locale === 'he' ? 'שעות פתיחה (רוסית)' : 'Часы работы (русский)'}
          </label>
          <textarea
            id="opening_hours_ru"
            name="opening_hours_ru"
            rows={3}
            defaultValue={business.opening_hours_ru || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="ltr"
            placeholder="Пн-Чт: 08:00-17:00"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="address_he" className="mb-2 block font-medium text-gray-700">
            {locale === 'he' ? 'כתובת (עברית)' : 'Адрес (иврит)'}
          </label>
          <input
            type="text"
            id="address_he"
            name="address_he"
            defaultValue={business.address_he || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="rtl"
            placeholder="רחוב הרצל 25, נתניה"
          />
        </div>

        <div>
          <label htmlFor="address_ru" className="mb-2 block font-medium text-gray-700">
            {locale === 'he' ? 'כתובת (רוסית)' : 'Адрес (русский)'}
          </label>
          <input
            type="text"
            id="address_ru"
            name="address_ru"
            defaultValue={business.address_ru || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="ltr"
            placeholder="ул. Герцль 25, Нетания"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800" role="alert">
          {locale === 'he' ? 'השינויים נשמרו בהצלחה!' : 'Изменения успешно сохранены!'}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? '...'
            : locale === 'he'
              ? 'שמור שינויים'
              : 'Сохранить изменения'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {locale === 'he' ? 'ביטול' : 'Отмена'}
        </button>
      </div>
    </form>
  )
}
