'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type FontSize = 'normal' | 'medium' | 'large'

interface AccessibilitySettings {
  fontSize: FontSize
  highContrast: boolean
  underlineLinks: boolean
}

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void
  toggleHighContrast: () => void
  toggleUnderlineLinks: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
)

const STORAGE_KEY = 'netanya-local-accessibility'

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    underlineLinks: false,
  })

  // Set mounted state and load settings from localStorage
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load accessibility settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage and apply to DOM (only after mount)
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))

    // Apply settings to document
    const root = document.documentElement

    // Font size
    if (settings.fontSize === 'medium') {
      root.style.fontSize = '18px'
    } else if (settings.fontSize === 'large') {
      root.style.fontSize = '20px'
    } else {
      root.style.fontSize = '16px'
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Underline links
    if (settings.underlineLinks) {
      root.classList.add('underline-links')
    } else {
      root.classList.remove('underline-links')
    }
  }, [mounted, settings])

  const setFontSize = (size: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize: size }))
  }

  const toggleHighContrast = () => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }))
  }

  const toggleUnderlineLinks = () => {
    setSettings((prev) => ({ ...prev, underlineLinks: !prev.underlineLinks }))
  }

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        setFontSize,
        toggleHighContrast,
        toggleUnderlineLinks,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error(
      'useAccessibility must be used within AccessibilityProvider'
    )
  }
  return context
}
