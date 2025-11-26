import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import AdminSettingsForm from '@/components/client/AdminSettingsForm'

interface AdminSettingsPageProps {
  params: {
    locale: string
  }
}

export default async function AdminSettingsPage({
  params: { locale },
}: AdminSettingsPageProps) {
  const t = await getTranslations('admin.settings')

  // Get all settings
  const settings = await prisma.adminSettings.findMany()
  const settingsMap = Object.fromEntries(
    settings.map(s => [s.key, s.value])
  )

  // Parse settings with defaults
  const topPinnedCount = settingsMap.top_pinned_count
    ? parseInt(settingsMap.top_pinned_count, 10)
    : 4
  const showHomepageStats = settingsMap.show_homepage_stats === 'true'
  const statsBusinessThreshold = settingsMap.stats_business_threshold
    ? parseInt(settingsMap.stats_business_threshold, 10)
    : 50
  const showBusinessCount = settingsMap.show_business_count !== 'false'
  const showReviewCount = settingsMap.show_review_count !== 'false'
  const showNeighborhoodCount = settingsMap.show_neighborhood_count !== 'false'

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>

      <div className="max-w-3xl space-y-6">
        <AdminSettingsForm
          locale={locale}
          initialSettings={{
            topPinnedCount,
            showHomepageStats,
            statsBusinessThreshold,
            showBusinessCount,
            showReviewCount,
            showNeighborhoodCount,
          }}
        />
      </div>
    </div>
  )
}
