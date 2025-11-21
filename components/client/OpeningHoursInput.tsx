'use client'

import { useState } from 'react'

interface DaySchedule {
  day: string
  dayAbbrev: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

interface OpeningHoursInputProps {
  value: string
  onChange: (value: string) => void
  locale: string
}

const HEBREW_DAYS = [
  { full: 'ראשון', abbrev: 'א׳', key: 'sun' },
  { full: 'שני', abbrev: 'ב׳', key: 'mon' },
  { full: 'שלישי', abbrev: 'ג׳', key: 'tue' },
  { full: 'רביעי', abbrev: 'ד׳', key: 'wed' },
  { full: 'חמישי', abbrev: 'ה׳', key: 'thu' },
  { full: 'שישי', abbrev: 'ו׳', key: 'fri' },
  { full: 'שבת', abbrev: 'ש׳', key: 'sat' },
]

const RUSSIAN_DAYS = [
  { full: 'Воскресенье', abbrev: 'Вс', key: 'sun' },
  { full: 'Понедельник', abbrev: 'Пн', key: 'mon' },
  { full: 'Вторник', abbrev: 'Вт', key: 'tue' },
  { full: 'Среда', abbrev: 'Ср', key: 'wed' },
  { full: 'Четверг', abbrev: 'Чт', key: 'thu' },
  { full: 'Пятница', abbrev: 'Пт', key: 'fri' },
  { full: 'Суббота', abbrev: 'Сб', key: 'sat' },
]

const TEMPLATES = {
  business: {
    he: 'שעות עסקים',
    ru: 'Бизнес-часы',
    schedule: {
      sun: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      mon: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      tue: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      wed: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      thu: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      fri: { isOpen: true, openTime: '08:00', closeTime: '14:00' },
      sat: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    },
  },
  retail: {
    he: 'קמעונאות',
    ru: 'Розничная торговля',
    schedule: {
      sun: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
      mon: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
      tue: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
      wed: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
      thu: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
      fri: { isOpen: true, openTime: '09:00', closeTime: '15:00' },
      sat: { isOpen: false, openTime: '09:00', closeTime: '21:00' },
    },
  },
  twentyFourSeven: {
    he: '24/7',
    ru: '24/7',
    schedule: {
      sun: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      mon: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      tue: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      wed: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      thu: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      fri: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      sat: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
    },
  },
}

export default function OpeningHoursInput({
  value,
  onChange,
  locale,
}: OpeningHoursInputProps) {
  const days = locale === 'he' ? HEBREW_DAYS : RUSSIAN_DAYS

  // Initialize from existing value or default
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    // Parse existing value if present
    if (value) {
      // Try to parse free-text format (fallback for existing data)
      // For now, default to business hours
      return Object.fromEntries(
        days.map((day) => [
          day.key,
          {
            day: day.full,
            dayAbbrev: day.abbrev,
            isOpen: day.key !== 'sat',
            openTime: '08:00',
            closeTime: day.key === 'fri' ? '14:00' : '17:00',
          },
        ])
      )
    }
    return Object.fromEntries(
      days.map((day) => [
        day.key,
        {
          day: day.full,
          dayAbbrev: day.abbrev,
          isOpen: false,
          openTime: '09:00',
          closeTime: '17:00',
        },
      ])
    )
  })

  // Convert schedule to string format
  const scheduleToString = (sched: Record<string, DaySchedule>) => {
    const entries = days
      .map((day) => {
        const s = sched[day.key]
        if (!s.isOpen) return `${day.abbrev}: ${locale === 'he' ? 'סגור' : 'Закрыто'}`
        return `${day.abbrev}: ${s.openTime}-${s.closeTime}`
      })
      .filter(Boolean)
    return entries.join(', ')
  }

  // Update parent component
  const updateSchedule = (newSchedule: Record<string, DaySchedule>) => {
    setSchedule(newSchedule)
    onChange(scheduleToString(newSchedule))
  }

  // Apply template
  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey]
    const newSchedule = Object.fromEntries(
      days.map((day) => [
        day.key,
        {
          day: day.full,
          dayAbbrev: day.abbrev,
          ...template.schedule[day.key as keyof typeof template.schedule],
        },
      ])
    )
    updateSchedule(newSchedule)
  }

  // Toggle day open/closed
  const toggleDay = (dayKey: string) => {
    updateSchedule({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        isOpen: !schedule[dayKey].isOpen,
      },
    })
  }

  // Update time
  const updateTime = (dayKey: string, field: 'openTime' | 'closeTime', value: string) => {
    updateSchedule({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        [field]: value,
      },
    })
  }

  // Copy hours to all open days
  const copyToAll = (sourceDayKey: string) => {
    const source = schedule[sourceDayKey]
    const newSchedule = { ...schedule }
    Object.keys(newSchedule).forEach((key) => {
      if (newSchedule[key].isOpen) {
        newSchedule[key].openTime = source.openTime
        newSchedule[key].closeTime = source.closeTime
      }
    })
    updateSchedule(newSchedule)
  }

  return (
    <div className="space-y-4">
      {/* Template Buttons */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">
          {locale === 'he' ? 'תבניות מהירות:' : 'Быстрые шаблоны:'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyTemplate('business')}
            className="rounded-lg border-2 border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 active:scale-95"
            aria-label={locale === 'he' ? 'החל שעות עסקים סטנדרטיות' : 'Применить стандартные бизнес-часы'}
          >
            🏢 {TEMPLATES.business[locale as 'he' | 'ru']}
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('retail')}
            className="rounded-lg border-2 border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 active:scale-95"
            aria-label={locale === 'he' ? 'החל שעות קמעונאות' : 'Применить часы розничной торговли'}
          >
            🛍️ {TEMPLATES.retail[locale as 'he' | 'ru']}
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('twentyFourSeven')}
            className="rounded-lg border-2 border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 active:scale-95"
            aria-label={locale === 'he' ? 'פתוח 24/7' : 'Открыто 24/7'}
          >
            ⚡ 24/7
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 md:p-4">
        {days.map((day) => {
          const dayData = schedule[day.key]
          return (
            <div
              key={day.key}
              className={`flex flex-col gap-3 rounded-lg border p-3 transition ${
                !dayData.isOpen ? 'border-gray-200 bg-gray-50' : 'border-primary-100 bg-white'
              }`}
            >
              {/* Day Header with Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dayData.isOpen}
                    onChange={() => toggleDay(day.key)}
                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                    aria-label={`${day.full} ${dayData.isOpen ? (locale === 'he' ? 'פתוח' : 'открыт') : (locale === 'he' ? 'סגור' : 'закрыт')}`}
                  />
                  <span className="text-sm font-semibold text-gray-900">{day.abbrev}</span>
                </div>
                {!dayData.isOpen && (
                  <span className="text-sm font-medium text-gray-400">
                    {locale === 'he' ? 'סגור' : 'Закрыто'}
                  </span>
                )}
              </div>

              {/* Time Inputs (only if open) */}
              {dayData.isOpen && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2" dir="ltr">
                    <input
                      type="time"
                      value={dayData.openTime}
                      onChange={(e) => updateTime(day.key, 'openTime', e.target.value)}
                      className="w-full max-w-[120px] rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                      aria-label={`${day.full} ${locale === 'he' ? 'שעת פתיחה' : 'время открытия'}`}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="time"
                      value={dayData.closeTime}
                      onChange={(e) => updateTime(day.key, 'closeTime', e.target.value)}
                      className="w-full max-w-[120px] rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                      aria-label={`${day.full} ${locale === 'he' ? 'שעת סגירה' : 'время закрытия'}`}
                    />
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyToAll(day.key)}
                    className="w-full rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200 active:scale-95 sm:w-auto"
                    aria-label={`${locale === 'he' ? 'העתק שעות לכל הימים' : 'Скопировать часы на все дни'}`}
                  >
                    📋 {locale === 'he' ? 'העתק לכל הימים' : 'Копировать на все'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Preview */}
      <div className="rounded-lg bg-blue-50 p-3 text-sm text-gray-700">
        <strong>{locale === 'he' ? 'תצוגה מקדימה:' : 'Предварительный просмотр:'}</strong>
        <p className="mt-1" dir={locale === 'he' ? 'rtl' : 'ltr'}>
          {scheduleToString(schedule) || (locale === 'he' ? 'טרם נבחרו שעות' : 'Часы не выбраны')}
        </p>
      </div>
    </div>
  )
}
