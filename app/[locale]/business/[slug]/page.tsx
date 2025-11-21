import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Metadata } from 'next'
import { getBusinessBySlug } from '@/lib/queries/businesses'
import ShareButton from '@/components/client/ShareButton'
import Breadcrumbs from '@/components/server/Breadcrumbs'
import BusinessViewTracker from '@/components/client/BusinessViewTracker'
import BackButton from '@/components/client/BackButton'
import { generateLocalBusinessSchema } from '@/lib/seo/structured-data'
import { formatPhoneForWhatsApp } from '@/lib/utils/phone'

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
      siteName: 'Netanya Local',
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

  // Breadcrumb items
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* LocalBusiness structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

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
          <div className="flex flex-wrap gap-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
              >
                {/* Phone Icon */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                {/* WhatsApp Official Logo */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            )}
            {business.website_url && (
              <a
                href={business.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                {/* Globe/External Link Icon */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span>{t('website')}</span>
              </a>
            )}
            {address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {/* Map Pin Icon */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{t('directions')}</span>
              </a>
            )}
          </div>
        </div>

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
