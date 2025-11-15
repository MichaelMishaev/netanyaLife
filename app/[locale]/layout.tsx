import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/request'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import Header from '@/components/server/Header'
import Footer from '@/components/server/Footer'
import '../globals.css'

// Lazy load non-critical components
const AccessibilityPanel = dynamic(
  () => import('@/components/client/AccessibilityPanel'),
  { ssr: false }
)

const PWAInstaller = dynamic(
  () => import('@/components/client/PWAInstaller'),
  { ssr: false }
)

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
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="Netanya Local" />
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AnalyticsProvider>
            <AccessibilityProvider>
              {/* PWA Service Worker */}
              <PWAInstaller />

              {/* Skip Link */}
              <a href="#main-content" className="skip-link">
                {locale === 'he' ? 'דלג לתוכן' : 'Перейти к содержимому'}
              </a>

              <Header />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />

              {/* Accessibility Panel */}
              <AccessibilityPanel />
            </AccessibilityProvider>
          </AnalyticsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
