import { getRequestConfig } from 'next-intl/server'

// Supported locales
export const locales = ['he', 'ru'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the request
  const locale = await requestLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Asia/Jerusalem',
    now: new Date(),
  }
})
