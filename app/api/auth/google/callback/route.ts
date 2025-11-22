import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { SignJWT } from 'jose'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login?error=access_denied`
      )
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login?error=invalid_request`
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login?error=invalid_state`
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login?error=invalid_token`
      )
    }

    const { email, sub: googleId, name } = payload

    // Find or create admin user
    let adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [{ email }, { google_id: googleId }],
      },
    })

    if (!adminUser) {
      // Check if this is the first admin or if email is whitelisted
      // For security, only allow specific email domains or pre-registered emails
      const adminEmail = process.env.ADMIN_EMAIL

      if (email !== adminEmail) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login?error=unauthorized`
        )
      }

      // Create new admin user
      adminUser = await prisma.adminUser.create({
        data: {
          email,
          google_id: googleId,
          name: name || email.split('@')[0],
          role: 'SUPERADMIN',
          is_active: true,
        },
      })
    } else {
      // Update google_id if not set
      if (!adminUser.google_id) {
        adminUser = await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: { google_id: googleId },
        })
      }

      // Update last login
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { last_login_at: new Date() },
      })
    }

    // Check if user is active
    if (!adminUser.is_active) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login?error=account_inactive`
      )
    }

    // Create JWT session token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new SignJWT({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7 days session
      .sign(secret)

    // Set session cookie and redirect to dashboard
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard`
    )

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login?error=server_error`
    )
  }
}
