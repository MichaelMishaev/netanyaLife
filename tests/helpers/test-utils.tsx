import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Custom render function that wraps components with providers
 * This will be expanded in later phases with i18n, context providers, etc.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
