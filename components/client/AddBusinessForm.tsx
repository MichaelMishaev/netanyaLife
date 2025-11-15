'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { submitPendingBusiness } from '@/lib/actions/businesses'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/contexts/AnalyticsContext'

interface AddBusinessFormProps {
  categories: Array<{
    id: string
    name_he: string
    name_ru: string
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
    neighborhoodId: '',
    description: '',
    phone: '',
    whatsappNumber: '',
    websiteUrl: '',
    email: '',
    address: '',
    openingHours: '',
    submitterName: '',
    submitterEmail: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation: At least phone or whatsapp required
    if (!formData.phone && !formData.whatsappNumber) {
      setError(t('form.contactRequired'))
      return
    }

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
        setError(result.error || t('error'))
      }
    } catch (err) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('form.namePlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
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
          value={formData.categoryId}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t('form.categoryPlaceholder')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {locale === 'he' ? category.name_he : category.name_ru}
            </option>
          ))}
        </select>
      </div>

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
          value={formData.neighborhoodId}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-4 font-bold text-gray-900">
          {t('form.contactRequired')}
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
          type="url"
          id="websiteUrl"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('form.websitePlaceholder')}
          dir="ltr"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('form.email')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('form.emailPlaceholder')}
          dir="ltr"
        />
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('form.submitterEmailPlaceholder')}
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
    </form>
  )
}
