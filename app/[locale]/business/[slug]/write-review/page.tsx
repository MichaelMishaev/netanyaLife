import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { getBusinessBySlug } from '@/lib/queries/businesses'
import ReviewForm from '@/components/client/ReviewForm'

interface WriteReviewPageProps {
  params: {
    locale: string
    slug: string
  }
}

export default async function WriteReviewPage({
  params: { locale, slug },
}: WriteReviewPageProps) {
  const t = useTranslations('reviews')

  const business = await getBusinessBySlug(slug, locale)
  if (!business) notFound()

  const name =
    locale === 'he' ? business.name_he : business.name_ru || business.name_he

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/${locale}/business/${slug}`}
        className="mb-4 inline-block text-primary-600 hover:text-primary-700"
      >
        ← {t('cancel')}
      </Link>

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
    </main>
  )
}
