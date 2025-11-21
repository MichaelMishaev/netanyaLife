import { NextRequest, NextResponse } from 'next/server'
import {
  getSearchDetails,
  getBusinessViewDetails,
  getReviewDetails,
  getCTAClickDetails,
  getTopCategories,
} from '@/lib/queries/analytics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const limitStr = searchParams.get('limit')
    const offsetStr = searchParams.get('offset')

    // Filters
    const category = searchParams.get('category')
    const neighborhood = searchParams.get('neighborhood')
    const businessName = searchParams.get('businessName')

    if (!type || !startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)
    const limit = limitStr ? parseInt(limitStr, 10) : 50
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0

    const filters = {
      category: category || undefined,
      neighborhood: neighborhood || undefined,
      businessName: businessName || undefined,
    }

    let result

    switch (type) {
      case 'searches':
        result = await getSearchDetails(startDate, endDate, limit, offset, filters)
        break
      case 'views':
        result = await getBusinessViewDetails(startDate, endDate, limit, offset, filters)
        break
      case 'reviews':
        result = await getReviewDetails(startDate, endDate, limit, offset, filters)
        break
      case 'cta':
        result = await getCTAClickDetails(startDate, endDate, limit, offset, filters)
        break
      case 'categories':
        // Categories query doesn't have the same return format, handle separately
        const categories = await getTopCategories(startDate, endDate, limit)
        return NextResponse.json({ data: categories, total: categories.length })
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ data: result.data, total: result.total })
  } catch (error) {
    console.error('Drill-down API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
