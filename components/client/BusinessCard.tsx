'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatPhoneForWhatsApp } from '@/lib/utils/phone'
import { useAnalytics } from '@/contexts/AnalyticsContext'

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
    is_test: boolean
    serves_all_city: boolean
    neighborhood: {
      name_he: string
      name_ru: string
    }
    subcategory?: {
      name_he: string
      name_ru: string
      slug: string
    } | null
    reviews?: Array<{ rating: number }>
    avgRating?: number
    reviewCount?: number
  }
  locale: string
  showSubcategory?: boolean
  showNeighborhoodBadge?: boolean
}

export default function BusinessCard({ business, locale, showSubcategory = false, showNeighborhoodBadge = false }: BusinessCardProps) {
  const t = useTranslations('business')
  const tResults = useTranslations('results')
  const { trackEvent } = useAnalytics()

  const name = locale === 'he' ? business.name_he : (business.name_ru || business.name_he)
  const description = locale === 'he' ? business.description_he : (business.description_ru || business.description_he)
  const neighborhoodName = locale === 'he' ? business.neighborhood.name_he : business.neighborhood.name_ru
  const subcategoryName = business.subcategory
    ? (locale === 'he' ? business.subcategory.name_he : business.subcategory.name_ru)
    : null
  const slug = locale === 'he' ? business.slug_he : (business.slug_ru || business.slug_he)

  // Calculate average rating
  const reviews = business.reviews || []
  const avgRating = business.avgRating !== undefined
    ? business.avgRating
    : reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0
  const reviewCount = business.reviewCount !== undefined ? business.reviewCount : reviews.length

  // 5-star visualization
  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(avgRating)
    const hasHalfStar = avgRating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-500">★</span>)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-500">★</span>)
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>)
      }
    }
    return stars
  }

  // Accent color based on pinned status
  const accentColor = business.is_pinned
    ? 'from-yellow-400 to-yellow-600'
    : 'from-primary-500 to-primary-600'

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Test Badge - Top Left */}
      {business.is_test && (
        <div className="absolute left-0 top-0 z-10">
          <div className="flex items-center gap-1 rounded-br-lg bg-gradient-to-r from-orange-400 to-orange-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
            <span>🧪</span>
            <span>{locale === 'he' ? 'בדיקה' : 'Тест'}</span>
          </div>
        </div>
      )}

      {/* Pinned/Featured Badge - Top Right */}
      {business.is_pinned && (
        <div className="absolute right-0 top-0 z-10">
          <div className="flex items-center gap-1 rounded-bl-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-2 py-1 text-xs font-semibold text-yellow-900">
            <span>⭐</span>
            <span>{locale === 'he' ? 'מומלץ' : 'Рекомендуем'}</span>
          </div>
        </div>
      )}

      {/* Left Accent Bar */}
      <div className={`h-full w-1 flex-shrink-0 bg-gradient-to-b ${accentColor} absolute left-0 top-0`} />

      {/* Clickable Card Content */}
      <Link href={`/${locale}/business/${slug}`} className={`block flex-grow p-3 pe-3 ps-4 md:p-4 md:ps-5 ${business.is_pinned || business.is_test ? 'pt-10 md:pt-12' : ''}`}>
        {/* Header Row */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="flex-1 text-sm font-semibold text-gray-900 md:text-base">
            {name}
          </h3>
          {business.is_verified && (
            <span
              className="relative inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-green-500/40 ring-2 ring-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-500/60 sm:px-3 sm:py-2 sm:text-sm"
              role="status"
              aria-label={locale === 'he' ? 'עסק מאומת על ידי המערכת' : 'Бизнес проверен системой'}
            >
              {/* Animated glow effect */}
              <span className="absolute inset-0 rounded-full bg-green-400/30 blur-md animate-pulse" />
              
              {/* Shield with checkmark icon - Twitter/X style */}
              <svg
                className="relative z-10 h-4 w-4 drop-shadow-lg sm:h-5 sm:w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l5.88-5.88 1.41 1.41L11 16.59z"/>
              </svg>
              <span className="relative z-10 hidden font-extrabold tracking-wide sm:inline">
                {locale === 'he' ? 'מאומת' : 'Проверено'}
              </span>
            </span>
          )}
        </div>

        {/* Location & Serves All City - Enhanced when showNeighborhoodBadge is true */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {showNeighborhoodBadge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 px-2.5 py-1 text-xs font-bold text-blue-800 ring-2 ring-blue-300">
              <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{neighborhoodName}</span>
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{neighborhoodName}</span>
            </div>
          )}
          {business.serves_all_city && (
            <>
              <span className="text-gray-400">•</span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                {tResults('servesAllCity')}
              </span>
            </>
          )}
        </div>

        {/* Subcategory Badge - MORE PROMINENT when showSubcategory is true */}
        {subcategoryName && (
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              showSubcategory
                ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 ring-2 ring-purple-300'
                : 'bg-gray-100 text-gray-700'
            }`}>
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {showSubcategory && (
                <span className="font-extrabold">
                  {locale === 'he' ? 'סוג:' : 'Тип:'}
                </span>
              )}
              <span className={showSubcategory ? 'font-bold' : ''}>{subcategoryName}</span>
            </span>
          </div>
        )}

        {/* Rating - 5 Stars */}
        {reviewCount > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-sm">
              {renderStars()}
            </div>
            <span className="text-xs font-medium text-gray-900">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Description Preview - Hidden on mobile to save space */}
        {description && (
          <p className="mb-3 hidden text-sm text-gray-600 line-clamp-2 md:block">
            {description}
          </p>
        )}
      </Link>

      {/* Quick Action Buttons - Bottom */}
      <div className="border-t border-gray-100 p-2 md:p-3">
        <div className="grid grid-cols-2 gap-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              onClick={(e) => {
                e.stopPropagation()
                trackEvent('cta_clicked', {
                  type: 'call',
                  businessId: business.id,
                  businessName: name,
                })
              }}
              className="flex items-center justify-center gap-1.5 rounded-md bg-primary-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 active:scale-95 md:text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>{t('phone')}</span>
            </a>
          )}
          {business.whatsapp_number && (
            <a
              href={`https://wa.me/${formatPhoneForWhatsApp(business.whatsapp_number)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation()
                trackEvent('cta_clicked', {
                  type: 'whatsapp',
                  businessId: business.id,
                  businessName: name,
                })
              }}
              className="flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700 active:scale-95 md:text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
