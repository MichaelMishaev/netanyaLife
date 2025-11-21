# Google OAuth Implementation Guide

Complete step-by-step guide to implementing Google OAuth authentication in a Next.js application, based on the TicketCap implementation.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Google Cloud Console Setup](#google-cloud-console-setup)
4. [Database Schema](#database-schema)
5. [Environment Variables](#environment-variables)
6. [Install Dependencies](#install-dependencies)
7. [Session Management System](#session-management-system)
8. [OAuth Routes Implementation](#oauth-routes-implementation)
9. [Middleware Protection](#middleware-protection)
10. [Frontend Integration](#frontend-integration)
11. [Security Considerations](#security-considerations)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)

---

## Overview

This implementation uses:
- **Next.js 15** with App Router
- **Prisma ORM** for database
- **JWT** for session management
- **google-auth-library** for OAuth flow
- **Database-backed state storage** (more reliable than cookies)
- **Security-first approach** (prevents account takeover)

**Key Features:**
- ✅ State parameter stored in database (CSRF protection)
- ✅ Prevents auto-linking to password-protected accounts
- ✅ Supports OAuth-only users and password-based users
- ✅ Email verification via Google
- ✅ Onboarding flow for new users
- ✅ Session-based authentication with JWT
- ✅ Edge Runtime compatible middleware

---

## Prerequisites

Before starting, ensure you have:
- Next.js 15+ application with App Router
- PostgreSQL database
- Prisma ORM configured
- Basic authentication system (or willing to build from scratch)

---

## Google Cloud Console Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API** for your project

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Configure consent screen if prompted:
   - User Type: External (for public apps) or Internal (for organization)
   - App name: Your app name
   - User support email: Your email
   - Authorized domains: Your domain (e.g., `yourdomain.com`)
   - Scopes: Add `userinfo.email` and `userinfo.profile`

4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Your app name
   - Authorized JavaScript origins:
     ```
     http://localhost:9000
     https://yourdomain.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:9000/api/auth/google/callback
     https://yourdomain.com/api/auth/google/callback
     ```

5. Save the **Client ID** and **Client Secret**

---

## Database Schema

### Add OAuth-related fields to your User/Admin model

```prisma
// schema.prisma

model Admin {
  id                String       @id @default(cuid())
  email             String       @unique
  passwordHash      String?      // NULLABLE - for OAuth-only users
  name              String
  role              AdminRole    @default(SCHOOL_ADMIN)
  schoolId          String?
  school            School?      @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  // Email verification
  emailVerified     Boolean      @default(false)
  verificationToken String?      @unique

  // OAuth
  googleId          String?      @unique  // ← ADD THIS

  // Onboarding
  onboardingCompleted Boolean    @default(false)

  // Status
  isActive          Boolean      @default(true)
  lastLoginAt       DateTime?

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([email])
  @@index([googleId])  // ← ADD THIS INDEX
}

// OAuth State Storage - for CSRF protection
model OAuthState {
  id        String   @id @default(cuid())
  state     String   @unique
  createdAt DateTime @default(now())
  expiresAt DateTime

  @@index([state])
  @@index([expiresAt])
}
```

### Run migration

```bash
npx prisma migrate dev --name add_google_oauth
npx prisma generate
```

---

## Environment Variables

Add to your `.env` file:

```bash
# JWT Secret (for session management)
# Generate with: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Google OAuth
GOOGLE_CLIENT_ID="xxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxxxxxxxxxxxx"

# Base URL (for redirects)
NEXT_PUBLIC_BASE_URL="http://localhost:9000"  # Change in production

# Database
DATABASE_URL="postgresql://username:password@host:port/database"
```

**Important Notes:**
- `JWT_SECRET`: Must be at least 32 characters, cryptographically random
- `GOOGLE_CLIENT_ID`: From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `NEXT_PUBLIC_BASE_URL`: Your app's base URL (no trailing slash)

---

## Install Dependencies

```bash
npm install google-auth-library jsonwebtoken jose bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

**Dependency explanation:**
- `google-auth-library`: Official Google OAuth client
- `jsonwebtoken`: JWT signing/verification (Node.js runtime)
- `jose`: JWT verification (Edge Runtime compatible - for middleware)
- `bcryptjs`: Password hashing (if supporting password auth)

---

## Session Management System

Create `lib/auth.server.ts`:

```typescript
import 'server-only'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { AdminRole } from '@prisma/client'

export interface AuthSession {
  adminId: string
  email: string
  name: string
  role: AdminRole
  schoolId?: string
  schoolName?: string
}

export const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

// Lazy getter for JWT_SECRET - only validates when used
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}

// Encode session to JWT
export function encodeSession(session: AuthSession): string {
  return jwt.sign(session, getJWTSecret(), {
    expiresIn: '7d',
    algorithm: 'HS256'
  })
}

// Decode and verify JWT
function decodeSession(token: string): AuthSession | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret(), {
      algorithms: ['HS256']
    }) as AuthSession
    return decoded
  } catch (error) {
    console.error('Session decode error:', error)
    return null
  }
}

/**
 * Get current authenticated admin session
 */
export async function getCurrentAdmin(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const session = decodeSession(token)
    if (!session) {
      return null
    }

    // Verify admin still exists in database
    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      include: { school: true }
    })

    if (!admin) {
      // Admin was deleted, clear session
      await logout()
      return null
    }

    return session
  } catch (error) {
    console.error('Get current admin error:', error)
    return null
  }
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAdmin(): Promise<AuthSession> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }
  return admin
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
```

**Key Points:**
- Uses JWT for stateless session management
- `'server-only'` directive ensures no client-side usage
- Validates admin exists in database on each request
- Lazy JWT secret loading (avoids errors during build)

---

## OAuth Routes Implementation

### Route 1: Initiate OAuth Flow

Create `app/api/auth/google/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000'
const REDIRECT_URI = `${BASE_URL}/api/auth/google/callback`

export async function GET(request: NextRequest) {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('[Google OAuth] Missing Google OAuth credentials')
      return NextResponse.redirect(new URL('/admin/login?error=oauth_not_configured', BASE_URL))
    }

    const oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    )

    // Generate a secure random state parameter (CSRF protection)
    const state = crypto.randomUUID()

    // Store state in database (more reliable than cookies)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    await prisma.oAuthState.create({
      data: {
        state,
        expiresAt,
      },
    })

    // Clean up expired states
    await prisma.oAuthState.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    // Generate the authorization URL
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state,
      prompt: 'select_account', // Always show account picker
    })

    console.log('[Google OAuth] State stored in DB, redirecting to Google')

    return NextResponse.redirect(authorizationUrl)
  } catch (error) {
    console.error('[Google OAuth] Error initiating OAuth flow:', error)
    const errorMessage = error instanceof Error ? error.message : 'unknown_error'
    const encodedError = encodeURIComponent(errorMessage.substring(0, 100))
    return NextResponse.redirect(new URL(`/admin/login?error=oauth_init_failed&details=${encodedError}`, BASE_URL))
  }
}
```

**What this does:**
1. Creates OAuth2 client with Google credentials
2. Generates random state parameter (UUID)
3. Stores state in database with 10-minute expiration
4. Cleans up old expired states
5. Redirects user to Google consent screen

---

### Route 2: Handle OAuth Callback

Create `app/api/auth/google/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import { AuthSession, SESSION_COOKIE_NAME, encodeSession } from '@/lib/auth.server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000'
const REDIRECT_URI = `${BASE_URL}/api/auth/google/callback`
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('[Google OAuth Callback] OAuth error:', error)
      return NextResponse.redirect(new URL('/admin/login?error=oauth_cancelled', BASE_URL))
    }

    if (!code || !state) {
      console.error('[Google OAuth Callback] Missing code or state')
      return NextResponse.redirect(new URL('/admin/login?error=oauth_invalid', BASE_URL))
    }

    // Verify state parameter - READ FROM DATABASE
    const storedOAuthState = await prisma.oAuthState.findUnique({
      where: { state },
    })

    if (!storedOAuthState) {
      console.error('[Google OAuth Callback] State not found in database')
      return NextResponse.redirect(new URL('/admin/login?error=oauth_state_mismatch', BASE_URL))
    }

    // Check if state has expired
    if (storedOAuthState.expiresAt < new Date()) {
      console.error('[Google OAuth Callback] State expired')
      await prisma.oAuthState.delete({ where: { id: storedOAuthState.id } })
      return NextResponse.redirect(new URL('/admin/login?error=oauth_state_expired', BASE_URL))
    }

    // Delete the state (one-time use only)
    await prisma.oAuthState.delete({ where: { id: storedOAuthState.id } })

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('[Google OAuth Callback] Missing Google OAuth credentials')
      return NextResponse.redirect(new URL('/admin/login?error=oauth_not_configured', BASE_URL))
    }

    const oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    )

    // Exchange authorization code for tokens
    console.log('[Google OAuth Callback] Exchanging code for tokens')
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info from Google
    console.log('[Google OAuth Callback] Fetching user info')
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    if (!payload || !payload.email) {
      console.error('[Google OAuth Callback] No email in payload')
      return NextResponse.redirect(new URL('/admin/login?error=oauth_no_email', BASE_URL))
    }

    const googleId = payload.sub
    const email = payload.email.toLowerCase()
    const name = payload.name || email.split('@')[0]
    const emailVerified = payload.email_verified || false

    console.log('[Google OAuth Callback] User info:', { googleId, email, name, emailVerified })

    // Check if user exists by googleId
    let admin = await prisma.admin.findUnique({
      where: { googleId },
      include: { school: true },
    })

    if (admin) {
      // User with this Google ID exists - update last login
      admin = await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
        include: { school: true },
      })
      console.log('[Google OAuth Callback] Existing Google user logged in')
    } else {
      // Check if email already exists with password account
      const existingEmailUser = await prisma.admin.findUnique({
        where: { email },
      })

      if (existingEmailUser && existingEmailUser.passwordHash) {
        // SECURITY: Email exists with password - DON'T auto-link
        console.error('[Google OAuth Callback] Email exists with password - blocking auto-link')
        return NextResponse.redirect(
          new URL('/admin/login?error=email_exists_with_password', BASE_URL)
        )
      }

      // Safe to create new user or link to OAuth-only account
      if (existingEmailUser && !existingEmailUser.passwordHash) {
        // OAuth-only account with same email - link Google ID
        console.log('[Google OAuth Callback] Linking Google to OAuth-only account')
        admin = await prisma.admin.update({
          where: { id: existingEmailUser.id },
          data: {
            googleId,
            emailVerified: true,
            lastLoginAt: new Date(),
          },
          include: { school: true },
        })
      } else {
        // Create new user
        console.log('[Google OAuth Callback] Creating new user')
        admin = await prisma.admin.create({
          data: {
            email,
            name,
            googleId,
            emailVerified: true, // Google verified it
            passwordHash: null, // OAuth-only user
            role: 'OWNER',
            schoolId: null, // Set during onboarding
            onboardingCompleted: false,
            lastLoginAt: new Date(),
          },
          include: { school: true },
        })
        console.log('[Google OAuth Callback] New user created')
      }
    }

    // Create session
    const session: AuthSession = {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      schoolId: admin.schoolId || undefined,
      schoolName: admin.school?.name || undefined,
    }

    // Determine redirect URL based on onboarding status
    const redirectUrl = (!admin.onboardingCompleted || !admin.schoolId)
      ? new URL('/admin/onboarding', BASE_URL)
      : new URL('/admin', BASE_URL)

    console.log('[Google OAuth Callback] Redirecting to:', redirectUrl.pathname)

    // Create redirect response with cookies
    const response = NextResponse.redirect(redirectUrl)

    // Set session cookie
    response.cookies.set(SESSION_COOKIE_NAME, encodeSession(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    // Optional: Set client-side auth hint cookie
    response.cookies.set('admin_logged_in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Google OAuth Callback] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'unknown_error'
    const encodedError = encodeURIComponent(errorMessage.substring(0, 100))
    return NextResponse.redirect(new URL(`/admin/login?error=oauth_failed&details=${encodedError}`, BASE_URL))
  }
}
```

**What this does:**
1. Receives OAuth callback with `code` and `state`
2. Verifies state matches database record (CSRF protection)
3. Exchanges code for access tokens
4. Fetches user profile from Google
5. Checks for existing users (by Google ID or email)
6. **Security check**: Prevents auto-linking to password accounts
7. Creates or updates user record
8. Sets session cookie
9. Redirects to onboarding or dashboard

**Critical Security Feature:**
```typescript
if (existingEmailUser && existingEmailUser.passwordHash) {
  // NEVER auto-link OAuth to password accounts
  return NextResponse.redirect(
    new URL('/admin/login?error=email_exists_with_password', BASE_URL)
  )
}
```
This prevents account takeover attacks where an attacker creates a Google account with someone else's email.

---

## Middleware Protection

Create `middleware.ts` in your project root:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Lazy getter for JWT secret
function getJWTSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  // Convert to Uint8Array for jose (Edge Runtime compatible)
  return new TextEncoder().encode(jwtSecret)
}

// Protected routes that require authentication
const PROTECTED_PATHS = [
  '/admin',
  '/api/admin/me',
  '/api/events',
  '/api/dashboard',
]

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  '/admin/login',
  '/admin/signup',
  '/api/admin/login',
  '/api/admin/signup',
  '/api/auth/google',
  '/api/auth/google/callback',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check if path needs protection
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('admin_session')

  if (!sessionCookie) {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // UI routes redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Verify JWT session
  try {
    await jwtVerify(sessionCookie.value, getJWTSecret(), {
      algorithms: ['HS256']
    })

    // Session is valid, allow request
    return NextResponse.next()
  } catch (error) {
    console.error('[Middleware] Invalid session token:', error)

    // Clear invalid session
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/admin/login', request.url))

    response.cookies.delete('admin_session')
    response.cookies.delete('admin_logged_in')

    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
```

**Why use `jose` instead of `jsonwebtoken`?**
- Middleware runs in Edge Runtime (not Node.js)
- `jsonwebtoken` requires Node.js APIs (not available in Edge)
- `jose` is Edge Runtime compatible

---

## Frontend Integration

### Login Page Component

Create or update `app/admin/login/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Handle OAuth error messages from URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const errorParam = urlParams.get('error')

      if (errorParam === 'email_exists_with_password') {
        setError('This email is already registered with a password. Please sign in with your password instead of Google.')
      } else if (errorParam === 'oauth_failed') {
        const details = urlParams.get('details')
        setError(details ? `Google sign-in failed: ${decodeURIComponent(details)}` : 'Google sign-in failed. Please try again.')
      } else if (errorParam === 'oauth_cancelled') {
        setError('Google sign-in was cancelled.')
      } else if (errorParam === 'oauth_not_configured') {
        setError('Google sign-in is not configured. Please contact support.')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign In</h2>

        {error && (
          <div className="bg-red-50 border border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-400 p-4 rounded">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Google Sign-in Button */}
        <div className="mb-6">
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </a>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/admin/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**Key Features:**
- Simple link to `/api/auth/google` (initiates OAuth flow)
- URL parameter handling for error messages
- Combined email/password and OAuth login
- Google branding (official colors)

---

## Security Considerations

### 1. State Parameter (CSRF Protection)

**Problem:** Without state verification, attackers can forge OAuth callbacks.

**Solution:**
```typescript
// Store random state in database
const state = crypto.randomUUID()
await prisma.oAuthState.create({ data: { state, expiresAt } })

// Verify state on callback
const storedState = await prisma.oAuthState.findUnique({ where: { state } })
if (!storedState) {
  return error('State mismatch - possible CSRF attack')
}
```

### 2. Account Takeover Prevention

**Problem:** Attacker creates Google account with victim's email, then links to victim's password account.

**Solution:**
```typescript
// NEVER auto-link OAuth to accounts with passwords
if (existingEmailUser && existingEmailUser.passwordHash) {
  return error('email_exists_with_password')
}
```

### 3. JWT Security

**Best Practices:**
- Use strong secret (32+ characters)
- Set expiration (7 days max)
- Use HS256 algorithm
- Verify on every protected request
- Store in httpOnly cookies (prevent XSS)

### 4. Redirect URI Validation

**Google Console Setup:**
- Only whitelist exact redirect URIs
- Use HTTPS in production
- Never use wildcard redirects

### 5. Email Verification

```typescript
// Trust Google's email verification
emailVerified: payload.email_verified || false
```

Google already verifies emails, so you can trust this flag.

---

## Testing

### Manual Testing Checklist

- [ ] **New Google user signup**
  - Visit `/admin/login`
  - Click "Continue with Google"
  - Select Google account
  - Redirected to onboarding
  - Session cookie set correctly

- [ ] **Existing Google user login**
  - Sign in with previously registered Google account
  - Redirected to dashboard (skip onboarding)
  - Session persists after page refresh

- [ ] **Email exists with password**
  - Create password account with email `test@example.com`
  - Try signing in with Google using same email
  - Should see error: "email exists with password"

- [ ] **OAuth cancellation**
  - Start OAuth flow
  - Cancel on Google consent screen
  - Should redirect with error message

- [ ] **State validation**
  - Initiate OAuth flow
  - Wait 11 minutes (state expires after 10)
  - Try to complete flow
  - Should see "state expired" error

- [ ] **Protected routes**
  - Visit `/admin` without session
  - Should redirect to `/admin/login`
  - Sign in, then access `/admin`
  - Should work

### Automated Testing (Playwright Example)

```typescript
import { test, expect } from '@playwright/test'

test('Google OAuth button exists', async ({ page }) => {
  await page.goto('/admin/login')
  const googleButton = page.locator('a[href="/api/auth/google"]')
  await expect(googleButton).toBeVisible()
  await expect(googleButton).toContainText('Google')
})

test('Protected route redirects when not authenticated', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})
```

---

## Troubleshooting

### Error: "oauth_not_configured"

**Cause:** Missing `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`.

**Fix:** Add environment variables to `.env`.

---

### Error: "oauth_state_mismatch"

**Cause:** State parameter doesn't match database record.

**Possible reasons:**
- Database connection issue
- State expired (10 min timeout)
- Cookie issues (try incognito mode)

**Fix:** Clear cookies, restart server, try again.

---

### Error: "email_exists_with_password"

**Cause:** User has password account, trying to sign in with Google.

**Expected behavior:** This is intentional security feature.

**Fix:** Tell user to sign in with password, or implement account linking flow with password confirmation.

---

### Error: "Redirect URI mismatch"

**Cause:** Redirect URI in code doesn't match Google Console.

**Fix:**
1. Check Google Console: APIs & Services > Credentials
2. Ensure redirect URI exactly matches: `http://localhost:9000/api/auth/google/callback`
3. No trailing slash
4. Correct protocol (http vs https)

