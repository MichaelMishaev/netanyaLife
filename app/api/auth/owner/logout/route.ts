import { NextRequest, NextResponse } from 'next/server'
import { clearOwnerSession } from '@/lib/auth-owner.server'

export async function POST(request: NextRequest) {
  try {
    // Clear owner session cookie
    await clearOwnerSession()

    return NextResponse.json({
      success: true,
      redirect: '/he/business-login',
    })
  } catch (error) {
    console.error('Business owner logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed. Please try again.' },
      { status: 500 }
    )
  }
}
