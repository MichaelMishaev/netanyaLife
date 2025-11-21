'use client'

import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
  icon?: string
}

interface SimpleSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: React.ReactNode
  required?: boolean
  className?: string
  error?: boolean
  icon?: React.ReactNode
  dir?: 'ltr' | 'rtl'
  helperText?: string
}

export default function SimpleSelect({
  options,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  className = '',
  error = false,
  icon,
  dir = 'ltr',
  helperText,
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full" dir={dir}>
      {/* Label */}
      {label && (
        <div className="mb-2 text-base font-semibold text-gray-900">
          {label}
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="mb-3 text-sm text-gray-600">
          {helperText}
        </p>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
        onKeyDown={handleKeyDown}
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
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg"
          role="listbox"
        >
          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full rounded-md px-3 py-2.5 text-start text-base transition-colors hover:bg-primary-50 focus:bg-primary-50 focus:outline-none ${
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