---

### Session not persisting

**Cause:** Cookie settings issue.

**Fix:**
```typescript
response.cookies.set(SESSION_COOKIE_NAME, encodeSession(session), {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // ← Must be false in dev
  sameSite: 'lax',
  maxAge: SESSION_DURATION / 1000,
  path: '/',
})
```

---

### Middleware errors in dev mode

**Cause:** JWT_SECRET not loaded in Edge Runtime.

**Fix:**
- Ensure `.env.local` (not just `.env`) exists
- Restart Next.js dev server: `npm run dev`

---

## Production Deployment

### Pre-launch Checklist

- [ ] Set `JWT_SECRET` in production environment
- [ ] Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Add production redirect URI to Google Console:
  ```
  https://yourdomain.com/api/auth/google/callback
  ```
- [ ] Set `secure: true` in cookie settings (automatically set via NODE_ENV)
- [ ] Test OAuth flow on staging environment
- [ ] Verify state cleanup cron job runs (optional)

### Railway Deployment

```bash
# Set environment variables
railway variables set JWT_SECRET="your-production-secret"
railway variables set GOOGLE_CLIENT_ID="your-client-id"
railway variables set GOOGLE_CLIENT_SECRET="your-client-secret"
railway variables set NEXT_PUBLIC_BASE_URL="https://yourdomain.railway.app"

# Deploy
git push railway main
```

