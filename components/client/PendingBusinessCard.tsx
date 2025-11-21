'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  approvePendingBusiness,
  rejectPendingBusiness,
} from '@/lib/actions/admin'

interface PendingBusinessCardProps {
  business: any
  locale: string
}

export default function PendingBusinessCard({
  business,
  locale,
}: PendingBusinessCardProps) {
  const t = useTranslations('admin.pending')
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const name =
    locale === 'he'
      ? business.name_he || business.name_ru
      : business.name_ru || business.name_he
  const description =
    locale === 'he'
      ? business.description_he || business.description_ru
      : business.description_ru || business.description_he
  const address =
    locale === 'he'
      ? business.address_he || business.address_ru
      : business.address_ru || business.address_he
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

  const handleApprove = async () => {
    setIsApproving(true)
    await approvePendingBusiness(business.id, locale)
    // Page will revalidate automatically
  }

  const handleReject = async () => {
    if (
      !confirm(
        locale === 'he'
          ? 'האם אתה בטוח שברצונך לדחות עסק זה?'
          : 'Вы уверены, что хотите отклонить это предприятие?'
      )
    ) {
      return
    }

    setIsRejecting(true)
    await rejectPendingBusiness(business.id, locale)
    // Page will revalidate automatically
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
            <span>{categoryName}</span>
            {subcategoryName && (
              <>
                <span>→</span>
                <span>{subcategoryName}</span>
              </>
            )}
            <span>•</span>
            <span>{neighborhoodName}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(business.created_at).toLocaleDateString(locale)}
        </div>
      </div>

      {/* Details */}
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        {description && (
          <div>
            <p className="text-sm font-medium text-gray-700">
              {locale === 'he' ? 'תיאור' : 'Описание'}
            </p>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        )}

        {/* Contact */}
        <div>
          <p className="text-sm font-medium text-gray-700">
            {locale === 'he' ? 'יצירת קשר' : 'Контакты'}
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            {business.phone && <div>📞 {business.phone}</div>}
            {business.whatsapp_number && (
              <div>💬 {business.whatsapp_number}</div>
            )}
            {business.email && <div>📧 {business.email}</div>}
            {business.website_url && (
              <div>
                🌐{' '}
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {business.website_url}
                </a>
              </div>
            )}
          </div>
        </div>

        {address && (
          <div>
            <p className="text-sm font-medium text-gray-700">
              {locale === 'he' ? 'כתובת' : 'Адрес'}
            </p>
            <p className="text-sm text-gray-600">{address}</p>
          </div>
        )}

        {/* Submitter Info */}
        {(business.submitter_name || business.submitter_email) && (
          <div>
            <p className="text-sm font-medium text-gray-700">
              {locale === 'he' ? 'מגיש הבקשה' : 'Отправитель'}
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              {business.submitter_name && <div>{business.submitter_name}</div>}
              {business.submitter_email && (
                <div>{business.submitter_email}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApproving
            ? locale === 'he'
              ? 'מאשר...'
              : 'Одобрение...'
            : t('approve')}
        </button>
        <button
          onClick={handleReject}
          disabled={isRejecting}
          className="flex-1 rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRejecting
            ? locale === 'he'
              ? 'דוחה...'
              : 'Отклонение...'
            : t('reject')}
        </button>
      </div>
    </div>
  )
}
