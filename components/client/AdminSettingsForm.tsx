'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { updateAdminSetting } from '@/lib/actions/admin'

interface AdminSettingsFormProps {
  locale: string
  initialTopPinnedCount: number
}

export default function AdminSettingsForm({
  locale,
  initialTopPinnedCount,
}: AdminSettingsFormProps) {
  const t = useTranslations('admin.settings')
  const [topPinnedCount, setTopPinnedCount] = useState(initialTopPinnedCount)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccess(false)

    await updateAdminSetting('top_pinned_count', String(topPinnedCount), locale)

    setIsSaving(false)
    setSuccess(true)

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="topPinnedCount"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('topPinnedCount')}
        </label>
        <input
          type="number"
          id="topPinnedCount"
          value={topPinnedCount}
          onChange={(e) => setTopPinnedCount(parseInt(e.target.value, 10))}
          min="0"
          max="20"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          {locale === 'he'
            ? 'מספר העסקים המוצמדים שיוצגו בראש תוצאות החיפוש (0-20)'
            : 'Количество закрепленных предприятий в верхней части результатов поиска (0-20)'}
        </p>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          {locale === 'he'
            ? 'ההגדרות נשמרו בהצלחה'
            : 'Настройки успешно сохранены'}
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? locale === 'he'
            ? 'שומר...'
            : 'Сохранение...'
          : locale === 'he'
            ? 'שמור שינויים'
            : 'Сохранить изменения'}
      </button>
    </form>
  )
}
