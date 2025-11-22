'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminMobileMenuProps {
  locale: string
  pendingBusinessCount: number
  pendingCategoryRequestCount: number
}

export default function AdminMobileMenu({ 
  locale, 
  pendingBusinessCount,
  pendingCategoryRequestCount 
}: AdminMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { 
      href: `/${locale}/admin`, 
      label: locale === 'he' ? 'ראשי' : 'Главная',
      badge: 0
    },
    {
      href: `/${locale}/admin/pending`,
      label: locale === 'he' ? 'ממתינים לאישור' : 'Ожидают одобрения',
      badge: pendingBusinessCount
    },
    {
      href: `/${locale}/admin/categories`,
      label: locale === 'he' ? 'קטגוריות' : 'Категории',
      badge: 0
    },
    {
      href: `/${locale}/admin/category-requests`,
      label: locale === 'he' ? 'בקשות קטגוריות' : 'Запросы категорий',
      badge: pendingCategoryRequestCount
    },
    {
      href: `/${locale}/admin/businesses`,
      label: locale === 'he' ? 'עסקים' : 'Предприятия',
      badge: 0
    },
    {
      href: `/${locale}/admin/business-map`,
      label: locale === 'he' ? 'מפת עסקים' : 'Карта бизнесов',
      badge: 0
    },
    {
      href: `/${locale}/admin/analytics`,
      label: locale === 'he' ? 'ניתוח נתונים' : 'Аналитика',
      badge: 0
    },
    {
      href: `/${locale}/admin/settings`,
      label: locale === 'he' ? 'הגדרות' : 'Настройки',
      badge: 0
    },
  ]

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex flex-col items-center justify-center gap-1.5 rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        aria-label={locale === 'he' ? 'תפריט ניווט' : 'Меню навигации'}
      >
        {/* Notification dot if there are pending items */}
        {(pendingBusinessCount > 0 || pendingCategoryRequestCount > 0) && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
        <span
          className={`h-0.5 w-6 bg-gray-700 transition-transform ${
            isOpen ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`h-0.5 w-6 bg-gray-700 transition-opacity ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`h-0.5 w-6 bg-gray-700 transition-transform ${
            isOpen ? '-translate-y-2 -rotate-45' : ''
          }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed ${locale === 'he' ? 'right-0' : 'left-0'} top-0 z-50 h-full w-64 transform bg-white shadow-xl transition-transform lg:hidden ${
          isOpen
            ? 'translate-x-0'
            : locale === 'he'
              ? 'translate-x-full'
              : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-bold text-gray-900">
            {locale === 'he' ? 'תפריט' : 'Меню'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label={locale === 'he' ? 'סגור תפריט' : 'Закрыть меню'}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`relative rounded-lg px-4 py-3 text-${locale === 'he' ? 'right' : 'left'} transition ${
                pathname === item.href
                  ? 'bg-primary-50 font-medium text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center justify-between">
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold text-white ${
                    item.href.includes('pending') ? 'bg-red-500' : 'bg-orange-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
