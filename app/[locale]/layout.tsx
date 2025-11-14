import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/request'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Netanya Local - נתניה לוקל',
  description:
    'מדריך עסקים מקומיים בנתניה - Local business directory for Netanya residents',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Get messages for the locale
  const messages = await getMessages()

  // Determine text direction
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