---

## Advanced: Account Linking with Password Confirmation

If you want to allow users to link Google accounts to existing password accounts (with security confirmation):

```typescript
// In callback route, instead of blocking:
if (existingEmailUser && existingEmailUser.passwordHash) {
  // Store pending link in database
  await prisma.pendingOAuthLink.create({
    data: {
      adminId: existingEmailUser.id,
      provider: 'google',
      googleId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    }
  })

  // Redirect to password confirmation page
  return NextResponse.redirect(
    new URL('/admin/confirm-link?email=' + encodeURIComponent(email), BASE_URL)
  )
}
```

Then create a confirmation page where user enters password to approve the link.

---

## Summary

This implementation provides:
- ✅ Secure Google OAuth flow
- ✅ Database-backed state storage (CSRF protection)
- ✅ Account takeover prevention
- ✅ JWT session management
- ✅ Edge Runtime compatible middleware
- ✅ Email verification via Google
- ✅ Onboarding flow for new users
- ✅ Support for OAuth-only and password-based users

**Security highlights:**
- State parameter prevents CSRF
- Never auto-links to password accounts
- JWT with strong secret
- httpOnly cookies prevent XSS
- Session expiration enforced

**Developer experience:**
- Simple frontend integration (just link to `/api/auth/google`)
- Clear error handling
- Comprehensive logging
- Easy to test

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [google-auth-library NPM](https://www.npmjs.com/package/google-auth-library)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

---

**Questions or issues?**
- Check Google Cloud Console for OAuth client configuration
- Verify environment variables are set correctly
- Check browser console and server logs for detailed errors
- Test with different Google accounts (existing vs new)

Good luck implementing Google OAuth! 🚀
