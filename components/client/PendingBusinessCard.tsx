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
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // PendingBusiness uses single-language fields (name, description, address)
  const name = business.name
  const description = business.description
  const address = business.address
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
    await rejectPendingBusiness(business.id, locale, rejectionReason.trim())
    // Page will revalidate automatically
  }

  const cancelReject = () => {
    setShowRejectionDialog(false)
    setRejectionReason('')
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

        {/* Social Media */}
        {(business.instagram_url ||
          business.facebook_url ||
          business.tiktok_url) && (
          <div>
            <p className="text-sm font-medium text-gray-700">
              {locale === 'he' ? 'רשתות חברתיות' : 'Социальные сети'}
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              {business.instagram_url && (
                <div>
                  📷{' '}
                  <a
                    href={
                      business.instagram_url.startsWith('http')
                        ? business.instagram_url
                        : `https://${business.instagram_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:underline"
                  >
                    Instagram
                  </a>
                </div>
              )}
              {business.facebook_url && (
                <div>
                  👥{' '}
                  <a
                    href={
                      business.facebook_url.startsWith('http')
                        ? business.facebook_url
                        : `https://${business.facebook_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Facebook
                  </a>
                </div>
              )}
              {business.tiktok_url && (
                <div>
                  🎵{' '}
                  <a
                    href={
                      business.tiktok_url.startsWith('http')
                        ? business.tiktok_url
                        : `https://${business.tiktok_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:underline"
                  >
                    TikTok
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

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

      {/* Rejection Dialog */}
      {showRejectionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="m-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              {locale === 'he' ? 'דחיית עסק' : 'Отклонение бизнеса'}
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
                  ? 'לדוגמה: מידע חסר, פרטי קשר שגויים, עסק לא רלוונטי...'
                  : 'Например: недостающая информация, неверные контакты, нерелевантный бизнес...'
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
