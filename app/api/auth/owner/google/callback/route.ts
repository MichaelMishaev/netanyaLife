import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { createOwnerSession } from '@/lib/auth-owner.server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/owner/google/callback`
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle user cancellation
    if (error === 'access_denied') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/he/business-login?error=access_denied`
      )
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/he/business-login?error=invalid_request`
      )
    }

    // Verify CSRF state token
    const storedState = await prisma.oAuthState.findUnique({
      where: { state },
    })

    if (!storedState || storedState.expires_at < new Date()) {
      // Delete expired/invalid state
      if (storedState) {
        await prisma.oAuthState.delete({ where: { state } })
      }
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/he/business-login?error=invalid_state`
      )
    }

    // Delete used state (prevent replay attacks)
    await prisma.oAuthState.delete({ where: { state } })

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Verify ID token and get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email || !payload.sub) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/he/business-login?error=invalid_token`
      )
    }

    const { email, sub: googleId, name } = payload

    // Find or create business owner
    let businessOwner = await prisma.businessOwner.findFirst({
      where: {
        OR: [{ email }, { google_id: googleId }],
      },
    })

    if (!businessOwner) {
      // Create new business owner (no email whitelist - any Gmail can register)
      businessOwner = await prisma.businessOwner.create({
        data: {
          email,
          google_id: googleId,
          name: name || email.split('@')[0],
          is_active: true,
          is_verified: true, // Auto-verify Google OAuth users
        },
      })
    } else {
      // Update google_id if not set
      if (!businessOwner.google_id) {
        businessOwner = await prisma.businessOwner.update({
          where: { id: businessOwner.id },
          data: { google_id: googleId },
        })
      }

      // Update last login
      await prisma.businessOwner.update({
        where: { id: businessOwner.id },
        data: { last_login_at: new Date() },
      })
    }

    // Check if user is active
    if (!businessOwner.is_active) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/he/business-login?error=account_inactive`
      )
    }

    // Create owner session (uses auth-owner.server.ts helper)
    await createOwnerSession(businessOwner.id, businessOwner.email, businessOwner.name)

    // Redirect to business portal dashboard
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/he/business-portal`
    )
  } catch (error) {
    console.error('Business owner OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/he/business-login?error=server_error`
    )
  }
}
