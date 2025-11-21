import { NextRequest, NextResponse } from 'next/server'
import {
  getAnalyticsSummary,
  getTopCategories,
  getTopNeighborhoods,
  getCTADistribution,
} from '@/lib/queries/analytics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 })
    }

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    const [summary, topCategories, topNeighborhoods, ctaDistribution] = await Promise.all([
      getAnalyticsSummary(startDate, endDate),
      getTopCategories(startDate, endDate, 5),
      getTopNeighborhoods(startDate, endDate, 5),
      getCTADistribution(startDate, endDate),
    ])

    return NextResponse.json({
      summary,
      topCategories,
      topNeighborhoods,
      ctaDistribution,
    })
  } catch (error) {
    console.error('Analytics summary API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
