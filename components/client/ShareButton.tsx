'use client'

import { useState } from 'react'

interface ShareButtonProps {
  businessName: string
  businessUrl: string
  locale: string
  className?: string
}

export default function ShareButton({
  businessName,
  businessUrl,
  locale,
  className = '',
}: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const shareText =
    locale === 'he'
      ? `מצאתי את ${businessName} דרך Netanya Local 🎯\n${businessUrl}`
      : `Нашел(а) ${businessName} через Netanya Local 🎯\n${businessUrl}`

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      showToastMessage(
        locale === 'he' ? '✓ הועתק ללוח!' : '✓ Скопировано в буфер!',
        'success'
      )
    } catch (error) {
      showToastMessage(
        locale === 'he' ? '✗ שגיאה בהעתקה' : '✗ Ошибка копирования',
        'error'
      )
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: shareText,
          url: businessUrl,
        })
        showToastMessage(
          locale === 'he' ? '✓ שותף בהצלחה!' : '✓ Успешно поделились!',
          'success'
        )
      } catch (error: any) {
        // User cancelled - don't show error
        if (error.name !== 'AbortError') {
          showToastMessage(
            locale === 'he' ? '✗ שגיאה בשיתוף' : '✗ Ошибка при отправке',
            'error'
          )
        }
      }
    } else {
      // Fallback to copy to clipboard
      handleCopyToClipboard()
    }
  }

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        {/* Share Button */}
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          title={locale === 'he' ? 'שיתוף' : 'Поделиться'}
        >
          {/* Share Icon */}
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span className="hidden sm:inline">
            {locale === 'he' ? 'שיתוף' : 'Поделиться'}
          </span>
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform rounded-lg px-6 py-3 shadow-lg transition-all ${
            toastType === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </>
  )
}
