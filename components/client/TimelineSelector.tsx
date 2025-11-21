'use client'

import { useState } from 'react'

export type TimeRange = '7d' | '30d' | '90d' | 'custom'

export interface TimelineSelectorProps {
  onChange: (range: TimeRange, startDate?: Date, endDate?: Date) => void
  locale: string
}

export default function TimelineSelector({ onChange, locale }: TimelineSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d')
  const [showCustom, setShowCustom] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const ranges: { value: TimeRange; label_he: string; label_ru: string }[] = [
    { value: '7d', label_he: '7 ימים אחרונים', label_ru: 'Последние 7 дней' },
    { value: '30d', label_he: '30 ימים אחרונים', label_ru: 'Последние 30 дней' },
    { value: '90d', label_he: '90 ימים אחרונים', label_ru: 'Последние 90 дней' },
    { value: 'custom', label_he: 'טווח מותאם', label_ru: 'Свой период' },
  ]

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range)

    if (range === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      const endDate = new Date()
      const startDate = new Date()

      if (range === '7d') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (range === '30d') {
        startDate.setDate(startDate.getDate() - 30)
      } else if (range === '90d') {
        startDate.setDate(startDate.getDate() - 90)
      }

      onChange(range, startDate, endDate)
    }
  }

  const handleCustomApply = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (start <= end) {
        onChange('custom', start, end)
        setShowCustom(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Range Buttons */}
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedRange === range.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'he' ? range.label_he : range.label_ru}
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      {showCustom && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">
              {locale === 'he' ? 'בחר טווח תאריכים' : 'Выберите период'}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {locale === 'he' ? 'מתאריך' : 'С'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {locale === 'he' ? 'עד תאריך' : 'До'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCustomApply}
              disabled={!startDate || !endDate}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locale === 'he' ? 'החל' : 'Применить'}
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {locale === 'he' ? 'ביטול' : 'Отмена'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
