'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavLink {
  href: string
  label: string
  icon: string
}

interface BusinessPortalMobileMenuProps {
  locale: string
  userName: string
  navLinks: NavLink[]
}

export default function BusinessPortalMobileMenu({
  locale,
  userName,
  navLinks,
}: BusinessPortalMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isRTL = locale === 'he'

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
        aria-label={isRTL ? 'פתח תפריט' : 'Открыть меню'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className={`fixed top-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-xl ${isRTL ? 'right-0' : 'left-0'}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'בעל עסק' : 'Владелец бизнеса'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label={isRTL ? 'סגור תפריט' : 'Закрыть меню'}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4">
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {isRTL ? 'ניהול' : 'Управление'}
                </p>
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 transition hover:bg-gray-100"
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {isRTL ? 'אתר' : 'Сайт'}
                </p>
                <Link
                  href={`/${locale}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 transition hover:bg-gray-100"
                >
                  <span className="text-lg">🏠</span>
                  <span className="font-medium">
                    {isRTL ? 'עמוד הבית' : 'Главная страница'}
                  </span>
                </Link>
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 border-t bg-gray-50 p-4">
              <form action="/api/auth/owner/logout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{isRTL ? 'התנתק' : 'Выйти'}</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
