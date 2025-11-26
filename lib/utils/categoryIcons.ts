/**
 * Category Icon Mapping
 * Maps category slugs to emoji/icon for visual recognition
 */

export const CATEGORY_ICONS: Record<string, string> = {
  // Trade Services
  'electricians': '⚡',
  'plumbers': '🚰',
  'locksmiths': '🔐',
  'painters': '🎨',
  'cleaners': '🧹',
  'cleaning': '🧹',
  'movers': '📦',
  'gardeners': '🌿',
  'gardening': '🌿',
  'handyman': '🔧',
  'pest-control': '🐛',
  'appliance-repair': '🔌',
  'carpenters': '🪚',
  'roofers': '🏠',
  'ac-technicians': '❄️',
  'electricians-industrial': '⚙️',
  'sewing': '🧵',

  // Health & Medical
  'health-wellness': '🧘',
  'doctors': '⚕️',

  // Education & Learning
  'education-learning': '🎓',
  'tutors': '📚',

  // Consulting & Professional Services
  'financial-consulting': '💰',
  'digital-consulting': '💻',
  'lawyers': '⚖️',
  'business-services': '💼',
  'real-estate': '🏢',

  // Personal & Lifestyle
  'hair-beauty-cosmetics': '💇',
  'food-events-activities': '🎉',
  'transportation': '🚗',
  'home-services': '🏡',
  'personal-electronics': '📱',
  'environment-animals': '🐾',
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
