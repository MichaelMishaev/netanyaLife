'use client'

import Script from 'next/script'

export default function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // Validate GA_MEASUREMENT_ID format (must start with G- or GT-)
  const isValidGAId = GA_MEASUREMENT_ID && /^(G|GT)-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)

  // Only load GA in production with valid measurement ID
  if (!isValidGAId || process.env.NODE_ENV !== 'production') {
    if (process.env.NODE_ENV === 'production' && !isValidGAId) {
      console.warn('[GA] Invalid or missing NEXT_PUBLIC_GA_MEASUREMENT_ID:', GA_MEASUREMENT_ID)
    }
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
