'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  toggleBusinessVisibility,
  toggleBusinessVerification,
  toggleBusinessPinned,
  toggleBusinessTest,
  deleteBusiness,
  updateBusinessSubcategory,
} from '@/lib/actions/admin'

interface Subcategory {
  id: string
  name_he: string
  name_ru: string
  category_id: string
}

interface BusinessManagementCardProps {
  business: any
  locale: string
  subcategories: Subcategory[]
}

export default function BusinessManagementCard({
  business,
  locale,
  subcategories,
}: BusinessManagementCardProps) {
  const t = useTranslations('admin.businesses')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Get subcategories for this business's category
  const availableSubcategories = subcategories.filter(
    (sub) => sub.category_id === business.category_id
  )

  const name =
    locale === 'he'
      ? business.name_he || business.name_ru
      : business.name_ru || business.name_he
  const categoryName =
    locale === 'he' ? business.category.name_he : business.category.name_ru
  const subcategoryName = business.subcategory
    ? locale === 'he'
      ? business.subcategory.name_he
      : business.subcategory.name_ru
    : null
  const neighborhoodName =
    locale === 'he'
      ? business.neighborhood.name_he
      : business.neighborhood.name_ru

  const handleToggleVisibility = async () => {
    setIsUpdating(true)
    await toggleBusinessVisibility(business.id, locale)
    setIsUpdating(false)
  }

  const handleToggleVerification = async () => {
    setIsUpdating(true)
    await toggleBusinessVerification(business.id, locale)
    setIsUpdating(false)
  }

  const handleTogglePinned = async () => {
    setIsUpdating(true)
    await toggleBusinessPinned(business.id, locale)
    setIsUpdating(false)
  }

  const handleToggleTest = async () => {
    setIsUpdating(true)
    await toggleBusinessTest(business.id, locale)
    setIsUpdating(false)
  }

  const handleDelete = async () => {
    if (
      !confirm(
        locale === 'he'
          ? 'האם אתה בטוח שברצונך למחוק עסק זה?'
          : 'Вы уверены, что хотите удалить это предприятие?'
      )
    ) {
      return
    }

    setIsUpdating(true)
    await deleteBusiness(business.id, locale)
    // Page will revalidate automatically
  }

  const handleSubcategoryChange = async (subcategoryId: string) => {
    setIsUpdating(true)
    await updateBusinessSubcategory(
      business.id,
      subcategoryId === '' ? null : subcategoryId,
      locale
    )
    setIsUpdating(false)
    setIsEditingSubcategory(false)
  }

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm md:p-6 ${
        !business.is_visible ? 'opacity-60' : ''
      }`}
    >
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Business Info */}
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-bold text-gray-900">{name}</h3>

          {/* Status Badges */}
          <div className="mb-3 flex flex-wrap gap-2">
            {business.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-green-500/30 ring-1 ring-white">
                <svg className="h-3.5 w-3.5 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l5.88-5.88 1.41 1.41L11 16.59z"/>
                </svg>
                {locale === 'he' ? 'מאומת' : 'Проверено'}
              </span>
            )}
            {business.is_pinned && (
              <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
                📌 {locale === 'he' ? 'מוצמד' : 'Закреплено'}
              </span>
            )}
            {!business.is_visible && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                🚫 {locale === 'he' ? 'מוסתר' : 'Скрыто'}
              </span>
            )}
            {business.is_test && (
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800">
                🧪 {locale === 'he' ? 'בדיקה' : 'Тест'}
              </span>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span>{categoryName}</span>
            <span>›</span>
            {isEditingSubcategory ? (
              <select
                value={business.subcategory_id || ''}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={isUpdating}
                className="rounded border border-gray-300 px-2 py-0.5 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                autoFocus
                onBlur={() => setIsEditingSubcategory(false)}
              >
                <option value="">{locale === 'he' ? '-- ללא --' : '-- Без --'}</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {locale === 'he' ? sub.name_he : sub.name_ru}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => availableSubcategories.length > 0 && setIsEditingSubcategory(true)}
                className={`${
                  subcategoryName
                    ? 'text-gray-600'
                    : 'italic text-orange-500'
                } ${availableSubcategories.length > 0 ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
                title={availableSubcategories.length > 0
                  ? (locale === 'he' ? 'לחץ לשינוי' : 'Нажмите для изменения')
                  : (locale === 'he' ? 'אין תת-קטגוריות' : 'Нет подкатегорий')}
              >
                {subcategoryName || (locale === 'he' ? 'בחר תת-קטגוריה' : 'Выберите')}
              </button>
            )}
            <span>•</span>
            <span>{neighborhoodName}</span>
            <span>•</span>
            <span>
              {business._count.reviews}{' '}
              {locale === 'he' ? 'ביקורות' : 'отзывов'}
            </span>
          </div>
        </div>

        {/* Action Buttons - Mobile Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleToggleVisibility}
            disabled={isUpdating}
            className={`min-w-0 rounded-lg border px-2 py-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_visible
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200'
            }`}
          >
            {business.is_visible
              ? locale === 'he'
                ? 'הסתר'
                : 'Скрыть'
              : locale === 'he'
                ? 'הצג'
                : 'Показать'}
          </button>

          <button
            onClick={handleToggleVerification}
            disabled={isUpdating}
            className={`min-w-0 rounded-lg border px-2 py-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_verified
                ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l5.88-5.88 1.41 1.41L11 16.59z"/>
              </svg>
              <span className="truncate">
                {business.is_verified
                  ? locale === 'he'
                    ? 'בטל'
                    : 'Снять'
                  : locale === 'he'
                    ? 'אמת'
                    : 'Верифицировать'}
              </span>
            </span>
          </button>

          <button
            onClick={handleTogglePinned}
            disabled={isUpdating}
            className={`min-w-0 rounded-lg border px-2 py-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_pinned
                ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 active:bg-purple-200'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-0.5">
              <span className="text-[10px]">📌</span>
              <span className="truncate">
                {business.is_pinned
                  ? locale === 'he'
                    ? 'בטל'
                    : 'Открепить'
                  : locale === 'he'
                    ? 'הצמד'
                    : 'Закрепить'}
              </span>
            </span>
          </button>

          <button
            onClick={handleToggleTest}
            disabled={isUpdating}
            className={`min-w-0 rounded-lg border px-2 py-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_test
                ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 active:bg-orange-200'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-0.5">
              <span className="text-[10px]">🧪</span>
              <span className="truncate">
                {business.is_test
                  ? locale === 'he'
                    ? 'יצור'
                    : 'Продакшн'
                  : locale === 'he'
                    ? 'בדיקה'
                    : 'Тест'}
              </span>
            </span>
          </button>

          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="min-w-0 rounded-lg border border-red-300 px-2 py-2.5 text-xs font-medium text-red-700 transition hover:bg-red-50 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-0.5">
              <span className="text-[10px]">🗑️</span>
              <span className="truncate">{locale === 'he' ? 'מחק' : 'Удалить'}</span>
            </span>
          </button>
        </div>

        {/* View Details & Edit - Mobile */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {showDetails
              ? (locale === 'he' ? 'הסתר פרטים' : 'Скрыть')
              : (locale === 'he' ? 'הצג פרטים' : 'Подробнее')}
          </button>
          <Link
            href={`/${locale}/admin/businesses/${business.id}/edit`}
            className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-primary-700"
          >
            {locale === 'he' ? 'עריכה' : 'Редактировать'}
          </Link>
        </div>

        {/* Expandable Details - Mobile */}
        {showDetails && (
          <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
            {business.phone && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{locale === 'he' ? 'טלפון:' : 'Тел:'}</span>
                <a href={`tel:${business.phone}`} className="text-primary-600 hover:underline" dir="ltr">
                  {business.phone}
                </a>
              </div>
            )}
            {business.whatsapp_number && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{locale === 'he' ? 'וואטסאפ:' : 'WhatsApp:'}</span>
                <span dir="ltr">{business.whatsapp_number}</span>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{locale === 'he' ? 'אימייל:' : 'Email:'}</span>
                <a href={`mailto:${business.email}`} className="text-primary-600 hover:underline">
                  {business.email}
                </a>
              </div>
            )}
            {(business.address_he || business.address_ru) && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{locale === 'he' ? 'כתובת:' : 'Адрес:'}</span>
                <span>{locale === 'he' ? business.address_he : business.address_ru}</span>
              </div>
            )}
            {business.website_url && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{locale === 'he' ? 'אתר:' : 'Сайт:'}</span>
                <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {business.website_url}
                </a>
              </div>
            )}
            {business.owner_id && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{locale === 'he' ? 'בעלים:' : 'Владелец:'}</span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                  {locale === 'he' ? 'משויך' : 'Привязан'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:items-start md:justify-between">
        {/* Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            {business.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 px-2 py-1 text-xs font-bold text-white shadow-md shadow-green-500/30 ring-1 ring-white">
                <svg className="h-3.5 w-3.5 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l5.88-5.88 1.41 1.41L11 16.59z"/>
                </svg>
                {locale === 'he' ? 'מאומת' : 'Проверено'}
              </span>
            )}
            {business.is_pinned && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                📌 {locale === 'he' ? 'מוצמד' : 'Закреплено'}
              </span>
            )}
            {!business.is_visible && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                🚫 {locale === 'he' ? 'מוסתר' : 'Скрыто'}
              </span>
            )}
            {business.is_test && (
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                🧪 {locale === 'he' ? 'בדיקה' : 'Тест'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span>{categoryName}</span>
            <span>›</span>
            {isEditingSubcategory ? (
              <select
                value={business.subcategory_id || ''}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={isUpdating}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                autoFocus
                onBlur={() => setIsEditingSubcategory(false)}
              >
                <option value="">{locale === 'he' ? '-- ללא --' : '-- Без --'}</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {locale === 'he' ? sub.name_he : sub.name_ru}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => availableSubcategories.length > 0 && setIsEditingSubcategory(true)}
                className={`${
                  subcategoryName
                    ? 'text-gray-600'
                    : 'italic text-orange-500'
                } ${availableSubcategories.length > 0 ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
                title={availableSubcategories.length > 0
                  ? (locale === 'he' ? 'לחץ לשינוי' : 'Нажмите для изменения')
                  : (locale === 'he' ? 'אין תת-קטגוריות' : 'Нет подкатегорий')}
              >
                {subcategoryName || (locale === 'he' ? 'בחר תת-קטגוריה' : 'Выберите')}
              </button>
            )}
            <span>•</span>
            <span>{neighborhoodName}</span>
            <span>•</span>
            <span>
              {business._count.reviews}{' '}
              {locale === 'he' ? 'ביקורות' : 'отзывов'}
            </span>
          </div>
        </div>

        {/* Actions - Desktop */}
        <div className="flex gap-2">
          <button
            onClick={handleToggleVisibility}
            disabled={isUpdating}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_visible
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
            title={
              business.is_visible
                ? locale === 'he'
                  ? 'הסתר'
                  : 'Скрыть'
                : locale === 'he'
                  ? 'הצג'
                  : 'Показать'
            }
          >
            {business.is_visible
              ? locale === 'he'
                ? 'הסתר'
                : 'Скрыть'
              : locale === 'he'
                ? 'הצג'
                : 'Показать'}
          </button>

          <button
            onClick={handleToggleVerification}
            disabled={isUpdating}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_verified
                ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title={
              business.is_verified
                ? locale === 'he'
                  ? 'בטל אימות'
                  : 'Снять проверку'
                : locale === 'he'
                  ? 'אמת'
                  : 'Проверить'
            }
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l5.88-5.88 1.41 1.41L11 16.59z"/>
            </svg>
          </button>

          <button
            onClick={handleTogglePinned}
            disabled={isUpdating}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_pinned
                ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title={
              business.is_pinned
                ? locale === 'he'
                  ? 'בטל הצמדה'
                  : 'Открепить'
                : locale === 'he'
                  ? 'הצמד'
                  : 'Закрепить'
            }
          >
            📌
          </button>

          <button
            onClick={handleToggleTest}
            disabled={isUpdating}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              business.is_test
                ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title={
              business.is_test
                ? locale === 'he'
                  ? 'יצור'
                  : 'Продакшн'
                : locale === 'he'
                  ? 'בדיקה'
                  : 'Тест'
            }
          >
            🧪
          </button>

          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            title={locale === 'he' ? 'מחק' : 'Удалить'}
          >
            🗑️
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            title={locale === 'he' ? 'הצג פרטים' : 'Подробнее'}
          >
            {showDetails ? '▲' : '▼'}
          </button>

          <Link
            href={`/${locale}/admin/businesses/${business.id}/edit`}
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            {locale === 'he' ? 'עריכה' : 'Редакт.'}
          </Link>
        </div>
      </div>

      {/* Expandable Details - Desktop */}
      {showDetails && (
        <div className="mt-4 hidden border-t pt-4 md:block">
          <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-3">
            {business.phone && (
              <div>
                <span className="text-gray-500">{locale === 'he' ? 'טלפון:' : 'Телефон:'}</span>{' '}
                <a href={`tel:${business.phone}`} className="text-primary-600 hover:underline" dir="ltr">
                  {business.phone}
                </a>
              </div>
            )}
            {business.whatsapp_number && (
              <div>
                <span className="text-gray-500">{locale === 'he' ? 'וואטסאפ:' : 'WhatsApp:'}</span>{' '}
                <span dir="ltr">{business.whatsapp_number}</span>
              </div>
            )}
            {business.email && (
              <div>
                <span className="text-gray-500">{locale === 'he' ? 'אימייל:' : 'Email:'}</span>{' '}
                <a href={`mailto:${business.email}`} className="text-primary-600 hover:underline">
                  {business.email}
                </a>
              </div>
            )}
            {(business.address_he || business.address_ru) && (
              <div>
                <span className="text-gray-500">{locale === 'he' ? 'כתובת:' : 'Адрес:'}</span>{' '}
                {locale === 'he' ? business.address_he : business.address_ru}
              </div>
            )}
            {business.website_url && (
              <div>
                <span className="text-gray-500">{locale === 'he' ? 'אתר:' : 'Сайт:'}</span>{' '}
                <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {(() => {
                    try {
                      return new URL(business.website_url).hostname
                    } catch {
                      return business.website_url
                    }
                  })()}
                </a>
              </div>
            )}
            {business.owner_id && (
              <div>
                <span className="text-gray-500">{locale === 'he' ? 'בעלים:' : 'Владелец:'}</span>{' '}
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                  {locale === 'he' ? 'משויך' : 'Привязан'}
                </span>
              </div>
            )}
            {(business.opening_hours_he || business.opening_hours_ru) && (
              <div className="col-span-2 lg:col-span-3">
                <span className="text-gray-500">{locale === 'he' ? 'שעות פעילות:' : 'Часы работы:'}</span>{' '}
                {locale === 'he' ? business.opening_hours_he : business.opening_hours_ru}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
