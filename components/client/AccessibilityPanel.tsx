'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { useAnalytics } from '@/contexts/AnalyticsContext'

export default function AccessibilityPanel() {
  const t = useTranslations('accessibility')
  const { trackEvent } = useAnalytics()
  const [isOpen, setIsOpen] = useState(false)
  const {
    fontSize,
    highContrast,
    underlineLinks,
    setFontSize,
    toggleHighContrast,
    toggleUnderlineLinks,
  } = useAccessibility()

  const handleOpen = () => {
    setIsOpen(true)
    trackEvent('accessibility_opened')
  }

  const handleFontSizeChange = (size: 'normal' | 'medium' | 'large') => {
    setFontSize(size)
    trackEvent('accessibility_font_changed', { size })
  }

  const handleContrastToggle = () => {
    toggleHighContrast()
    trackEvent('accessibility_contrast_toggled', { enabled: !highContrast })
  }

  const handleUnderlineToggle = () => {
    toggleUnderlineLinks()
  }

  return (
    <>
      {/* Toggle Button - Fixed bottom-right (always right side regardless of RTL/LTR) */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2 md:bottom-8"
        aria-label={t('title')}
        aria-expanded={isOpen}
      >
        <span className="text-2xl" role="img" aria-hidden="true">
          ♿
        </span>
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel Content */}
          <div
            className="fixed bottom-40 right-6 z-50 w-80 max-h-[calc(100vh-12rem)] overflow-y-auto rounded-lg border bg-white p-6 shadow-2xl md:bottom-24"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-title"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 id="accessibility-title" className="text-xl font-bold">
                {t('title')}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={t('close')}
              >
                ✕
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                {t('fontSize')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFontSizeChange('normal')}
                  className={`flex-1 rounded-lg border px-4 py-2 transition ${
                    fontSize === 'normal'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={fontSize === 'normal'}
                >
                  {t('fontSizes.normal')}
                </button>
                <button
                  onClick={() => handleFontSizeChange('medium')}
                  className={`flex-1 rounded-lg border px-4 py-2 transition ${
                    fontSize === 'medium'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={fontSize === 'medium'}
                >
                  {t('fontSizes.medium')}
                </button>
                <button
                  onClick={() => handleFontSizeChange('large')}
                  className={`flex-1 rounded-lg border px-4 py-2 transition ${
                    fontSize === 'large'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={fontSize === 'large'}
                >
                  {t('fontSizes.large')}
                </button>
              </div>
            </div>

            {/* High Contrast */}
            <div className="mb-4">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="font-medium text-gray-700">
                  {t('contrast')}
                </span>
                <button
                  onClick={handleContrastToggle}
                  role="switch"
                  aria-checked={highContrast}
                  className={`relative h-6 w-11 rounded-full transition ${
                    highContrast ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                      highContrast ? 'end-0.5' : 'start-0.5'
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Underline Links */}
            <div className="mb-4">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="font-medium text-gray-700">
                  {t('underlineLinks')}
                </span>
                <button
                  onClick={toggleUnderlineLinks}
                  role="switch"
                  aria-checked={underlineLinks}
                  className={`relative h-6 w-11 rounded-full transition ${
                    underlineLinks ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                      underlineLinks ? 'end-0.5' : 'start-0.5'
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Keyboard Navigation Info */}
            <div className="mt-6 rounded-lg bg-blue-50 p-3 text-sm text-gray-700">
              <p className="font-medium">{t('keyboardNav')}</p>
              <p className="mt-1 text-gray-600">
                Tab - ניווט קדימה • Shift+Tab - ניווט אחורה
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
