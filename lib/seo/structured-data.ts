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
}

interface AggregateRating {
  average: number
  count: number
}

export function generateLocalBusinessSchema(
  business: Business,
  rating: AggregateRating | null,
  locale: string,
  url: string
) {
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

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    url,
    ...(description && { description }),
    ...(business.phone && { telephone: business.phone }),
    ...(business.email && { email: business.email }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'נתניה',
        addressCountry: 'IL',
        streetAddress: address,
      },
    }),
    ...(openingHours && { openingHours }),
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
      ratingValue: rating.average,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}
