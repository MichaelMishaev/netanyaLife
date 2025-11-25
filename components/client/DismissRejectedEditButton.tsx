'use client'

import { useState } from 'react'
import { dismissRejectedEdit } from '@/lib/actions/business-owner'

interface DismissRejectedEditButtonProps {
  businessId: string
  locale: string
}

export default function DismissRejectedEditButton({
  businessId,
  locale,
}: DismissRejectedEditButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDismiss = async () => {
    setIsLoading(true)
    setError(null)
    setShowConfirm(false)

    try {
      const result = await dismissRejectedEdit(businessId)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // On success, the page will revalidate and the component will unmount
    } catch (err) {
      setError(
        locale === 'he'
          ? 'שגיאה בביטול הבקשה'
          : 'Ошибка отмены запроса'
      )
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? locale === 'he'
            ? 'מבטל...'
            : 'Отмена...'
          : locale === 'he'
            ? 'בטל בקשה לעדכון'
            : 'Отменить запрос на обновление'}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" dir={locale === 'he' ? 'rtl' : 'ltr'}>
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
              {locale === 'he' ? 'בטל בקשה לעדכון' : 'Отменить запрос на обновление'}
            </h3>

            {/* Message */}
            <p className="mb-6 text-center text-sm text-gray-600">
              {locale === 'he'
                ? 'פעולה זו תבטל את השינויים שרצית לבצע'
                : 'Это удалит уведомление об отклонении с вашего дашборда. Вы сможете снова редактировать бизнес в любое время.'}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {locale === 'he' ? 'ביטול' : 'Отмена'}
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
              >
                {locale === 'he' ? 'כן, בטל בקשה' : 'Да, отменить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
