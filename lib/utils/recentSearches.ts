/**
 * Recent Searches Utility
 * Manages localStorage for user search history
 * Max 5 items, 30-day expiry
 */

export interface RecentSearch {
  categorySlug: string
  categoryName_he: string
  categoryName_ru: string
  subcategorySlug?: string
  subcategoryName_he?: string
  subcategoryName_ru?: string
  neighborhoodSlug: string
  neighborhoodName_he: string
  neighborhoodName_ru: string
  timestamp: string // ISO 8601 format
}

const STORAGE_KEY = 'netanya_recent_searches'
const MAX_ITEMS = 5
const EXPIRY_DAYS = 30

/**
 * Get all recent searches (filtered by expiry, sorted by recency)
 */
export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const searches: RecentSearch[] = JSON.parse(stored)

    // Filter out expired items (older than 30 days)
    const now = new Date().getTime()
    const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000

    const valid = searches.filter((search) => {
      const searchTime = new Date(search.timestamp).getTime()
      return now - searchTime < expiryMs
    })

    // If we filtered any, update storage
    if (valid.length !== searches.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid))
    }

    return valid
  } catch (error) {
    console.error('Error reading recent searches:', error)
    return []
  }
}

/**
 * Save a new search (adds to front, removes duplicates, limits to MAX_ITEMS)
 */
export function saveRecentSearch(search: RecentSearch): void {
  if (typeof window === 'undefined') return

  try {
    const existing = getRecentSearches()

    // Remove duplicate if exists (same category + neighborhood + subcategory)
    const filtered = existing.filter((item) => {
      const sameCategory = item.categorySlug === search.categorySlug
      const sameNeighborhood = item.neighborhoodSlug === search.neighborhoodSlug
      const sameSubcategory = item.subcategorySlug === search.subcategorySlug
      return !(sameCategory && sameNeighborhood && sameSubcategory)
    })

    // Add new search to front
    const updated = [search, ...filtered]

    // Limit to MAX_ITEMS
    const limited = updated.slice(0, MAX_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
  } catch (error) {
    console.error('Error saving recent search:', error)
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing recent searches:', error)
  }
}

/**
 * Format recent search for display (e.g., "חשמלאים בצפון")
 */
export function formatRecentSearch(
  search: RecentSearch,
  locale: 'he' | 'ru'
): string {
  const categoryName = locale === 'he' ? search.categoryName_he : search.categoryName_ru
  const subcategoryName = search.subcategorySlug
    ? locale === 'he'
      ? search.subcategoryName_he
      : search.subcategoryName_ru
    : null
  const neighborhoodName =
    locale === 'he' ? search.neighborhoodName_he : search.neighborhoodName_ru

  // All Netanya (no specific neighborhood)
  if (search.neighborhoodSlug === 'all') {
    const allText = locale === 'he' ? 'בכל נתניה' : 'Во всей Нетании'
    return subcategoryName
      ? `${subcategoryName} ${allText}`
      : `${categoryName} ${allText}`
  }

  // Specific neighborhood
  const inText = locale === 'he' ? 'ב' : 'в '
  return subcategoryName
    ? `${subcategoryName} ${inText}${neighborhoodName}`
    : `${categoryName} ${inText}${neighborhoodName}`
}
