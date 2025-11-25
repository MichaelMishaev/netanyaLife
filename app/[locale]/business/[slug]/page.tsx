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
