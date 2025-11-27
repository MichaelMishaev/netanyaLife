import type { Metadata } from 'next'
import dynamicImport from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Assistant } from 'next/font/google'
import { locales } from '@/i18n/request'
import { ClientProviders } from '@/components/providers/ClientProviders'
import Header from '@/components/server/Header'
import Footer from '@/components/server/Footer'
import ConditionalHeader from '@/components/client/ConditionalHeader'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import '../globals.css'

// Load Assistant font (optimized for Hebrew - used by Zap.co.il)
const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Lazy load non-critical components
const AccessibilityPanel = dynamicImport(
  () => import('@/components/client/AccessibilityPanel'),
  { ssr: false }
)

const PWAInstaller = dynamicImport(
  () => import('@/components/client/PWAInstaller'),
  { ssr: false }
)

// Viewport configuration (Next.js 14+ standard - separate from metadata)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  title: 'קהילת נתניה',
  description:
    'מדריך עסקים מקומיים בנתניה - Local business directory for Netanya residents',
  metadataBase: new URL('https://netanya.business'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'קהילת נתניה',
    description: 'מדריך עסקים מקומיים בנתניה - Local business directory for Netanya residents',
    url: 'https://netanya.business',
    siteName: 'קהילת נתניה',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'קהילת נתניה',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'קהילת נתניה',
    description: 'מדריך עסקים מקומיים בנתניה - Local business directory for Netanya residents',
    images: ['/og-image.png'],
  },
}

// Force dynamic rendering for all pages (required for client contexts)
export const dynamic = 'force-dynamic'

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
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={assistant.className}
    >
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Theme & Mobile App Config */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="קהילת נתניה" />

        {/* Geo Meta Tags for Local SEO */}
        <meta name="geo.region" content="IL-HA" />
        <meta name="geo.placename" content="Netanya" />
        <meta name="geo.position" content="32.3215;34.8532" />
        <meta name="ICBM" content="32.3215, 34.8532" />

        {/* Performance: Preconnect & DNS Prefetch for External Resources */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        {/* Google Analytics */}
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <ClientProviders locale={locale}>
            {/* PWA Service Worker */}
            <PWAInstaller />

            {/* Skip Link - wrapped in ConditionalHeader to hide on admin/portal routes */}
            <ConditionalHeader>
              <a href="#main-content" className="skip-link">
                {locale === 'he' ? 'דלג לתוכן' : 'Перейти к содержимому'}
              </a>
            </ConditionalHeader>

            {/* Main Header - hidden on admin/portal routes */}
            <ConditionalHeader>
              <Header />
            </ConditionalHeader>

            {/* Main Content */}
            <main id="main-content" className="flex-1">
              {children}
            </main>

            {/* Footer - hidden on admin/portal routes */}
            <ConditionalHeader>
              <Footer />
            </ConditionalHeader>

            {/* Accessibility Panel - hidden on admin/portal routes */}
            <ConditionalHeader>
              <AccessibilityPanel />
            </ConditionalHeader>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
