import { prisma } from '@/lib/prisma'
import LatestBusinessesCarousel from '@/components/client/LatestBusinessesCarousel'

interface HomepageStatsProps {
  locale: string
}

/**
 * Homepage Stats Component - Business Count + Stats + Latest Additions
 *
 * Fully admin-controlled sections:
 * 1. Business count (standalone)
 * 2. Review count (if enabled)
 * 3. Neighborhood count (if enabled)
 * 4. Latest joined businesses
 */
export default async function HomepageStats({ locale }: HomepageStatsProps) {
  // Fetch admin settings
  const settings = await prisma.adminSettings.findMany({
    where: {
      key: {
        in: [
          'show_homepage_stats',
          'stats_business_threshold',
          'show_business_count',
          'show_review_count',
          'show_neighborhood_count',
        ],
      },
    },
  })

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  // Check if stats are enabled
  const showHomepageStats = settingsMap.show_homepage_stats === 'true'
  if (!showHomepageStats) return null

  // Get individual toggles
  const showBusinessCount = settingsMap.show_business_count !== 'false'
  const showReviewCount = settingsMap.show_review_count !== 'false'
  const showNeighborhoodCount = settingsMap.show_neighborhood_count !== 'false'

  // Get threshold
  const threshold = settingsMap.stats_business_threshold
    ? parseInt(settingsMap.stats_business_threshold, 10)
    : 50

  // Fetch all counts
  const [businessCount, reviewCount, neighborhoodCount] = await Promise.all([
    prisma.business.count({ where: { is_visible: true, deleted_at: null } }),
    prisma.review.count({ where: { is_approved: true } }),
    prisma.neighborhood.count({ where: { is_active: true } }),
  ])

  // Check threshold
  if (businessCount < threshold) return null

  // Fetch latest 10 businesses for carousel
  const latestBusinesses = await prisma.business.findMany({
    where: { is_visible: true, deleted_at: null },
    include: {
      category: {
        select: {
          name_he: true,
          name_ru: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
    take: 10,
  })

  // Format counts with milestone thresholds
  const formatCount = (count: number): string => {
    if (count < 50) return count.toString()
    if (count < 100) return '50+'
    if (count < 200) return '100+'
    if (count < 500) return '200+'
    return '500+'
  }

  // Build additional stats array (review + neighborhood)
  const additionalStats: Array<{ label: string; value: string }> = []

  if (showReviewCount) {
    additionalStats.push({
      label: locale === 'he' ? 'מספר ביקורות' : 'Отзывов',
      value: formatCount(reviewCount),
    })
  }

  if (showNeighborhoodCount) {
    additionalStats.push({
      label: locale === 'he' ? 'מספר שכונות' : 'Районов',
      value: neighborhoodCount.toString(),
    })
  }

  return (
    <div className="w-full max-w-2xl space-y-4" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      {/* Business Count - Standalone (if enabled) */}
      {showBusinessCount && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50 px-8 py-5 shadow-sm">
          <div className="text-4xl font-bold text-primary-600">
            {formatCount(businessCount)}
          </div>
          <div className="text-lg font-semibold text-gray-700">
            {locale === 'he' ? 'עסקים מאומתים' : 'Проверенных предприятий'}
          </div>
        </div>
      )}

      {/* Additional Stats (Reviews + Neighborhoods) - Only if at least one is enabled */}
      {additionalStats.length > 0 && (
        <div className="flex items-center justify-center gap-8 rounded-xl border border-gray-200/50 bg-white/60 px-8 py-4 shadow-sm backdrop-blur-sm">
          {additionalStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-primary-600">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-gray-600">
                  {stat.label}
                </div>
              </div>

              {/* Divider between stats (not after last one) */}
              {index < additionalStats.length - 1 && (
                <div className="h-10 w-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Latest Joined Section - Animated Carousel */}
      <LatestBusinessesCarousel businesses={latestBusinesses} locale={locale} />
    </div>
  )
}
