'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface RecentlyViewedBusiness {
  id: string
  slug: string
  name_he: string
  name_ru: string | null
  category_slug: string
  category_name_he: string
  category_name_ru: string
  neighborhood_slug: string
  neighborhood_name_he: string
  neighborhood_name_ru: string
  viewedAt: string
}

interface RecentlyViewedContextType {
  recentlyViewed: RecentlyViewedBusiness[]
  addToRecentlyViewed: (business: Omit<RecentlyViewedBusiness, 'viewedAt'>) => void
  clearRecentlyViewed: () => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(
  undefined
)

const STORAGE_KEY = 'netanya_recently_viewed'
const MAX_ITEMS = 10

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedBusiness[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setRecentlyViewed(parsed)
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever recentlyViewed changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed))
      } catch (error) {
        console.error('Failed to save recently viewed:', error)
      }
    }
  }, [recentlyViewed, isHydrated])

  const addToRecentlyViewed = (business: Omit<RecentlyViewedBusiness, 'viewedAt'>) => {
    setRecentlyViewed((prev) => {
      // Remove existing entry for this business if it exists
      const filtered = prev.filter((item) => item.id !== business.id)

      // Add new entry at the beginning
      const newList = [
        {
          ...business,
          viewedAt: new Date().toISOString(),
        },
        ...filtered,
      ]

      // Keep only the last MAX_ITEMS
      return newList.slice(0, MAX_ITEMS)
    })
  }

  const clearRecentlyViewed = () => {
    setRecentlyViewed([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear recently viewed:', error)
    }
  }

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext)
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider')
  }
  return context
}
