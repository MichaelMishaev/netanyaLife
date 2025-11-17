/**
 * A/B Testing Utility
 * Simple client-side A/B test variant assignment and tracking
 */

export type Variant = 'control' | 'treatment'

interface VariantAssignment {
  variant: Variant
  assignedAt: string // ISO 8601 timestamp
}

/**
 * Get or assign A/B test variant for a given test name
 * Uses localStorage to persist assignment across sessions
 *
 * @param testName - Unique identifier for the test (e.g., 'search_form_design')
 * @param treatmentPercentage - Percentage of users to assign to treatment (0-100, default 50)
 * @returns 'control' or 'treatment'
 */
export function getVariant(
  testName: string,
  treatmentPercentage: number = 50
): Variant {
  if (typeof window === 'undefined') return 'control'

  const storageKey = `ab_test_${testName}`

  try {
    // Check if already assigned
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const assignment: VariantAssignment = JSON.parse(stored)
      return assignment.variant
    }

    // Assign new variant
    const random = Math.random() * 100
    const variant: Variant = random < treatmentPercentage ? 'treatment' : 'control'

    const assignment: VariantAssignment = {
      variant,
      assignedAt: new Date().toISOString(),
    }

    localStorage.setItem(storageKey, JSON.stringify(assignment))
    return variant
  } catch (error) {
    console.error('Error in A/B test assignment:', error)
    return 'control' // Default to control on error
  }
}

/**
 * Clear variant assignment (for testing purposes)
 */
export function clearVariant(testName: string): void {
  if (typeof window === 'undefined') return

  try {
    const storageKey = `ab_test_${testName}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing variant:', error)
  }
}

/**
 * Get all active A/B test assignments
 */
export function getAllVariants(): Record<string, Variant> {
  if (typeof window === 'undefined') return {}

  try {
    const variants: Record<string, Variant> = {}
    const prefix = 'ab_test_'

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        const testName = key.replace(prefix, '')
        const stored = localStorage.getItem(key)
        if (stored) {
          const assignment: VariantAssignment = JSON.parse(stored)
          variants[testName] = assignment.variant
        }
      }
    }

    return variants
  } catch (error) {
    console.error('Error getting all variants:', error)
    return {}
  }
}
