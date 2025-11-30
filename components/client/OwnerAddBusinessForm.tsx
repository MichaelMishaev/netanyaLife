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

type FormStep = 1 | 2 | 3 | 4

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

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<FormStep>(1)
  const TOTAL_STEPS = 4

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
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
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
    openingHours_he?: string
  }>({})

  // Auto-save to sessionStorage (prevent data loss on mobile)
  useEffect(() => {
    const saved = sessionStorage.getItem('ownerBusinessFormData')
    if (saved) {
      try {
        const parsedData = JSON.parse(saved)
        setFormData(parsedData)
      } catch (e) {
        console.error('Failed to parse saved form data:', e)
      }
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem('ownerBusinessFormData', JSON.stringify(formData))
  }, [formData])

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

  // Validate current step before proceeding
  const validateStep = (step: FormStep): boolean => {
    const errors: typeof fieldErrors = {}

    if (step === 1) {
      // Step 1: Business Basics
      if (!formData.name_he.trim()) {
        errors.name_he = tCommon('required')
      }
      if (!formData.categoryId) {
        errors.categoryId = tCommon('required')
      }
      if (!formData.neighborhoodId) {
        errors.neighborhoodId = tCommon('required')
      }
    } else if (step === 2) {
      // Step 2: Contact Info (at least phone or whatsapp required)
      if (!formData.phone && !formData.whatsappNumber) {
        errors.contact = t('form.contactRequired')
      }
    } else if (step === 3) {
      // Step 3: Location & Hours
      if (!formData.openingHours_he || !formData.openingHours_he.trim()) {
        errors.openingHours_he = tCommon('required')
      }
    }
    // Step 4 is all optional

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Navigate to next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS) as FormStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Navigate to previous step
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as FormStep)
    setFieldErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validate all required steps before submitting
    let allValid = true
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step as FormStep)) {
        allValid = false
        setCurrentStep(step as FormStep)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    if (!allValid) {
      setError(t('validationError'))
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
        instagram_url: formData.instagramUrl || undefined,
        facebook_url: formData.facebookUrl || undefined,
        tiktok_url: formData.tiktokUrl || undefined,
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
        // Clear saved form data
        sessionStorage.removeItem('ownerBusinessFormData')

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

  // Get step titles
  const getStepTitle = (step: FormStep) => {
    const titles = {
      he: ['פרטי העסק', 'יצירת קשר', 'מיקום ושעות', 'רשתות וסיום'],
      ru: ['Детали бизнеса', 'Контакты', 'Расположение и часы', 'Соцсети и финал'],
    }
    return locale === 'he' ? titles.he[step - 1] : titles.ru[step - 1]
  }

  // Show success message
  if (success) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
        <div className="mb-4 text-6xl">⏳</div>
        <h2 className="mb-2 text-2xl font-bold text-blue-800">
          {locale === 'he' ? 'העסק נשלח לאישור!' : 'Бизнес отправлен на одобрение!'}
        </h2>
        <p className="text-blue-700">
          {locale === 'he'
            ? 'העסק שלך נשלח לאישור מנהל ויופיע באתר לאחר אישור.'
            : 'Ваш бизнес отправлен на одобрение администратора и появится на сайте после одобрения.'}
        </p>
      </div>
    )
  }

  const hasErrors = Object.keys(fieldErrors).length > 0

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Progress Bar - Mobile First! Sticky on scroll */}
      <div className="sticky top-0 z-10 -mx-4 md:-mx-8 bg-white border-b border-gray-200 px-4 md:px-8 py-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {locale === 'he'
              ? `שלב ${currentStep} מתוך ${TOTAL_STEPS}`
              : `Шаг ${currentStep} из ${TOTAL_STEPS}`}
          </span>
          <span className="text-xs text-gray-500">{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step Title */}
        <h2 className="mt-4 text-xl font-bold text-gray-900 md:text-2xl">{getStepTitle(currentStep)}</h2>
      </div>

      {/* Validation Error Summary */}
      {hasErrors && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4" role="alert">
          <h3 className="font-bold text-red-800 mb-2 text-sm md:text-base">{t('error')}</h3>
          <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
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
            {fieldErrors.openingHours_he && (
              <li>
                {t('form.openingHours')}: {fieldErrors.openingHours_he}
              </li>
            )}
          </ul>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (currentStep === TOTAL_STEPS) {
            handleSubmit()
          } else {
            handleNext()
          }
        }}
        className="space-y-6"
      >
        {/* STEP 1: Business Basics */}
        {currentStep === 1 && (
          <div className="space-y-5 md:space-y-6">
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
                className={`w-full rounded-lg border px-4 py-3.5 text-base focus:outline-none focus:ring-2 transition ${
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
                      <span className="text-gray-500 text-sm font-normal">{tCommon('optional')}</span>
                    </>
                  }
                  required={false}
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                />

                {/* Helpful tip for subcategory selection */}
                <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-blue-50 p-3.5 text-sm border border-blue-100">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="flex-1 leading-relaxed text-blue-800">
                    {locale === 'he'
                      ? 'בחירת תת-קטגוריה מדויקת תגדיל את הסיכוי שהעסק שלך יוצג ללקוחות רלוונטיים'
                      : 'Выбор точной подкатегории увеличит шансы показа вашего бизнеса релевантным клиентам'}
                  </p>
                </div>
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
                helperText={locale === 'he' ? 'המיקום בו העסק שלך ממוקם' : 'Местоположение вашего бизнеса'}
                required={true}
                error={!!fieldErrors.neighborhoodId}
                dir={locale === 'he' ? 'rtl' : 'ltr'}
              />
              {fieldErrors.neighborhoodId && (
                <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.neighborhoodId}</p>
              )}
            </div>

            {/* Serves All City Checkbox */}
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 md:p-5">
              <input
                type="checkbox"
                id="servesAllCity"
                name="servesAllCity"
                checked={formData.servesAllCity}
                onChange={(e) => setFormData((prev) => ({ ...prev, servesAllCity: e.target.checked }))}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="servesAllCity" className="flex-1 text-base text-gray-700 cursor-pointer">
                <span className="font-semibold">
                  {locale === 'he' ? 'משרת את כל נתניה' : 'Обслуживает всю Нетанию'}
                </span>
                <span className="block text-sm text-gray-600 mt-1">
                  {locale === 'he'
                    ? 'סמן אם העסק מספק שירות בכל אזורי העיר'
                    : 'Отметьте, если бизнес обслуживает все районы города'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: Contact Info */}
        {currentStep === 2 && (
          <div className="space-y-5 md:space-y-6">
            {/* Contact Info Section */}
            <div
              className={`rounded-lg border p-5 md:p-6 ${
                fieldErrors.contact ? 'border-red-500 bg-red-50' : 'border-primary-200 bg-primary-50'
              }`}
            >
              <h3 className="mb-1.5 text-lg font-bold text-gray-900">
                {t('form.contactRequired')} <span className="text-red-500">*</span>
              </h3>
              <p className="mb-5 text-sm text-gray-600">
                {locale === 'he'
                  ? 'נדרש לפחות אחד מהשדות הבאים'
                  : 'Требуется хотя бы одно из следующих полей'}
              </p>

              <div className="space-y-5">
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    placeholder={t('form.whatsappPlaceholder')}
                    dir="ltr"
                  />
                </div>
              </div>

              {fieldErrors.contact && (
                <p className="mt-4 flex items-start gap-2 text-sm text-red-700 font-medium">
                  <span className="text-lg">⚠️</span>
                  <span>{fieldErrors.contact}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-base font-medium text-gray-700">
                {locale === 'he' ? 'אימייל' : 'Email'}{' '}
                <span className="text-gray-500 text-sm font-normal">{tCommon('optional')}</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                placeholder={locale === 'he' ? 'example@email.com' : 'example@email.com'}
                dir="ltr"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="websiteUrl" className="mb-2 block text-base font-medium text-gray-700">
                {t('form.website')}{' '}
                <span className="text-gray-500 text-sm font-normal">{tCommon('optional')}</span>
              </label>
              <input
                type="text"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500 transition"
                placeholder={t('form.websitePlaceholder')}
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Location & Hours */}
        {currentStep === 3 && (
          <div className="space-y-5 md:space-y-6">
            {/* Address */}
            <div>
              <label htmlFor="address_he" className="mb-2 block text-base font-medium text-gray-700">
                {t('form.address')}{' '}
                <span className="text-gray-500 text-sm font-normal">{tCommon('optional')}</span>
              </label>
              <input
                type="text"
                id="address_he"
                name="address_he"
                value={formData.address_he}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                placeholder={t('form.addressPlaceholder')}
                dir={locale === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Opening Hours */}
            <div>
              <label htmlFor="openingHours" className="mb-2 block text-base font-semibold text-gray-900">
                {t('form.openingHours')} <span className="text-red-500">*</span>
              </label>
              <OpeningHoursInput
                value={formData.openingHours_he}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, openingHours_he: value }))
                  // Clear error when user starts typing
                  if (fieldErrors.openingHours_he) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.openingHours_he
                      return newErrors
                    })
                  }
                }}
                locale={locale}
              />
              {fieldErrors.openingHours_he && (
                <p className="mt-2 text-sm font-medium text-red-600">{fieldErrors.openingHours_he}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Social & Details (All Optional) */}
        {currentStep === 4 && (
          <div className="space-y-5 md:space-y-6">
            {/* Optional Badge */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800 font-medium">
                {locale === 'he'
                  ? '✅ כל השדות בשלב זה אופציונליים - אך ממליצים למלא לחשיפה מקסימלית'
                  : '✅ Все поля на этом этапе необязательны - но рекомендуются для максимальной видимости'}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description_he" className="mb-2 block text-base font-semibold text-gray-900">
                {t('form.description')}{' '}
                <span className="text-gray-500 text-sm font-normal">{tCommon('optional')}</span>
              </label>
              <textarea
                id="description_he"
                name="description_he"
                value={formData.description_he}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                placeholder={t('form.descriptionPlaceholder')}
                dir={locale === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Social Media Links */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-5 md:p-6">
              <h3 className="mb-4 font-semibold text-gray-900 text-base">
                {locale === 'he' ? 'רשתות חברתיות' : 'Социальные сети'}{' '}
                <span className="text-gray-500 text-sm font-normal">{tCommon('optional')}</span>
              </h3>

              <div className="space-y-4">
                {/* Instagram */}
                <div>
                  <label htmlFor="instagramUrl" className="mb-2 block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500 transition"
                    placeholder="instagram.com/username"
                    dir="ltr"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label htmlFor="facebookUrl" className="mb-2 block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500 transition"
                    placeholder="facebook.com/page"
                    dir="ltr"
                  />
                </div>

                {/* TikTok */}
                <div>
                  <label htmlFor="tiktokUrl" className="mb-2 block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500 transition"
                    placeholder="tiktok.com/@username"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Russian Translations (Optional) */}
            {locale === 'he' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 md:p-6">
                <h3 className="mb-4 font-semibold text-gray-900 text-base">
                  תרגום לרוסית{' '}
                  <span className="text-gray-500 text-sm font-normal">{tCommon('optional')}</span>
                </h3>

                <div className="space-y-4">
                  {/* Business Name (Russian) */}
                  <div>
                    <label htmlFor="name_ru" className="mb-2 block text-sm font-medium text-gray-700">
                      שם העסק (רוסית)
                    </label>
                    <input
                      type="text"
                      id="name_ru"
                      name="name_ru"
                      value={formData.name_ru}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                      placeholder="Название бизнеса"
                      dir="ltr"
                    />
                  </div>

                  {/* Description (Russian) */}
                  <div>
                    <label htmlFor="description_ru" className="mb-2 block text-sm font-medium text-gray-700">
                      תיאור (רוסית)
                    </label>
                    <textarea
                      id="description_ru"
                      name="description_ru"
                      value={formData.description_ru}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                      placeholder="Описание бизнеса"
                      dir="ltr"
                    />
                  </div>

                  {/* Address (Russian) */}
                  <div>
                    <label htmlFor="address_ru" className="mb-2 block text-sm font-medium text-gray-700">
                      כתובת (רוסית)
                    </label>
                    <input
                      type="text"
                      id="address_ru"
                      name="address_ru"
                      value={formData.address_ru}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                      placeholder="Адрес"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800" role="alert">
            {error}
          </div>
        )}

        {/* Navigation Buttons - Mobile First! Sticky on mobile */}
        <div className="sticky bottom-0 -mx-4 md:-mx-8 border-t border-gray-200 bg-white px-4 md:px-8 py-4 shadow-lg md:static md:border-0 md:shadow-none md:p-0">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Back Button */}
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="order-2 sm:order-1 rounded-lg border-2 border-gray-300 px-6 py-3.5 md:py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locale === 'he' ? '← חזרה' : '← Назад'}
              </button>
            )}

            {/* Next/Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex-1 rounded-lg bg-primary-600 px-6 py-3.5 md:py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? tCommon('loading')
                : currentStep === TOTAL_STEPS
                  ? locale === 'he'
                    ? 'שלח לאישור'
                    : 'Отправить на одобрение'
                  : locale === 'he'
                    ? 'המשך →'
                    : 'Далее →'}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => router.push(`/${locale}/business-portal`)}
              disabled={isSubmitting}
              className="order-3 rounded-lg border border-gray-300 px-6 py-2.5 md:py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tCommon('cancel')}
            </button>
          </div>

          {/* Step Indicator for Mobile */}
          <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 w-2 rounded-full transition-all ${
                  step === currentStep
                    ? 'w-6 bg-primary-600'
                    : step < currentStep
                      ? 'bg-primary-400'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
