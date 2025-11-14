'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface BusinessCardProps {
  business: {
    id: string
    name_he: string
    name_ru: string | null
    slug_he: string
    slug_ru: string | null
    description_he: string | null
    description_ru: string | null
    phone: string | null
    whatsapp_number: string | null
    is_verified: boolean
    is_pinned: boolean
    neighborhood: {
      name_he: string
      name_ru: string
    }
    reviews?: Array<{ rating: number }>
    avgRating?: number
    reviewCount?: number
  }
  locale: string
}

export default function BusinessCard({ business, locale }: BusinessCardProps) {
  const t = useTranslations('business')

  const name = locale === 'he' ? business.name_he : (business.name_ru || business.name_he)
  const description = locale === 'he' ? business.description_he : (business.description_ru || business.description_he)
  const neighborhoodName = locale === 'he' ? business.neighborhood.name_he : business.neighborhood.name_ru
  const slug = locale === 'he' ? business.slug_he : (business.slug_ru || business.slug_he)

  // Calculate average rating
  const reviews = business.reviews || []
  const avgRating = business.avgRating !== undefined
    ? business.avgRating
    : reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0
  const reviewCount = business.reviewCount !== undefined ? business.reviewCount : reviews.length

  return (
    <Link
      href={`/${locale}/business/${slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 transition hover:shadow-lg"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold">{name}</h3>
        {business.is_verified && (
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            {t('verified')}
          </span>
        )}
      </div>

      {/* Neighborhood */}
      <p className="mb-2 text-sm text-gray-600">{neighborhoodName}</p>

      {/* Description Preview */}
      {description && (
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {description.slice(0, 100)}
          {description.length > 100 && '...'}
        </p>
      )}

      {/* Rating */}
      {reviewCount > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-yellow-500">★</span>
            <span className="ms-1 font-medium">{avgRating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({reviewCount} {t('reviewsCount', { count: reviewCount })})
          </span>
        </div>
      )}

      {/* Contact */}
      <div className="flex gap-2">
        {business.phone && (
          <span className="rounded bg-gray-100 px-3 py-1 text-xs font-medium">
            {t('phone')}
          </span>
        )}
        {business.whatsapp_number && (
          <span className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            WhatsApp
          </span>
        )}
      </div>
    </Link>
  )
}
