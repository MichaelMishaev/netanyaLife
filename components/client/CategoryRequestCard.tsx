'use client'

import { useState } from 'react'
import { approveCategoryRequest, rejectCategoryRequest } from '@/lib/actions/categories'
import { useRouter } from 'next/navigation'

interface CategoryRequestCardProps {
  request: {
    id: string
    category_name_he: string
    category_name_ru: string | null
    description: string | null
    requester_name: string | null
    requester_email: string | null
    requester_phone: string | null
    business_name: string | null
    status: string
    created_at: Date
  }
  locale: string
}

export default function CategoryRequestCard({
  request,
  locale,
}: CategoryRequestCardProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [createCategory, setCreateCategory] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Get admin email from session (you may need to pass this as a prop)
      const adminEmail = '345287@gmail.com' // TODO: Get from session

      const result = await approveCategoryRequest({
        requestId: request.id,
        adminEmail,
        createCategory,
        adminNotes: adminNotes.trim() || undefined,
      })

      if (result.success) {
        setShowApproveModal(false)
        router.refresh()
      } else {
        setError(result.error || 'Failed to approve request')
      }
    } catch (err) {
      console.error('Error approving request:', err)
      setError('Failed to approve request')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Get admin email from session
      const adminEmail = '345287@gmail.com' // TODO: Get from session

      const result = await rejectCategoryRequest({
        requestId: request.id,
        adminEmail,
        adminNotes: adminNotes.trim() || undefined,
      })

      if (result.success) {
        setShowRejectModal(false)
        router.refresh()
      } else {
        setError(result.error || 'Failed to reject request')
      }
    } catch (err) {
      console.error('Error rejecting request:', err)
      setError('Failed to reject request')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Category Names */}
            <div className="mb-3">
              <h3 className="text-xl font-bold text-gray-900">
                {request.category_name_he}
              </h3>
              {request.category_name_ru && (
                <p className="mt-1 text-sm text-gray-600">
                  {locale === 'he' ? 'ברוסית:' : 'На русском:'} {request.category_name_ru}
                </p>
              )}
            </div>

            {/* Description */}
            {request.description && (
              <div className="mb-4 rounded-lg bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">
                  {locale === 'he' ? 'סיבה:' : 'Причина:'}
                </p>
                <p className="mt-1 text-sm text-blue-800">{request.description}</p>
              </div>
            )}

            {/* Business Context */}
            {request.business_name && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {locale === 'he' ? 'עסק:' : 'Бизнес:'}
                  </span>{' '}
                  {request.business_name}
                </p>
              </div>
            )}

            {/* Contact Info */}
            <div className="mb-4 space-y-1">
              {request.requester_name && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {locale === 'he' ? 'שם:' : 'Имя:'}
                  </span>{' '}
                  {request.requester_name}
                </p>
              )}
              {request.requester_email && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {locale === 'he' ? 'אימייל:' : 'Email:'}
                  </span>{' '}
                  <a
                    href={`mailto:${request.requester_email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {request.requester_email}
                  </a>
                </p>
              )}
              {request.requester_phone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {locale === 'he' ? 'טלפון:' : 'Телефон:'}
                  </span>{' '}
                  <a
                    href={`tel:${request.requester_phone}`}
                    className="text-primary-600 hover:underline"
                  >
                    {request.requester_phone}
                  </a>
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-500">
              {locale === 'he' ? 'נשלח:' : 'Отправлено:'}{' '}
              {new Date(request.created_at).toLocaleString(locale === 'he' ? 'he-IL' : 'ru-RU')}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ms-6 flex flex-col gap-2">
            <button
              onClick={() => setShowApproveModal(true)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              {locale === 'he' ? 'אשר' : 'Одобрить'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              {locale === 'he' ? 'דחה' : 'Отклонить'}
            </button>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              {locale === 'he' ? 'אישור בקשת קטגוריה' : 'Одобрить запрос категории'}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-700">
                {locale === 'he' ? 'קטגוריה:' : 'Категория:'}{' '}
                <strong>{request.category_name_he}</strong>
              </p>
            </div>

            {/* Create Category Checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={createCategory}
                  onChange={(e) => setCreateCategory(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {locale === 'he'
                    ? 'צור קטגוריה חדשה במערכת'
                    : 'Создать новую категорию в системе'}
                </span>
              </label>
              <p className="ms-8 mt-1 text-xs text-gray-500">
                {locale === 'he'
                  ? 'אם לא מסומן, הבקשה תסומן כאושרה ללא יצירת קטגוריה'
                  : 'Если не отмечено, запрос будет одобрен без создания категории'}
              </p>
            </div>

            {/* Admin Notes */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {locale === 'he' ? 'הערות (אופציונלי)' : 'Заметки (необязательно)'}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={locale === 'he' ? 'הערות פנימיות...' : 'Внутренние заметки...'}
                dir={locale === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing
                  ? (locale === 'he' ? 'מעבד...' : 'Обработка...')
                  : (locale === 'he' ? 'אשר' : 'Одобрить')}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setAdminNotes('')
                  setError(null)
                }}
                disabled={isProcessing}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locale === 'he' ? 'ביטול' : 'Отмена'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              {locale === 'he' ? 'דחיית בקשת קטגוריה' : 'Отклонить запрос категории'}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-700">
                {locale === 'he' ? 'קטגוריה:' : 'Категория:'}{' '}
                <strong>{request.category_name_he}</strong>
              </p>
            </div>

            {/* Admin Notes */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {locale === 'he' ? 'סיבת דחייה (מומלץ)' : 'Причина отклонения (рекомендуется)'}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={
                  locale === 'he'
                    ? 'למה הבקשה נדחתה?'
                    : 'Почему запрос отклонён?'
                }
                dir={locale === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing
                  ? (locale === 'he' ? 'מעבד...' : 'Обработка...')
                  : (locale === 'he' ? 'דחה' : 'Отклонить')}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setAdminNotes('')
                  setError(null)
                }}
                disabled={isProcessing}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locale === 'he' ? 'ביטול' : 'Отмена'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
