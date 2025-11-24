'use client'

import { useState, useRef, useEffect } from 'react'

interface BusinessPortalUserMenuProps {
  name: string
  email: string
  locale: string
}

export default function BusinessPortalUserMenu({
  name,
  email,
  locale,
}: BusinessPortalUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isRTL = locale === 'he'

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      {/* User Info Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-1.5 transition hover:bg-gray-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col text-start">
          <span className="text-sm font-medium text-gray-900">{name}</span>
          <span className="text-xs text-gray-500">
            {isRTL ? 'בעל עסק' : 'Владелец'}
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* User Details */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{name}</p>
                <p className="text-sm text-gray-500 truncate" dir="ltr">{email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <form action="/api/auth/owner/logout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>{isRTL ? 'התנתק' : 'Выйти'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
