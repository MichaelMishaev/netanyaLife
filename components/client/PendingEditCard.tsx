'use client'

import { useState } from 'react'
import { approvePendingEdit, rejectPendingEdit } from '@/lib/actions/admin'

interface PendingEditCardProps {
  edit: any
  locale: string
}

export default function PendingEditCard({ edit, locale }: PendingEditCardProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const business = edit.business
  const owner = edit.owner

  // Helper function to determine if a field changed
  const hasChanged = (field: string) => {
    const oldValue = (business as any)[field]
    const newValue = (edit as any)[field]

    // Convert null to empty string for comparison
    const oldStr = oldValue === null ? '' : String(oldValue)
    const newStr = newValue === null ? '' : String(newValue)

    return oldStr !== newStr
  }

  // Helper to render a field comparison
  const renderFieldDiff = (
    fieldName: string,
    label: string,
    oldValue: string | null,
    newValue: string | null
  ) => {
    if (!hasChanged(fieldName)) return null

    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">{label}</p>
        <div className="space-y-2">
          {/* Old value */}
          <div className="rounded bg-red-50 p-3 border-l-4 border-red-500">
            <p className="text-xs font-medium text-red-700 mb-1">
              {locale === 'he' ? 'לפני:' : 'До:'}
            </p>
            <p className="text-sm text-gray-700" dir={locale === 'he' ? 'rtl' : 'ltr'}>
              {oldValue || (
                <span className="italic text-gray-400">
                  {locale === 'he' ? 'ריק' : 'Пусто'}
                </span>
              )}
            </p>
          </div>
          {/* New value */}
          <div className="rounded bg-green-50 p-3 border-l-4 border-green-500">
            <p className="text-xs font-medium text-green-700 mb-1">
              {locale === 'he' ? 'אחרי:' : 'После:'}
            </p>
            <p className="text-sm text-gray-700" dir={locale === 'he' ? 'rtl' : 'ltr'}>
              {newValue || (
                <span className="italic text-gray-400">
                  {locale === 'he' ? 'ריק' : 'Пусто'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleApprove = async () => {
    setIsApproving(true)
    await approvePendingEdit(edit.id, locale)
    // Page will revalidate automatically
  }

  const handleReject = () => {
    setShowRejectionDialog(true)
  }

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert(
        locale === 'he'
          ? 'נא להזין סיבת דחייה'
          : 'Пожалуйста, введите причину отклонения'
      )
      return
    }

    setIsRejecting(true)
    setShowRejectionDialog(false)
    await rejectPendingEdit(edit.id, locale, rejectionReason.trim())
    // Page will revalidate automatically
  }

  const cancelReject = () => {
    setShowRejectionDialog(false)
    setRejectionReason('')
  }

  // Calculate number of changes
  const changedFields = [
    'description_he',
    'description_ru',
    'phone',
    'whatsapp_number',
    'website_url',
    'email',
    'opening_hours_he',
    'opening_hours_ru',
    'address_he',
    'address_ru',
  ].filter(hasChanged)

  const changeCount = changedFields.length

  return (
    <div className="rounded-lg border-2 border-blue-300 bg-white p-6 shadow-md">
      {/* Header */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">
              {locale === 'he' ? business.name_he : business.name_ru || business.name_he}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
              <span>
                {locale === 'he' ? business.category?.name_he : business.category?.name_ru}
              </span>
              {business.subcategory && (
                <>
                  <span>→</span>
                  <span>
                    {locale === 'he'
                      ? business.subcategory.name_he
                      : business.subcategory.name_ru}
                  </span>
                </>
              )}
              <span>•</span>
              <span>
                {locale === 'he'
                  ? business.neighborhood.name_he
                  : business.neighborhood.name_ru}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <p>
                {locale === 'he' ? 'בעל העסק:' : 'Владелец:'} {owner.name} ({owner.email})
              </p>
              <p>
                {locale === 'he' ? 'תאריך הגשה:' : 'Дата подачи:'}{' '}
                {new Date(edit.created_at).toLocaleDateString(locale)}
              </p>
            </div>
          </div>
          <div className="ml-4">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-800">
              {changeCount} {locale === 'he' ? 'שינויים' : 'изменений'}
            </span>
          </div>
        </div>
      </div>

      {/* Changes Grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {renderFieldDiff('description_he', locale === 'he' ? 'תיאור (עברית)' : 'Описание (Иврит)', business.description_he, edit.description_he)}
        {renderFieldDiff('description_ru', locale === 'he' ? 'תיאור (רוסית)' : 'Описание (Русский)', business.description_ru, edit.description_ru)}
        {renderFieldDiff('phone', locale === 'he' ? 'טלפון' : 'Телефон', business.phone, edit.phone)}
        {renderFieldDiff('whatsapp_number', locale === 'he' ? 'ווטסאפ' : 'WhatsApp', business.whatsapp_number, edit.whatsapp_number)}
        {renderFieldDiff('website_url', locale === 'he' ? 'אתר אינטרנט' : 'Веб-сайт', business.website_url, edit.website_url)}
        {renderFieldDiff('email', locale === 'he' ? 'אימייל' : 'Email', business.email, edit.email)}
        {renderFieldDiff('opening_hours_he', locale === 'he' ? 'שעות פתיחה (עברית)' : 'Часы работы (Иврит)', business.opening_hours_he, edit.opening_hours_he)}
        {renderFieldDiff('opening_hours_ru', locale === 'he' ? 'שעות פתיחה (רוסית)' : 'Часы работы (Русский)', business.opening_hours_ru, edit.opening_hours_ru)}
        {renderFieldDiff('address_he', locale === 'he' ? 'כתובת (עברית)' : 'Адрес (Иврит)', business.address_he, edit.address_he)}
        {renderFieldDiff('address_ru', locale === 'he' ? 'כתובת (רוסית)' : 'Адрес (Русский)', business.address_ru, edit.address_ru)}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApproving
            ? locale === 'he'
              ? 'מאשר...'
              : 'Одобрение...'
            : locale === 'he'
              ? 'אשר שינויים'
              : 'Одобрить изменения'}
        </button>
        <button
          onClick={handleReject}
          disabled={isRejecting}
          className="flex-1 rounded-lg border-2 border-red-300 bg-white px-4 py-3 font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRejecting
            ? locale === 'he'
              ? 'דוחה...'
              : 'Отклонение...'
            : locale === 'he'
              ? 'דחה שינויים'
              : 'Отклонить изменения'}
        </button>
      </div>

      {/* Rejection Dialog */}
      {showRejectionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="m-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              {locale === 'he' ? 'דחיית שינויים' : 'Отклонение изменений'}
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              {locale === 'he'
                ? 'נא להזין את הסיבה לדחייה. הסיבה תוצג לבעל העסק.'
                : 'Пожалуйста, введите причину отклонения. Причина будет показана владельцу бизнеса.'}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={
                locale === 'he'
                  ? 'לדוגמה: פרטים לא מדויקים, מידע חסר...'
                  : 'Например: неточные данные, недостающая информация...'
              }
              rows={4}
              dir={locale === 'he' ? 'rtl' : 'ltr'}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={confirmReject}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
              >
                {locale === 'he' ? 'אישור דחייה' : 'Подтвердить отклонение'}
              </button>
              <button
                onClick={cancelReject}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {locale === 'he' ? 'ביטול' : 'Отмена'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
