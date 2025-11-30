'use client'

import { useState } from 'react'
import { discardRejectedBusiness } from '@/lib/actions/business-owner'

interface DiscardRejectedBusinessButtonProps {
  businessId: string
  locale: string
}

export default function DiscardRejectedBusinessButton({
  businessId,
  locale,
}: DiscardRejectedBusinessButtonProps) {
  const [isDiscarding, setIsDiscarding] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDiscard = async () => {
    setIsDiscarding(true)
    const result = await discardRejectedBusiness(businessId)
    if (result.error) {
      alert(result.error)
      setIsDiscarding(false)
    }
    // Page will auto-refresh due to revalidation
  }

  if (showConfirmation) {
    return (
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleDiscard}
          disabled={isDiscarding}
          className="flex-1 rounded border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDiscarding
            ? locale === 'he'
              ? 'מוחק...'
              : 'Удаление...'
            : locale === 'he'
              ? 'כן, מחק'
              : 'Да, удалить'}
        </button>
        <button
          onClick={() => setShowConfirmation(false)}
          disabled={isDiscarding}
          className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {locale === 'he' ? 'ביטול' : 'Отмена'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirmation(true)}
      className="mt-3 w-full rounded border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
    >
      🗑️ {locale === 'he' ? 'מחק לצמיתות' : 'Удалить навсегда'}
    </button>
  )
}
