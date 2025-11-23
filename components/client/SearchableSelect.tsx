'use client'

import { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'

interface Option {
  value: string
  label: string
  icon?: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  label?: React.ReactNode
  required?: boolean
  className?: string
  error?: boolean
  icon?: React.ReactNode
  dir?: 'ltr' | 'rtl'
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  label,
  required = false,
  className = '',
  error = false,
  icon,
  dir = 'ltr',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isUnmountingRef = useRef(false)

  // Ensure proper hydration - only render custom UI after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUnmountingRef.current) return
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      // Small delay to prevent immediate close on open
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current && !isUnmountingRef.current) {
      requestAnimationFrame(() => {
        if (!isUnmountingRef.current) {
          searchInputRef.current?.focus()
        }
      })
    }
  }, [isOpen])

  // Reset unmounting flag on mount and set it on unmount
  useEffect(() => {
    isUnmountingRef.current = false
    return () => {
      isUnmountingRef.current = true
      setIsOpen(false)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const handleSelect = (optionValue: string) => {
    if (isUnmountingRef.current) return

    // Use flushSync to ensure all state updates complete synchronously
    // This prevents the dropdown from being in an inconsistent state during navigation
    flushSync(() => {
      setIsOpen(false)
      setSearchQuery('')
    })

    // Call onChange synchronously after dropdown is closed
    onChange(optionValue)
  }

  const handleToggle = () => {
    if (isUnmountingRef.current) return
    setIsOpen(!isOpen)
  }

  // SSR/Initial render: Show a styled placeholder that matches the final UI
  // This prevents hydration mismatch and flash of unstyled content
  if (!isMounted) {
    return (
      <div className="relative w-full" dir={dir}>
        {label && (
          <div className="mb-2 text-base font-semibold text-gray-900">
            {label}
          </div>
        )}
        <div
          className={`relative w-full rounded-lg border bg-white py-3 text-start text-base border-gray-300 ${
            dir === 'rtl'
              ? icon ? 'pe-10 ps-12' : 'pe-4 ps-12'
              : icon ? 'pe-12 ps-10' : 'pe-12 ps-4'
          } ${className}`}
        >
          {icon && (
            <div className={`pointer-events-none absolute inset-y-0 flex items-center ${dir === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
              {icon}
            </div>
          )}
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? (
              <>
                {selectedOption.icon && <span className="me-2">{selectedOption.icon}</span>}
                {selectedOption.label}
              </>
            ) : (
              placeholder
            )}
          </span>
          <div className={`pointer-events-none absolute inset-y-0 flex items-center ${dir === 'rtl' ? 'start-0 ps-3' : 'end-0 pe-3'}`}>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full" dir={dir}>
      {/* Label */}
      {label && (
        <div className="mb-2 text-base font-semibold text-gray-900">
          {label}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative w-full rounded-lg border bg-white py-3 text-start text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          dir === 'rtl'
            ? icon ? 'pe-10 ps-12' : 'pe-4 ps-12'
            : icon ? 'pe-12 ps-10' : 'pe-12 ps-4'
        } ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 hover:border-primary-400 hover:shadow-md focus:border-primary-500'
        } ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Icon (on the side opposite to arrow) */}
        {icon && (
          <div className={`pointer-events-none absolute inset-y-0 flex items-center ${dir === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
            {icon}
          </div>
        )}

        {/* Selected value or placeholder */}
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="me-2">{selectedOption.icon}</span>}
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </span>

        {/* Dropdown arrow - always on left for RTL, right for LTR */}
        <div className={`pointer-events-none absolute inset-y-0 flex items-center ${dir === 'rtl' ? 'start-0 ps-3' : 'end-0 pe-3'}`}>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isUnmountingRef.current && (
        <div
          className="absolute top-full z-50 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg"
          role="listbox"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="border-b border-gray-200 p-3">
            <div className="relative">
              <div className={`pointer-events-none absolute inset-y-0 flex items-center ${dir === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full rounded-md border border-gray-300 bg-gray-50 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                  dir === 'rtl' ? 'pe-9 ps-3' : 'pe-3 ps-9'
                }`}
                dir={dir}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full rounded-md px-3 py-2.5 text-start text-sm transition-colors hover:bg-primary-50 focus:bg-primary-50 focus:outline-none ${
                    option.value === value
                      ? 'bg-primary-100 font-medium text-primary-900'
                      : 'text-gray-900'
                  }`}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.icon && <span className="me-2">{option.icon}</span>}
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
