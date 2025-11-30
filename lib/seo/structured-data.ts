interface Business {
  id: string
  name_he: string | null
  name_ru: string | null
  description_he: string | null
  description_ru: string | null
  address_he: string | null
  address_ru: string | null
  phone: string | null
  whatsapp_number: string | null
  website_url: string | null
  email: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  opening_hours_he: string | null
  opening_hours_ru: string | null
  latitude: { toString(): string } | null
  longitude: { toString(): string } | null
  category: {
    name_he: string
    name_ru: string
  }
  neighborhood: {
    name_he: string
    name_ru: string
  }
  image_url?: string | null
  price_range?: string | null
}

interface AggregateRating {
  average: number
  count: number
}

interface Review {
  id: string
  rating: number
  comment_he: string | null
  comment_ru: string | null
  author_name: string | null
  created_at: Date
  language: string
}

interface BreadcrumbItem {
  label: string
  href: string
}

/**
 * Generate LocalBusiness structured data for SEO
 * 2025 Standard - Includes all critical fields
 */
export function generateLocalBusinessSchema(
  business: Business,
  rating: AggregateRating | null,
  locale: string,
  url: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanya.business'

  const name =
    locale === 'he'
      ? business.name_he || business.name_ru
      : business.name_ru || business.name_he

  const description =
    locale === 'he'
      ? business.description_he || business.description_ru
      : business.description_ru || business.description_he

  const address =
    locale === 'he'
      ? business.address_he || business.address_ru
      : business.address_ru || business.address_he

  const openingHours =
    locale === 'he'
      ? business.opening_hours_he || business.opening_hours_ru
      : business.opening_hours_ru || business.opening_hours_he

  const categoryName =
    locale === 'he'
      ? business.category.name_he
      : business.category.name_ru

  // Build sameAs array with all social media URLs
  const sameAsUrls: string[] = []
  if (business.website_url) {
    const websiteUrl = business.website_url.startsWith('http')
      ? business.website_url
      : `https://${business.website_url}`
    sameAsUrls.push(websiteUrl)
  }
  if (business.instagram_url) {
    const instagramUrl = business.instagram_url.startsWith('http')
      ? business.instagram_url
      : `https://${business.instagram_url}`
    sameAsUrls.push(instagramUrl)
  }
  if (business.facebook_url) {
    const facebookUrl = business.facebook_url.startsWith('http')
      ? business.facebook_url
      : `https://${business.facebook_url}`
    sameAsUrls.push(facebookUrl)
  }
  if (business.tiktok_url) {
    const tiktokUrl = business.tiktok_url.startsWith('http')
      ? business.tiktok_url
      : `https://${business.tiktok_url}`
    sameAsUrls.push(tiktokUrl)
  }

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}#business`,
    name,
    url,
    ...(business.image_url && { image: business.image_url }),
    ...(description && { description }),
    ...(business.phone && { telephone: business.phone }),
    ...(business.email && { email: business.email }),
    ...(sameAsUrls.length > 0 && { sameAs: sameAsUrls }),
    ...(business.price_range && { priceRange: business.price_range }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'נתניה',
        addressCountry: 'IL',
        streetAddress: address,
      },
    }),
    ...(openingHours && { openingHours }),
    // Area served
    areaServed: {
      '@type': 'City',
      name: 'Netanya',
      containedIn: {
        '@type': 'Country',
        name: 'Israel',
      },
    },
    // Languages supported
    inLanguage: ['he', 'ru'],
    // Service type
    ...(categoryName && { knowsAbout: categoryName }),
    // Add GeoCoordinates for Google Maps integration
    ...(business.latitude && business.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.latitude.toString(),
        longitude: business.longitude.toString(),
      },
    }),
  }

  // Add aggregate rating if available
  if (rating && rating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.average.toFixed(1),
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}

/**
 * Generate Review structured data for individual reviews
 * 2025 Standard
 */
export function generateReviewSchema(
  review: Review,
  businessName: string,
  locale: string
): object {
  const comment =
    locale === 'he'
      ? review.comment_he || review.comment_ru || ''
      : review.comment_ru || review.comment_he || ''

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `#review-${review.id}`,
    itemReviewed: {
      '@type': 'LocalBusiness',
      name: businessName,
    },
    author: {
      '@type': 'Person',
      name: review.author_name || (locale === 'he' ? 'אנונימי' : 'Аноним'),
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    ...(comment && { reviewBody: comment }),
    datePublished: review.created_at.toISOString(),
    inLanguage: review.language === 'he' ? 'he' : 'ru',
  }
}

/**
 * Generate BreadcrumbList structured data
 * 2025 Standard - Required for rich results
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  baseUrl: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  }
}

/**
 * Generate Organization schema for homepage
 * 2025 Standard - For Google Knowledge Panel
 */
export function generateOrganizationSchema(
  baseUrl: string,
  locale: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'קהילת נתניה',
    alternateName: locale === 'he' ? 'Netanya Community' : 'Сообщество Нетании',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      locale === 'he'
        ? 'מדריך עסקים מקומיים בנתניה - חיפוש לפי שכונות וקטגוריות'
        : 'Местный бизнес-справочник Нетании - Поиск по районам и категориям',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Netanya',
      addressCountry: 'IL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'IL',
      availableLanguage: ['Hebrew', 'Russian'],
    },
    sameAs: [],
  }
}

/**
 * Generate WebSite schema with SearchAction
 * 2025 Standard - Enables sitelinks search box in Google
 */
export function generateWebSiteSchema(baseUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: 'קהילת נתניה',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/he/search/{category_slug}/{neighborhood_slug}`,
      },
      'query-input': 'required name=category_slug',
    },
    inLanguage: ['he', 'ru'],
  }
}

/**
 * Generate CollectionPage schema for search results pages
 * 2025 Standard
 */
export function generateCollectionPageSchema(
  categoryName: string,
  neighborhoodName: string,
  description: string,
  url: string,
  totalCount: number,
  breadcrumbSchema: object
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collectionpage`,
    name: `${categoryName} ב${neighborhoodName}`,
    description,
    url,
    numberOfItems: totalCount,
    breadcrumb: breadcrumbSchema,
  }
}
