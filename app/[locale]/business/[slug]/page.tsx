import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Metadata } from 'next'
import { getBusinessBySlug } from '@/lib/queries/businesses'
import ShareButton from '@/components/client/ShareButton'
import Breadcrumbs from '@/components/server/Breadcrumbs'
import BusinessViewTracker from '@/components/client/BusinessViewTracker'
import BackButton from '@/components/client/BackButton'
import { generateLocalBusinessSchema, generateBreadcrumbSchema, generateReviewSchema } from '@/lib/seo/structured-data'
import CTAButtons from '@/components/client/CTAButtons'

interface BusinessDetailPageProps {
  params: {
    locale: string
    slug: string
  }
}

export async function generateMetadata({
  params: { locale, slug },
}: BusinessDetailPageProps): Promise<Metadata> {
  const business = await getBusinessBySlug(slug, locale)

  if (!business) {
    return {
      title: 'Business Not Found',
    }
  }

  const name = locale === 'he' ? business.name_he : (business.name_ru || business.name_he)
  const description = locale === 'he'
    ? business.description_he
    : (business.description_ru || business.description_he)
  const categoryName = business.category
    ? (locale === 'he' ? business.category.name_he : business.category.name_ru)
    : (locale === 'he' ? 'שירותים' : 'Услуги')
  const neighborhoodName = locale === 'he' ? business.neighborhood.name_he : business.neighborhood.name_ru

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanyalocal.com'
  const url = `${baseUrl}/${locale}/business/${slug}`

  // Calculate average rating
  const ratings = business.reviews.map((r) => r.rating)
  const avgRating = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0

  const title = locale === 'he'
    ? `${name} - ${categoryName} ב${neighborhoodName}, נתניה`
    : `${name} - ${categoryName} в ${neighborhoodName}, Нетания`

  const metaDescription = description
    ? description.substring(0, 160)
    : locale === 'he'
      ? `${categoryName} באיכות גבוהה ב${neighborhoodName}, נתניה. ${ratings.length} ביקורות${avgRating > 0 ? `, דירוג ממוצע ${avgRating.toFixed(1)}` : ''}.`
      : `Качественный ${categoryName} в ${neighborhoodName}, Нетания. ${ratings.length} отзывов${avgRating > 0 ? `, средний рейтинг ${avgRating.toFixed(1)}` : ''}.`

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: url,
      languages: {
        he: `${baseUrl}/he/business/${slug}`,
        ru: `${baseUrl}/ru/business/${slug}`,
        'x-default': `${baseUrl}/he/business/${slug}`,
      },
    },
    openGraph: {
      title,
      description: metaDescription,
      url,
      siteName: locale === 'he' ? 'קהילת נתניה' : 'Сообщество Нетании',
      locale: locale === 'he' ? 'he_IL' : 'ru_RU',
      alternateLocale: locale === 'he' ? 'ru_RU' : 'he_IL',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image-business.png`,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [`${baseUrl}/og-image-business.png`],
    },
  }
}

export default async function BusinessDetailPage({
  params: { locale, slug },
}: BusinessDetailPageProps) {
  const t = await getTranslations('business')

  const business = await getBusinessBySlug(slug, locale)
  if (!business) notFound()

  const name = locale === 'he' ? business.name_he : (business.name_ru || business.name_he)
  const description = locale === 'he' ? business.description_he : (business.description_ru || business.description_he)
  const address = locale === 'he' ? business.address_he : (business.address_ru || business.address_he)
  const openingHours = locale === 'he' ? business.opening_hours_he : (business.opening_hours_ru || business.opening_hours_he)
  const categoryName = business.category
    ? (locale === 'he' ? business.category.name_he : business.category.name_ru)
    : (locale === 'he' ? 'שירותים' : 'Услуги')
  const subcategoryName = business.subcategory
    ? (locale === 'he' ? business.subcategory.name_he : business.subcategory.name_ru)
    : null
  const neighborhoodName = locale === 'he' ? business.neighborhood.name_he : business.neighborhood.name_ru

  // Calculate average rating
  const ratings = business.reviews.map((r) => r.rating)
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0

  // Construct full business URL
  const businessUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://netanyalocal.com'}/${locale}/business/${slug}`

  // Generate LocalBusiness structured data
  const ratingData = ratings.length > 0
    ? { average: avgRating, count: ratings.length }
    : null
  const localBusinessSchema = generateLocalBusinessSchema(
    business as any,
    ratingData,
    locale,
    businessUrl
  )

  // Breadcrumb items for visual and structured data
  const breadcrumbItems = business.category
    ? [
        {
          label: locale === 'he' ? 'בית' : 'Главная',
          href: `/${locale}`,
        },
        {
          label: categoryName,
          href: `/${locale}/search/${business.category.slug}/${business.neighborhood.slug}`,
        },
        {
          label: neighborhoodName,
          href: `/${locale}/search/${business.category.slug}/${business.neighborhood.slug}`,
        },
        {
          label: name,
          href: `/${locale}/business/${slug}`,
        },
      ]
    : [
        {
          label: locale === 'he' ? 'בית' : 'Главная',
          href: `/${locale}`,
        },
        {
          label: name,
          href: `/${locale}/business/${slug}`,
        },
      ]

  // Generate BreadcrumbList schema for SEO
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanyalocal.com'
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, baseUrl)

  // Generate Review schemas for each review
  const reviewSchemas = business.reviews.map((review) =>
    generateReviewSchema(review as any, name, locale)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* LocalBusiness structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* BreadcrumbList structured data for SEO (2025 Standard) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Review structured data for SEO (2025 Standard) */}
      {reviewSchemas.map((reviewSchema, index) => (
        <script
          key={`review-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      ))}

      {/* Track business view */}
      {business.category && (
        <BusinessViewTracker
          businessId={business.id}
          businessSlug={slug}
          businessNameHe={business.name_he}
          businessNameRu={business.name_ru}
          categorySlug={business.category.slug}
          categoryNameHe={business.category.name_he}
          categoryNameRu={business.category.name_ru}
          neighborhoodSlug={business.neighborhood.slug}
          neighborhoodNameHe={business.neighborhood.name_he}
          neighborhoodNameRu={business.neighborhood.name_ru}
          isTest={business.is_test}
        />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} locale={locale} />

      {/* Back Link */}
      {business.category && (
        <BackButton
          href={`/${locale}/search/${business.category.slug}/${business.neighborhood.slug}`}
          locale={locale}
          label={t('back')}
        />
      )}

      {/* Header */}
      <div className="mb-8 rounded-lg border bg-white p-8">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h1 className="flex-1 text-3xl font-bold">{name}</h1>
          <div className="flex flex-wrap items-start gap-2">
            {business.is_test && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md"
                role="status"
                aria-label={locale === 'he' ? 'עסק בדיקה' : 'Тестовый бизнес'}
              >
                <span>🧪</span>
                <span>{locale === 'he' ? 'בדיקה' : 'Тест'}</span>
              </span>
            )}
            {business.is_verified && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-md ring-1 ring-blue-800/20"
                role="status"
                aria-label={locale === 'he' ? 'עסק מאומת על ידי המערכת' : 'Бизнес проверен системой'}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('verified')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>{categoryName}</span>
          {subcategoryName && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                <span>{subcategoryName}</span>
              </span>
            </>
          )}
          <span>•</span>
          <span>{neighborhoodName}</span>
          {ratings.length > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{avgRating.toFixed(1)}</span>
                <span>({ratings.length} {t('reviewsCount', { count: ratings.length })})</span>
              </div>
            </>
          )}
        </div>

        {/* Share Button */}
        <div className="mb-6">
          <ShareButton
            businessName={name}
            businessUrl={businessUrl}
            locale={locale}
          />
        </div>

        {/* Description */}
        {description && (
          <div className="mb-6">
            <h2 className="mb-2 font-bold">{t('description')}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="mb-6">
          <h2 className="mb-4 font-bold">{t('contact')}</h2>
          <CTAButtons
            businessId={business.id}
            businessName={name}
            phone={business.phone}
            whatsappNumber={business.whatsapp_number}
            websiteUrl={business.website_url}
            address={address}
            translations={{
              phone: t('phone'),
              website: t('website'),
              directions: t('directions'),
            }}
          />
        </div>

        {/* Social Media Links */}
        {(business.instagram_url || business.facebook_url || business.tiktok_url || business.email) && (
          <div className="mb-6">
            <h2 className="mb-4 font-bold">{locale === 'he' ? 'רשתות חברתיות ויצירת קשר' : 'Соцсети и контакты'}</h2>
            <div className="flex flex-wrap gap-3">
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-400"
                  aria-label={locale === 'he' ? 'שלח אימייל' : 'Отправить email'}
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{locale === 'he' ? 'אימייל' : 'Email'}</span>
                </a>
              )}

              {business.instagram_url && (
                <a
                  href={business.instagram_url.startsWith('http') ? business.instagram_url : `https://instagram.com/${business.instagram_url.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-pink-300 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white transition hover:from-purple-600 hover:to-pink-600 shadow-sm"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              )}

              {business.facebook_url && (
                <a
                  href={business.facebook_url.startsWith('http') ? business.facebook_url : `https://facebook.com/${business.facebook_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 shadow-sm"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
              )}

              {business.tiktok_url && (
                <a
                  href={business.tiktok_url.startsWith('http') ? business.tiktok_url : `https://tiktok.com/@${business.tiktok_url.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900 shadow-sm"
                  aria-label="TikTok"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                  </svg>
                  <span>TikTok</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid gap-4 md:grid-cols-2">
          {address && (
            <div>
              <h3 className="mb-1 font-medium">{t('address')}</h3>
              <p className="text-sm text-gray-600">{address}</p>
            </div>
          )}
          {openingHours && (
            <div>
              <h3 className="mb-1 font-medium">{t('openingHours')}</h3>
              <p className="text-sm text-gray-600">{openingHours}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="rounded-lg border bg-white p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('reviews')}</h2>
          <Link
            href={`/${locale}/business/${slug}/write-review`}
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            {t('writeReview')}
          </Link>
        </div>

        {/* Reviews List */}
        {business.reviews.length === 0 ? (
          <p className="text-gray-600">אין ביקורות עדיין. היה הראשון!</p>
        ) : (
          <div className="space-y-6">
            {business.reviews.map((review) => {
              const comment = review.language === 'he' ? review.comment_he : review.comment_ru
              return (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < review.rating
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {review.author_name || 'אנונימי'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(review.created_at).toLocaleDateString(locale)}
                    </span>
                  </div>
                  {comment && <p className="text-gray-700">{comment}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
