'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createOwnerBusiness } from '@/lib/actions/business-owner'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import SearchableSelect from './SearchableSelect'
import SimpleSelect from './SimpleSelect'
import OpeningHoursInput from './OpeningHoursInput'

interface OwnerAddBusinessFormProps {
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
  cityId: string
  locale: string
}

export default function OwnerAddBusinessForm({
  categories,
  neighborhoods,
  cityId,
  locale,
}: OwnerAddBusinessFormProps) {
  const t = useTranslations('addBusiness')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { trackEvent } = useAnalytics()

  // Form State
  const [formData, setFormData] = useState({
    name_he: '',
    name_ru: '',
    categoryId: '',
    subcategoryId: '',
    neighborhoodId: '',
    servesAllCity: false,
    description_he: '',
    description_ru: '',
    phone: '',
    whatsappNumber: '',
    websiteUrl: '',
    email: '',
    address_he: '',
    address_ru: '',
    openingHours_he: '',
    openingHours_ru: '',
  })

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.id === formData.categoryId)
  const availableSubcategories = selectedCategory?.subcategories || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name_he?: string
    categoryId?: string
    neighborhoodId?: string
    contact?: string
    websiteUrl?: string
    email?: string
  }>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const fieldName = e.target.name
    const value = e.target.value

    // If category changes, reset subcategory
    if (fieldName === 'categoryId') {
      setFormData((prev) => ({
        ...prev,
        categoryId: value,
        subcategoryId: '',
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }))
    }

    // Clear field error when user starts typing
    if (fieldErrors[fieldName as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName as keyof typeof fieldErrors]
        return newErrors
      })
    }

    // Clear contact error when either phone or whatsapp is filled
    if ((fieldName === 'phone' || fieldName === 'whatsappNumber') && fieldErrors.contact) {
      if (e.target.value || formData.phone || formData.whatsappNumber) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.contact
          return newErrors
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Client-side validation
    const errors: typeof fieldErrors = {}

    if (!formData.name_he.trim()) {
      errors.name_he = tCommon('required')
    }

    if (!formData.categoryId) {
      errors.categoryId = tCommon('required')
    }

    if (!formData.neighborhoodId) {
      errors.neighborhoodId = tCommon('required')
    }

    // At least phone or whatsapp required
    if (!formData.phone && !formData.whatsappNumber) {
      errors.contact = t('form.contactRequired')
    }

    // If there are errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError(t('validationError'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createOwnerBusiness({
        name_he: formData.name_he,
        name_ru: formData.name_ru || undefined,
        description_he: formData.description_he || undefined,
        description_ru: formData.description_ru || undefined,
        category_id: formData.categoryId,
        subcategory_id: formData.subcategoryId || undefined,
        neighborhood_id: formData.neighborhoodId,
        city_id: cityId,
        phone: formData.phone || undefined,
        whatsapp_number: formData.whatsappNumber || undefined,
        website_url: formData.websiteUrl || undefined,
        email: formData.email || undefined,
        opening_hours_he: formData.openingHours_he || undefined,
        opening_hours_ru: formData.openingHours_ru || undefined,
        address_he: formData.address_he || undefined,
        address_ru: formData.address_ru || undefined,
        serves_all_city: formData.servesAllCity,
      })

      if (result.success) {
        // Track business submitted
        await trackEvent('business_submitted', {
          category_id: formData.categoryId,
          neighborhood_id: formData.neighborhoodId,
          is_owner: true,
        })

        setSuccess(true)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/business-portal`)
        }, 2000)
      } else {
        setError(result.error || t('error'))
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error('Form submission error:', err)
      setError(t('error'))
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
          {locale === 'he' ? 'העסק נוסף בהצלחה!' : 'Бизнес успешно добавлен!'}
        </h2>
        <p className="text-green-700">
          {locale === 'he'
            ? 'העסק שלך נוסף ויופיע בלוח הבקרה שלך.'
            : 'Ваш бизнес добавлен и появится в вашей панели управления.'}
        </p>
      </div>
    )
  }

  const hasErrors = Object.keys(fieldErrors).length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
      {/* Validation Error Summary */}
      <div
        className={`rounded-lg bg-red-50 border border-red-200 p-4 transition-all ${
          hasErrors ? 'block' : 'hidden'
        }`}
        role={hasErrors ? 'alert' : undefined}
      >
        <h3 className="font-bold text-red-800 mb-2">{t('error')}</h3>
        <ul className="list-disc list-inside space-y-1 text-red-700">
          {fieldErrors.name_he && (
            <li>
              {t('form.name')}: {fieldErrors.name_he}
            </li>
          )}
          {fieldErrors.categoryId && (
            <li>
              {t('form.category')}: {fieldErrors.categoryId}
            </li>
          )}
          {fieldErrors.neighborhoodId && (
            <li>
              {t('form.neighborhood')}: {fieldErrors.neighborhoodId}
            </li>
          )}
          {fieldErrors.contact && <li>{fieldErrors.contact}</li>}
        </ul>
      </div>

      {/* Business Name */}
      <div>
        <label htmlFor="name_he" className="mb-2 block text-base font-semibold text-gray-900">
          {t('form.name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name_he"
          name="name_he"
          value={formData.name_he}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 ${
            fieldErrors.name_he
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          placeholder={t('form.namePlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
        {fieldErrors.name_he && (
          <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.name_he}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <SearchableSelect
          options={categories.map((category) => ({
            value: category.id,
            label: locale === 'he' ? category.name_he : category.name_ru,
          }))}
          value={formData.categoryId}
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              categoryId: value,
              subcategoryId: '',
            }))
            if (fieldErrors.categoryId) {
              setFieldErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.categoryId
                return newErrors
              })
            }
          }}
          placeholder={t('form.categoryPlaceholder')}
          searchPlaceholder={locale === 'he' ? 'חיפוש קטגוריה...' : 'Поиск категории...'}
          emptyMessage={locale === 'he' ? 'לא נמצאו קטגוריות' : 'Категории не найдены'}
          label={
            <>
              {t('form.category')} <span className="text-red-500">*</span>
            </>
          }
          required={true}
          error={!!fieldErrors.categoryId}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
        {fieldErrors.categoryId && (
          <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.categoryId}</p>
        )}
      </div>

      {/* Subcategory */}
      {availableSubcategories.length > 0 && (
        <div>
          <SearchableSelect
            options={[
              {
                value: '',
                label:
                  locale === 'he'
                    ? 'בחר תת-קטגוריה (אופציונלי)'
                    : 'Выберите подкатегорию (необязательно)',
              },
              ...availableSubcategories.map((subcategory) => ({
                value: subcategory.id,
                label: locale === 'he' ? subcategory.name_he : subcategory.name_ru,
              })),
            ]}
            value={formData.subcategoryId}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, subcategoryId: value }))
            }}
            placeholder={
              locale === 'he'
                ? 'בחר תת-קטגוריה (אופציונלי)'
                : 'Выберите подкатегорию (необязательно)'
            }
            searchPlaceholder={locale === 'he' ? 'חיפוש תת-קטגוריה...' : 'Поиск подкатегории...'}
            emptyMessage={locale === 'he' ? 'לא נמצאו תת-קטגוריות' : 'Подкатегории не найдены'}
            label={
              <>
                {locale === 'he' ? 'תת-קטגוריה' : 'Подкатегория'}{' '}
                <span className="text-gray-400">{tCommon('optional')}</span>
              </>
            }
            required={false}
            dir={locale === 'he' ? 'rtl' : 'ltr'}
          />
        </div>
      )}

      {/* Neighborhood */}
      <div>
        <SimpleSelect
          options={[
            { value: '', label: t('form.neighborhoodPlaceholder') },
            ...neighborhoods.map((neighborhood) => ({
              value: neighborhood.id,
              label: locale === 'he' ? neighborhood.name_he : neighborhood.name_ru,
            })),
          ]}
          value={formData.neighborhoodId}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, neighborhoodId: value }))
            if (fieldErrors.neighborhoodId) {
              setFieldErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.neighborhoodId
                return newErrors
              })
            }
          }}
          placeholder={t('form.neighborhoodPlaceholder')}
          label={
            <>
              {t('form.neighborhood')} <span className="text-red-500">*</span>
            </>
          }
          helperText={
            locale === 'he' ? 'המיקום בו העסק שלך ממוקם' : 'Местоположение вашего бизнеса'
          }
          required={true}
          error={!!fieldErrors.neighborhoodId}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
        {fieldErrors.neighborhoodId && (
          <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.neighborhoodId}</p>
        )}
      </div>

      {/* Serves All City Checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="servesAllCity"
          name="servesAllCity"
          checked={formData.servesAllCity}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, servesAllCity: e.target.checked }))
          }
          className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="servesAllCity" className="text-base text-gray-700">
          <span className="font-semibold">
            {locale === 'he' ? 'משרת את כל נתניה' : 'Обслуживает всю Нетанию'}
          </span>
          <span className="block text-sm text-gray-500">
            {locale === 'he'
              ? 'סמן אם העסק מספק שירות בכל אזורי העיר'
              : 'Отметьте, если бизнес обслуживает все районы города'}
          </span>
        </label>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description_he"
          className="mb-2 block text-base font-semibold text-gray-900"
        >
          {t('form.description')}{' '}
          <span className="text-gray-500 text-sm font-normal">{tCommon('optional')}</span>
        </label>
        <textarea
          id="description_he"
          name="description_he"
          value={formData.description_he}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('form.descriptionPlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Contact Info Section */}
      <div
        className={`rounded-lg border p-4 md:p-5 ${
          fieldErrors.contact ? 'border-red-500 bg-red-50' : 'border-primary-200 bg-primary-50'
        }`}
      >
        <h3 className="mb-1 text-lg font-bold text-gray-900">
          {t('form.contactRequired')} <span className="text-red-500">*</span>
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          {locale === 'he'
            ? 'נדרש לפחות אחד מהשדות הבאים'
            : 'Требуется хотя бы одно из следующих полей'}
        </p>

        <div className="space-y-4">
          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-900"
            >
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {t('form.phone')}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('form.phonePlaceholder')}
              dir="ltr"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label
              htmlFor="whatsappNumber"
              className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-900"
            >
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              {t('form.whatsapp')}
            </label>
            <input
              type="tel"
              id="whatsappNumber"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('form.whatsappPlaceholder')}
              dir="ltr"
            />
          </div>
        </div>
        {fieldErrors.contact && (
          <p className="mt-4 flex items-start gap-2 text-sm text-red-700 font-medium">
            <span className="text-lg">!</span>
            <span>{fieldErrors.contact}</span>
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-2 block font-medium text-gray-700">
          {locale === 'he' ? 'אימייל' : 'Email'}{' '}
          <span className="text-gray-400">{tCommon('optional')}</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={locale === 'he' ? 'example@email.com' : 'example@email.com'}
          dir="ltr"
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="websiteUrl" className="mb-2 block font-medium text-gray-700">
          {t('form.website')} <span className="text-gray-400">{tCommon('optional')}</span>
        </label>
        <input
          type="text"
          id="websiteUrl"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500"
          placeholder={t('form.websitePlaceholder')}
          dir="ltr"
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address_he" className="mb-2 block font-medium text-gray-700">
          {t('form.address')}{' '}
          <span className="text-gray-400">{tCommon('optional')}</span>
        </label>
        <input
          type="text"
          id="address_he"
          name="address_he"
          value={formData.address_he}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('form.addressPlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Opening Hours */}
      <div>
        <label htmlFor="openingHours" className="mb-2 block font-medium text-gray-700">
          {t('form.openingHours')}{' '}
          <span className="text-gray-400">{tCommon('optional')}</span>
        </label>
        <OpeningHoursInput
          value={formData.openingHours_he}
          onChange={(value) => setFormData((prev) => ({ ...prev, openingHours_he: value }))}
          locale={locale}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-primary-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-primary-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
        >
          {isSubmitting
            ? tCommon('loading')
            : locale === 'he'
              ? 'הוסף עסק'
              : 'Добавить бизнес'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/business-portal`)}
          disabled={isSubmitting}
          className="rounded-lg border-2 border-gray-300 px-6 py-4 text-base font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
        >
          {tCommon('cancel')}
        </button>
      </div>
    </form>
  )
}
