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

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, '_blank')
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
        {/* WhatsApp Share Button */}
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
          title={
            locale === 'he' ? 'שתף בווטסאפ' : 'Поделиться в WhatsApp'
          }
        >
          <span>💬</span>
          <span className="hidden sm:inline">
            {locale === 'he' ? 'שתף בווטסאפ' : 'WhatsApp'}
          </span>
        </button>

        {/* Copy/Native Share Button */}
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          title={locale === 'he' ? 'שיתוף' : 'Поделиться'}
        >
          <span>📤</span>
          <span className="hidden sm:inline">
            {locale === 'he' ? 'שיתוף' : 'Поделиться'}
          </span>
        </button>

        {/* Copy to Clipboard (Desktop) */}
        <button
          onClick={handleCopyToClipboard}
          className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:flex"
          title={locale === 'he' ? 'העתק קישור' : 'Копировать ссылку'}
        >
          <span>📋</span>
          <span>{locale === 'he' ? 'העתק' : 'Копировать'}</span>
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
