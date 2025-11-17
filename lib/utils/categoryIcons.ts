/**
 * Category Icon Mapping
 * Maps category slugs to emoji/icon for visual recognition
 */

export const CATEGORY_ICONS: Record<string, string> = {
  // Existing categories based on seed data
  'electricians': '⚡',
  'plumbers': '🚰',
  'locksmiths': '🔐',
  'painters': '🎨',
  'cleaners': '🧹',
  'movers': '📦',
  'gardeners': '🌿',
  'handyman': '🔧',
  'pest-control': '🐛',
  'appliance-repair': '🔌',
  'carpenters': '🪚',
  'roofers': '🏠',
  // Add more as needed
}

/**
 * Get icon for a category slug, returns empty string if not found
 */
export function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] || ''
}

/**
 * Check if category has an icon
 */
export function hasCategoryIcon(slug: string): boolean {
  return slug in CATEGORY_ICONS
}
