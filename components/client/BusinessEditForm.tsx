'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBusinessDetails } from '@/lib/actions/business-owner'
import OpeningHoursInput from './OpeningHoursInput'

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
    instagram_url: string | null
    facebook_url: string | null
    tiktok_url: string | null
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
  const [isPending, setIsPending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // State for opening hours
  const [openingHoursHe, setOpeningHoursHe] = useState(business.opening_hours_he || '')
  const [openingHoursRu, setOpeningHoursRu] = useState(business.opening_hours_ru || '')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsPending(false)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    const data = {
      description_he: formData.get('description_he') as string,
      description_ru: formData.get('description_ru') as string,
      phone: formData.get('phone') as string,
      whatsapp_number: formData.get('whatsapp_number') as string,
      website_url: formData.get('website_url') as string,
      email: formData.get('email') as string,
      instagram_url: formData.get('instagram_url') as string,
      facebook_url: formData.get('facebook_url') as string,
      tiktok_url: formData.get('tiktok_url') as string,
      opening_hours_he: openingHoursHe,
      opening_hours_ru: openingHoursRu,
      address_he: formData.get('address_he') as string,
      address_ru: formData.get('address_ru') as string,
    }

    try {
      const result = await updateBusinessDetails(business.id, data)

      if (result.error) {
        setError(result.error)
        return
      }

      // Check if changes are pending approval
      if (result.isPending) {
        setIsPending(true)
      } else {
        setSuccess(true)
      }

      // Navigate quickly with visual feedback
      setTimeout(() => {
        router.push(`/${locale}/business-portal`)
        setIsLoading(false)
      }, 1200)
    } catch (err) {
      setError(locale === 'he' ? 'שגיאה בשמירת השינויים' : 'Ошибка сохранения изменений')
      setIsLoading(false) // Only re-enable on error
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
            type="text"
            id="website_url"
            name="website_url"
            defaultValue={business.website_url || ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            dir="ltr"
            placeholder="example.com or https://example.com"
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

      {/* Social Media Links */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">
          {locale === 'he' ? 'רשתות חברתיות' : 'Социальные сети'}{' '}
          <span className="text-gray-500 text-sm font-normal">
            {locale === 'he' ? '(אופציונלי)' : '(необязательно)'}
          </span>
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Instagram */}
          <div>
            <label htmlFor="instagram_url" className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </div>
            </label>
            <input
              type="text"
              id="instagram_url"
              name="instagram_url"
              defaultValue={business.instagram_url || ''}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="instagram.com/username"
              dir="ltr"
            />
          </div>

          {/* Facebook */}
          <div>
            <label htmlFor="facebook_url" className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </div>
            </label>
            <input
              type="text"
              id="facebook_url"
              name="facebook_url"
              defaultValue={business.facebook_url || ''}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="facebook.com/page"
              dir="ltr"
            />
          </div>

          {/* TikTok */}
          <div>
            <label htmlFor="tiktok_url" className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                </svg>
                TikTok
              </div>
            </label>
            <input
              type="text"
              id="tiktok_url"
              name="tiktok_url"
              defaultValue={business.tiktok_url || ''}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="tiktok.com/@username"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div>
        <label className="mb-3 block text-base font-semibold text-gray-900">
          {locale === 'he' ? 'שעות פתיחה' : 'Часы работы'}
        </label>
        <OpeningHoursInput
          value={openingHoursHe}
          onChange={(value) => setOpeningHoursHe(value)}
          locale={locale}
        />
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

      {/* Pending Approval Message */}
      {isPending && (
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4" role="alert">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⏳</div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900">
                {locale === 'he' ? 'השינויים נשלחו לאישור מנהל' : 'Изменения отправлены на одобрение администратора'}
              </h4>
              <p className="mt-1 text-sm text-blue-800">
                {locale === 'he'
                  ? 'השינויים שלך נשמרו וממתינים לאישור. תראה את העדכונים באתר לאחר שהמנהל יאשר אותם.'
                  : 'Ваши изменения сохранены и ожидают одобрения. Вы увидите обновления на сайте после одобрения администратором.'}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{locale === 'he' ? 'מעביר לדשבורד...' : 'Переход на дашборд...'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message (for direct saves - if any) */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4" role="alert">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-medium">
              {locale === 'he' ? 'השינויים נשמרו בהצלחה!' : 'Изменения успешно сохранены!'}
            </span>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{locale === 'he' ? 'מעביר...' : 'Переход...'}</span>
            </div>
          </div>
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
          onClick={() => setShowCancelConfirm(true)}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {locale === 'he' ? 'ביטול' : 'Отмена'}
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" dir={locale === 'he' ? 'rtl' : 'ltr'}>
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
              {locale === 'he' ? 'ביטול שינויים' : 'Отменить изменения'}
            </h3>

            {/* Message */}
            <p className="mb-6 text-center text-sm text-gray-600">
              {locale === 'he'
                ? 'כל השינויים שביצעת יאבדו. האם אתה בטוח שברצונך לבטל?'
                : 'Все внесенные изменения будут потеряны. Вы уверены, что хотите отменить?'}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {locale === 'he' ? 'המשך עריכה' : 'Продолжить редактирование'}
              </button>
              <button
                onClick={() => router.back()}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
              >
                {locale === 'he' ? 'כן, בטל שינויים' : 'Да, отменить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
