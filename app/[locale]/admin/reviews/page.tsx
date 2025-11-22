import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import ReviewManagement from '@/components/client/ReviewManagement'

interface AdminReviewsPageProps {
  params: {
    locale: string
  }
  searchParams: {
    business?: string
    flagged?: string
  }
}

export default async function AdminReviewsPage({
  params: { locale },
  searchParams,
}: AdminReviewsPageProps) {
  const t = await getTranslations('admin')

  // Build filter conditions
  const whereConditions: any = {}

  if (searchParams?.business) {
    whereConditions.business_id = searchParams.business
  }

  if (searchParams?.flagged === 'true') {
    whereConditions.is_flagged = true
  }

  // Get reviews with business info
  const reviews = await prisma.review.findMany({
    where: whereConditions,
    include: {
      business: {
        select: {
          id: true,
          name_he: true,
          name_ru: true,
          slug_he: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  // Get businesses for filter dropdown
  const businesses = await prisma.business.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: { name_he: 'asc' },
  })

  // Stats
  const totalReviews = await prisma.review.count()
  const flaggedReviews = await prisma.review.count({ where: { is_flagged: true } })
  const avgRating = await prisma.review.aggregate({
    _avg: { rating: true },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {locale === 'he' ? 'ניהול ביקורות' : 'Управление отзывами'}
        </h1>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">
            {locale === 'he' ? 'סה״כ ביקורות' : 'Всего отзывов'}
          </p>
          <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">
            {locale === 'he' ? 'ביקורות מסומנות' : 'Отмеченные отзывы'}
          </p>
          <p className="text-2xl font-bold text-red-600">{flaggedReviews}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">
            {locale === 'he' ? 'דירוג ממוצע' : 'Средний рейтинг'}
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            {avgRating._avg.rating?.toFixed(1) || '0'} / 5
          </p>
        </div>
      </div>

      <ReviewManagement
        reviews={reviews.map((r) => ({
          id: r.id,
          business_id: r.business_id,
          business_name: locale === 'he' ? r.business.name_he : r.business.name_ru || r.business.name_he,
          business_slug: r.business.slug_he,
          rating: r.rating,
          comment: locale === 'he' ? r.comment_he : r.comment_ru || r.comment_he,
          author_name: r.author_name,
          is_approved: r.is_approved,
          is_flagged: r.is_flagged,
          created_at: r.created_at.toISOString(),
        }))}
        businesses={businesses.map((b) => ({
          id: b.id,
          name: locale === 'he' ? b.name_he : b.name_ru || b.name_he,
          review_count: b._count.reviews,
        }))}
        locale={locale}
        currentFilters={{
          business: searchParams?.business,
          flagged: searchParams?.flagged,
        }}
      />
    </div>
  )
}
