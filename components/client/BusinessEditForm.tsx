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
