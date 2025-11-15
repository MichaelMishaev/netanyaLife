import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getBusinessBySlug } from '@/lib/queries/businesses'

interface BusinessDetailPageProps {
  params: {
    locale: string
    slug: string
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
  const categoryName = locale === 'he' ? business.category.name_he : business.category.name_ru
  const neighborhoodName = locale === 'he' ? business.neighborhood.name_he : business.neighborhood.name_ru

  // Calculate average rating
  const ratings = business.reviews.map((r) => r.rating)
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/${locale}/search/${business.category.slug}/${business.neighborhood.slug}`}
        className="mb-4 inline-block text-primary-600 hover:text-primary-700"
      >
        ← {t('back')}
      </Link>

      {/* Header */}
      <div className="mb-8 rounded-lg border bg-white p-8">
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-3xl font-bold">{name}</h1>
          {business.is_verified && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              ✓ {t('verified')}
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>{categoryName}</span>
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
                className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
              >
                📞 {t('phone')}
              </a>
            )}
            {business.whatsapp_number && (
              <a
                href={`https://wa.me/${business.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                💬 WhatsApp
              </a>
            )}
            {business.website_url && (
              <a
                href={business.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                🌐 {t('website')}
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
