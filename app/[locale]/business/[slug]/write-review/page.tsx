import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getBusinessBySlug } from '@/lib/queries/businesses'
import ReviewForm from '@/components/client/ReviewForm'
import BackButton from '@/components/client/BackButton'

interface WriteReviewPageProps {
  params: {
    locale: string
    slug: string
  }
}

export default async function WriteReviewPage({
  params: { locale, slug },
}: WriteReviewPageProps) {
  const t = await getTranslations('reviews')

  const business = await getBusinessBySlug(slug, locale)
  if (!business) notFound()

  const name =
    locale === 'he' ? business.name_he : business.name_ru || business.name_he

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <BackButton
        href={`/${locale}/business/${slug}`}
        locale={locale}
        label={t('cancel')}
      />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('submitReview')}</h1>
      </div>

      {/* Review Form */}
      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-8">
        <ReviewForm
          businessId={business.id}
          businessName={name}
          locale={locale}
          businessSlug={slug}
        />
      </div>
    </div>
  )
}
