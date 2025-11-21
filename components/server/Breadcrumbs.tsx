import Script from 'next/script'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  locale: string
}

export default function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  const isRTL = locale === 'he'
  const chevron = isRTL ? '→' : '←'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanyalocal.com'

  // Generate structured data for breadcrumbs
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  }

  return (
    <>
      {/* Breadcrumb Navigation - Hidden on mobile */}
      <nav aria-label="Breadcrumb" className="mb-4 hidden md:block">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {items.map((item, index) => (
            <li key={`breadcrumb-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-gray-400" aria-hidden="true">
                  {chevron}
                </span>
              )}
              {index === items.length - 1 ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="hover:text-primary-600 hover:underline"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        strategy="afterInteractive"
      />
    </>
  )
}
