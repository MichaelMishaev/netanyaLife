'use client'

import { useState, useTransition } from 'react'
import { toggleShowTestOnPublic } from '@/lib/actions/admin'

interface PublicTestToggleProps {
  locale: string
  initialValue: boolean
}

export default function PublicTestToggle({ locale, initialValue }: PublicTestToggleProps) {
  const [isEnabled, setIsEnabled] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleShowTestOnPublic(locale)
      if (result.success && result.showTestOnPublic !== undefined) {
        setIsEnabled(result.showTestOnPublic)
      }
    })
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${
      isEnabled
        ? 'border-red-300 bg-red-50'
        : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className={`font-bold ${isEnabled ? 'text-red-800' : 'text-gray-700'}`}>
            {locale === 'he' ? 'מצב בדיקה - דפים ציבוריים' : 'Тестовый режим - публичные страницы'}
          </h3>
          <p className={`text-sm ${isEnabled ? 'text-red-600' : 'text-gray-500'}`}>
            {isEnabled
              ? (locale === 'he'
                  ? '⚠️ עסקי בדיקה מוצגים לכולם!'
                  : '⚠️ Тестовые бизнесы видны всем!')
              : (locale === 'he'
                  ? 'עסקי בדיקה מוסתרים מדפים ציבוריים'
                  : 'Тестовые бизнесы скрыты от публики')
            }
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          dir="ltr"
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
            isEnabled ? 'bg-red-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              isEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
