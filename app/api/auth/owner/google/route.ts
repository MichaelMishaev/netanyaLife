import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/owner/google/callback`
)

export async function GET(request: NextRequest) {
  try {
    // Generate CSRF state token
    const state = randomUUID()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store state in database for CSRF protection
    await prisma.oAuthState.create({
      data: {
        state,
        expires_at: expiresAt,
      },
    })

    // Clean up expired states (optional cleanup)
    await prisma.oAuthState.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    })

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state,
      prompt: 'select_account', // Force account selection
    })

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Business owner OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}
