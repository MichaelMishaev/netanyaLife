'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBusiness } from '@/lib/actions/admin'

interface Business {
  id: string
  name_he: string
  name_ru: string | null
  description_he: string | null
  description_ru: string | null
  phone: string | null
  whatsapp_number: string | null
  website_url: string | null
  email: string | null
  address_he: string | null
  address_ru: string | null
  opening_hours_he: string | null
  opening_hours_ru: string | null
  category_id: string | null
  subcategory_id: string | null
  neighborhood_id: string
  owner_id: string | null
  is_visible: boolean
  is_verified: boolean
  is_pinned: boolean
  is_test: boolean
}

interface AdminBusinessEditFormProps {
  business: Business
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
  businessOwners: Array<{
    id: string
    name: string
    email: string
  }>
  locale: string
}

export default function AdminBusinessEditForm({
  business,
  categories,
  neighborhoods,
  businessOwners,
  locale,
}: AdminBusinessEditFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name_he: business.name_he,
    name_ru: business.name_ru || '',
    categoryId: business.category_id || '',
    subcategoryId: business.subcategory_id || '',
    neighborhoodId: business.neighborhood_id,
    ownerId: business.owner_id || '',
    description_he: business.description_he || '',
    description_ru: business.description_ru || '',
    phone: business.phone || '',
    whatsappNumber: business.whatsapp_number || '',
    websiteUrl: business.website_url || '',
    email: business.email || '',
    address_he: business.address_he || '',
    address_ru: business.address_ru || '',
    opening_hours_he: business.opening_hours_he || '',
    opening_hours_ru: business.opening_hours_ru || '',
    isVisible: business.is_visible,
    isVerified: business.is_verified,
    isPinned: business.is_pinned,
    isTest: business.is_test,
  })

  const selectedCategory = categories.find(c => c.id === formData.categoryId)
  const availableSubcategories = selectedCategory?.subcategories || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
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
    setIsSubmitting(true)

    try {
      const result = await updateBusiness(business.id, locale, formData)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/${locale}/admin/business-map`)
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || 'Failed to update business')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const t = {
    he: {
      nameHe: 'שם העסק (עברית)',
      nameRu: 'שם העסק (רוסית)',
      category: 'קטגוריה',
      subcategory: 'תת-קטגוריה',
      neighborhood: 'שכונה',
      owner: 'בעל העסק',
      selectOwner: 'בחר בעל עסק',
      noOwner: 'ללא בעלים',
      descriptionHe: 'תיאור (עברית)',
      descriptionRu: 'תיאור (רוסית)',
      phone: 'טלפון',
      whatsapp: 'וואטסאפ',
      website: 'אתר',
      email: 'אימייל',
      addressHe: 'כתובת (עברית)',
      addressRu: 'כתובת (רוסית)',
      hoursHe: 'שעות פעילות (עברית)',
      hoursRu: 'שעות פעילות (רוסית)',
      visible: 'גלוי',
      verified: 'מאומת',
      pinned: 'מוצמד',
      test: 'עסק בדיקה',
      save: 'שמור שינויים',
      saving: 'שומר...',
      success: 'העסק עודכן בהצלחה!',
      selectCategory: 'בחר קטגוריה',
      selectSubcategory: 'בחר תת-קטגוריה',
      selectNeighborhood: 'בחר שכונה',
      noSubcategory: 'ללא תת-קטגוריה',
      requiredFields: 'שדות חובה',
      contactInfo: 'פרטי התקשרות',
      locationInfo: 'פרטי מיקום',
      statusFlags: 'סטטוס',
      ownershipInfo: 'בעלות',
    },
    ru: {
      nameHe: 'Название (иврит)',
      nameRu: 'Название (русский)',
      category: 'Категория',
      subcategory: 'Подкатегория',
      neighborhood: 'Район',
      owner: 'Владелец бизнеса',
      selectOwner: 'Выберите владельца',
      noOwner: 'Без владельца',
      descriptionHe: 'Описание (иврит)',
      descriptionRu: 'Описание (русский)',
      phone: 'Телефон',
      whatsapp: 'WhatsApp',
      website: 'Сайт',
      email: 'Email',
      addressHe: 'Адрес (иврит)',
      addressRu: 'Адрес (русский)',
      hoursHe: 'Часы работы (иврит)',
      hoursRu: 'Часы работы (русский)',
      visible: 'Видимый',
      verified: 'Подтвержден',
      pinned: 'Закреплен',
      test: 'Тестовый',
      save: 'Сохранить изменения',
      saving: 'Сохранение...',
      success: 'Бизнес успешно обновлен!',
      selectCategory: 'Выберите категорию',
      selectSubcategory: 'Выберите подкатегорию',
      selectNeighborhood: 'Выберите район',
      noSubcategory: 'Без подкатегории',
      requiredFields: 'Обязательные поля',
      contactInfo: 'Контактная информация',
      locationInfo: 'Информация о местоположении',
      statusFlags: 'Статус',
      ownershipInfo: 'Владение',
    },
  }

  const text = t[locale as keyof typeof t] || t.he

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="mt-4 text-lg font-medium text-green-800">{text.success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">{text.requiredFields}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.nameHe} *
            </label>
            <input
              type="text"
              name="name_he"
              value={formData.name_he}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.nameRu}
            </label>
            <input
              type="text"
              name="name_ru"
              value={formData.name_ru}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.category} *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">{text.selectCategory}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === 'he' ? cat.name_he : cat.name_ru || cat.name_he}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.subcategory}
            </label>
            <select
              name="subcategoryId"
              value={formData.subcategoryId}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">{text.noSubcategory}</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {locale === 'he' ? sub.name_he : sub.name_ru || sub.name_he}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.neighborhood} *
            </label>
            <select
              name="neighborhoodId"
              value={formData.neighborhoodId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">{text.selectNeighborhood}</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {locale === 'he' ? n.name_he : n.name_ru || n.name_he}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">{text.contactInfo}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.phone}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              dir="ltr"
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.whatsapp}
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              dir="ltr"
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.website}
            </label>
            <input
              type="text"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              dir="ltr"
              placeholder="example.com or https://example.com"
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.email}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              dir="ltr"
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {text.descriptionHe}
          </label>
          <textarea
            name="description_he"
            value={formData.description_he}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {text.descriptionRu}
          </label>
          <textarea
            name="description_ru"
            value={formData.description_ru}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Location Info */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">{text.locationInfo}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.addressHe}
            </label>
            <input
              type="text"
              name="address_he"
              value={formData.address_he}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.addressRu}
            </label>
            <input
              type="text"
              name="address_ru"
              value={formData.address_ru}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.hoursHe}
            </label>
            <input
              type="text"
              name="opening_hours_he"
              value={formData.opening_hours_he}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {text.hoursRu}
            </label>
            <input
              type="text"
              name="opening_hours_ru"
              value={formData.opening_hours_ru}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Ownership Info */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">{text.ownershipInfo}</h3>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {text.owner}
          </label>
          <select
            name="ownerId"
            value={formData.ownerId}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
          >
            <option value="">{text.noOwner}</option>
            {businessOwners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Flags */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">{text.statusFlags}</h3>

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isVisible"
              checked={formData.isVisible}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-primary-600"
            />
            <span className="text-gray-700">{text.visible}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-blue-600"
            />
            <span className="text-gray-700">{text.verified}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-yellow-600"
            />
            <span className="text-gray-700">{text.pinned}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isTest"
              checked={formData.isTest}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-orange-600"
            />
            <span className="text-gray-700">{text.test}</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:bg-gray-400"
      >
        {isSubmitting ? text.saving : text.save}
      </button>
    </form>
  )
}
