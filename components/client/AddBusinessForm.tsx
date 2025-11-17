'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { submitPendingBusiness } from '@/lib/actions/businesses'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import CategoryRequestModal from './CategoryRequestModal'

interface AddBusinessFormProps {
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

export default function AddBusinessForm({
  categories,
  neighborhoods,
  locale,
}: AddBusinessFormProps) {
  const t = useTranslations('addBusiness')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { trackEvent } = useAnalytics()

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
    address: '',
    openingHours: '',
    submitterName: '',
    submitterEmail: '',
    servesAllCity: false,
  })

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.id === formData.categoryId)
  const availableSubcategories = selectedCategory?.subcategories || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCategoryRequestModal, setShowCategoryRequestModal] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    categoryId?: string
    neighborhoodId?: string
    contact?: string
    websiteUrl?: string
    submitterEmail?: string
  }>({})

  // Refs for validation
  const categoryRef = useRef<HTMLSelectElement>(null)
  const neighborhoodRef = useRef<HTMLSelectElement>(null)

  // Set custom validation messages in the selected language
  useEffect(() => {
    const categoryEl = categoryRef.current
    const neighborhoodEl = neighborhoodRef.current

    const handleCategoryInvalid = () => {
      if (categoryEl) {
        categoryEl.setCustomValidity(t('form.categoryPlaceholder'))
      }
    }

    const handleNeighborhoodInvalid = () => {
      if (neighborhoodEl) {
        neighborhoodEl.setCustomValidity(t('form.neighborhoodPlaceholder'))
      }
    }

    const handleCategoryChange = () => {
      if (categoryEl) {
        categoryEl.setCustomValidity('')
      }
    }

    const handleNeighborhoodChange = () => {
      if (neighborhoodEl) {
        neighborhoodEl.setCustomValidity('')
      }
    }

    if (categoryEl) {
      categoryEl.addEventListener('invalid', handleCategoryInvalid)
      categoryEl.addEventListener('change', handleCategoryChange)
    }

    if (neighborhoodEl) {
      neighborhoodEl.addEventListener('invalid', handleNeighborhoodInvalid)
      neighborhoodEl.addEventListener('change', handleNeighborhoodChange)
    }

    return () => {
      if (categoryEl) {
        categoryEl.removeEventListener('invalid', handleCategoryInvalid)
        categoryEl.removeEventListener('change', handleCategoryChange)
      }
      if (neighborhoodEl) {
        neighborhoodEl.removeEventListener('invalid', handleNeighborhoodInvalid)
        neighborhoodEl.removeEventListener('change', handleNeighborhoodChange)
      }
    }
  }, [t])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const fieldName = e.target.name
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value

    // If category changes, reset subcategory
    if (fieldName === 'categoryId') {
      setFormData((prev) => ({
        ...prev,
        categoryId: value as string,
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

    // Debug: Log form data
    console.log('🔍 Form submission attempt:', {
      name: formData.name,
      categoryId: formData.categoryId,
      neighborhoodId: formData.neighborhoodId,
      phone: formData.phone,
      whatsappNumber: formData.whatsappNumber,
      servesAllCity: formData.servesAllCity,
    })

    // Client-side validation
    const errors: typeof fieldErrors = {}

    if (!formData.name.trim()) {
      errors.name = tCommon('required')
      console.log('❌ Validation error: name is empty')
    }

    if (!formData.categoryId) {
      errors.categoryId = tCommon('required')
      console.log('❌ Validation error: categoryId is empty')
    }

    if (!formData.neighborhoodId) {
      errors.neighborhoodId = tCommon('required')
      console.log('❌ Validation error: neighborhoodId is empty')
    }

    // At least phone or whatsapp required
    if (!formData.phone && !formData.whatsappNumber) {
      errors.contact = t('form.contactRequired')
      console.log('❌ Validation error: no contact method provided')
    }

    // If there are errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      console.log('🚫 Form submission BLOCKED. Errors:', errors)
      setFieldErrors(errors)
      setError(t('validationError'))
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    console.log('✅ Validation passed. Submitting to server...')
    setIsSubmitting(true)

    try {
      const result = await submitPendingBusiness(locale, formData)

      if (result.success) {
        // Track business submitted
        await trackEvent('business_submitted', {
          category_id: formData.categoryId,
          neighborhood_id: formData.neighborhoodId,
        })

        setSuccess(true)
        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push(`/${locale}`)
        }, 3000)
      } else {
        console.log('❌ Server validation failed:', result)

        // Set general error message
        setError(result.error || t('error'))

        // Set field-specific errors if available
        if (result.validationErrors) {
          setFieldErrors(result.validationErrors as any)
        }

        // Scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error('❌ Form submission error:', err)
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
          {t('success')}
        </h2>
        <p className="text-green-700">{t('pending')}</p>
      </div>
    )
  }

  const hasErrors = Object.keys(fieldErrors).length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Validation Error Summary */}
      <div
        className={`rounded-lg bg-red-50 border border-red-200 p-4 transition-all ${
          hasErrors ? 'block' : 'hidden'
        }`}
        role={hasErrors ? 'alert' : undefined}
      >
        <h3 className="font-bold text-red-800 mb-2">
          {t('error')}
        </h3>
        <ul className="list-disc list-inside space-y-1 text-red-700">
          {fieldErrors.name && (
            <li>{t('form.name')}: {fieldErrors.name}</li>
          )}
          {fieldErrors.categoryId && (
            <li>{t('form.category')}: {fieldErrors.categoryId}</li>
          )}
          {fieldErrors.neighborhoodId && (
            <li>{t('form.neighborhood')}: {fieldErrors.neighborhoodId}</li>
          )}
          {fieldErrors.contact && (
            <li>{fieldErrors.contact}</li>
          )}
        </ul>
      </div>

      {/* Business Name */}
      <div>
        <label htmlFor="name" className="mb-2 block font-medium text-gray-700">
          {t('form.name')} <span className="text-red-500">*</span>
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
          placeholder={t('form.namePlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="categoryId"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('form.category')} <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          ref={categoryRef}
          value={formData.categoryId}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
            fieldErrors.categoryId
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
        >
          <option value="">{t('form.categoryPlaceholder')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {locale === 'he' ? category.name_he : category.name_ru}
            </option>
          ))}
        </select>
        {fieldErrors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.categoryId}</p>
        )}

        {/* Request New Category Button */}
        <button
          type="button"
          onClick={() => setShowCategoryRequestModal(true)}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700 hover:underline focus:outline-none"
        >
          {locale === 'he' ? 'לא מצאת קטגוריה? בקש קטגוריה חדשה' : 'Не нашли категорию? Запросить новую'}
        </button>
      </div>

      {/* Subcategory - Only shown if category has subcategories */}
      {availableSubcategories.length > 0 && (
        <div>
          <label
            htmlFor="subcategoryId"
            className="mb-2 block font-medium text-gray-700"
          >
            {locale === 'he' ? 'תת-קטגוריה' : 'Подкатегория'} <span className="text-gray-400">{tCommon('optional')}</span>
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

      {/* Neighborhood */}
      <div>
        <label
          htmlFor="neighborhoodId"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('form.neighborhood')} <span className="text-red-500">*</span>
        </label>
        <select
          id="neighborhoodId"
          name="neighborhoodId"
          ref={neighborhoodRef}
          value={formData.neighborhoodId}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
            fieldErrors.neighborhoodId
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
        >
          <option value="">{t('form.neighborhoodPlaceholder')}</option>
          {neighborhoods.map((neighborhood) => (
            <option key={neighborhood.id} value={neighborhood.id}>
              {locale === 'he'
                ? neighborhood.name_he
                : neighborhood.name_ru}
            </option>
          ))}
        </select>
        {fieldErrors.neighborhoodId && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.neighborhoodId}
          </p>
        )}
      </div>

      {/* Serves All City Checkbox */}
      <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
        <label htmlFor="servesAllCity" className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            id="servesAllCity"
            name="servesAllCity"
            checked={formData.servesAllCity}
            onChange={handleChange}
            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
          />
          <span className="font-medium text-gray-900">
            {t('form.servesAllCity')}
          </span>
        </label>
        <p className="mt-2 ms-8 text-sm text-gray-600">
          {t('form.servesAllCityDescription')}
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('form.description')}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('form.descriptionPlaceholder')}
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
          {t('form.contactRequired')} <span className="text-red-500">*</span>
        </h3>

        <div className="space-y-4">
          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block font-medium text-gray-700"
            >
              {t('form.phone')}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('form.phonePlaceholder')}
              dir="ltr"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label
              htmlFor="whatsappNumber"
              className="mb-2 block font-medium text-gray-700"
            >
              {t('form.whatsapp')}
            </label>
            <input
              type="tel"
              id="whatsappNumber"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('form.whatsappPlaceholder')}
              dir="ltr"
            />
          </div>
        </div>
        {fieldErrors.contact && (
          <p className="mt-4 text-sm text-red-600 font-medium">
            {fieldErrors.contact}
          </p>
        )}
      </div>

      {/* Website */}
      <div>
        <label
          htmlFor="websiteUrl"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('form.website')}
        </label>
        <input
          type="text"
          id="websiteUrl"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
            fieldErrors.websiteUrl
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          placeholder={t('form.websitePlaceholder')}
          dir="ltr"
        />
        {fieldErrors.websiteUrl && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.websiteUrl}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="address"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('form.address')}
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('form.addressPlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Opening Hours */}
      <div>
        <label
          htmlFor="openingHours"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('form.openingHours')}
        </label>
        <input
          type="text"
          id="openingHours"
          name="openingHours"
          value={formData.openingHours}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('form.openingHoursPlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Submitter Info Section */}
      <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-bold text-gray-900">
          {t('form.submitterName')}
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          {t('form.submitterEmailPlaceholder')}
        </p>

        <div className="space-y-4">
          {/* Submitter Name */}
          <div>
            <label
              htmlFor="submitterName"
              className="mb-2 block font-medium text-gray-700"
            >
              {t('form.submitterName')}
            </label>
            <input
              type="text"
              id="submitterName"
              name="submitterName"
              value={formData.submitterName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('form.submitterNamePlaceholder')}
              dir={locale === 'he' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Submitter Email */}
          <div>
            <label
              htmlFor="submitterEmail"
              className="mb-2 block font-medium text-gray-700"
            >
              {t('form.submitterEmail')}
            </label>
            <input
              type="email"
              id="submitterEmail"
              name="submitterEmail"
              value={formData.submitterEmail}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                fieldErrors.submitterEmail
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
              placeholder={t('form.submitterEmailPlaceholder')}
              dir="ltr"
            />
            {fieldErrors.submitterEmail && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.submitterEmail}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? tCommon('loading') : t('submit')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tCommon('cancel')}
        </button>
      </div>

      {/* Category Request Modal */}
      <CategoryRequestModal
        isOpen={showCategoryRequestModal}
        onClose={() => setShowCategoryRequestModal(false)}
        locale={locale}
        businessName={formData.name}
      />
    </form>
  )
}
