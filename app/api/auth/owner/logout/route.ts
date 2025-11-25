import { NextRequest, NextResponse } from 'next/server'
import { clearOwnerSession } from '@/lib/auth-owner.server'

export async function POST(request: NextRequest) {
  try {
    // Clear owner session cookie
    await clearOwnerSession()

    // Get locale from referer or default to 'he'
    const referer = request.headers.get('referer') || ''
    const locale = referer.includes('/ru/') ? 'ru' : 'he'

    return NextResponse.json({
      success: true,
      redirect: `/${locale}`,
    })
  } catch (error) {
    console.error('Business owner logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed. Please try again.' },
      { status: 500 }
    )
  }
}
