import {
  getAnalyticsSummary,
  getTopCategories,
  getTopNeighborhoods,
  getCTADistribution,
} from '@/lib/queries/analytics'
import AnalyticsDashboard from '@/components/client/AnalyticsDashboard'

interface AdminAnalyticsPageProps {
  params: {
    locale: string
  }
}

export default async function AdminAnalyticsPage({
  params: { locale },
}: AdminAnalyticsPageProps) {
  // Get last 7 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  // Fetch all analytics data
  const [
    summary,
    topCategories,
    topNeighborhoods,
    ctaDistribution,
  ] = await Promise.all([
    getAnalyticsSummary(startDate, endDate),
    getTopCategories(startDate, endDate, 5),
    getTopNeighborhoods(startDate, endDate, 5),
    getCTADistribution(startDate, endDate),
  ])

  return (
    <AnalyticsDashboard
      initialSummary={summary}
      initialTopCategories={topCategories}
      initialTopNeighborhoods={topNeighborhoods}
      initialCTADistribution={ctaDistribution}
      locale={locale}
    />
  )
}
