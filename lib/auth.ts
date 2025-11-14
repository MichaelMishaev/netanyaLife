import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'netanya-local-secret-key-change-in-production'
)

const COOKIE_NAME = 'admin-session'

export interface AdminUser {
  id: string
  email: string
}

/**
 * Verify admin credentials and return user if valid
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (!admin) {
      return null
    }

    const isValid = await bcrypt.compare(password, admin.password_hash)

    if (!isValid) {
      return null
    }

    return {
      id: admin.id,
      email: admin.email,
    }
  } catch (error) {
    console.error('Error verifying admin credentials:', error)
    return null
  }
}

/**
 * Create a JWT session token
 */
export async function createSession(user: AdminUser): Promise<string> {
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

/**
 * Verify a JWT session token
 */
export async function verifySession(
  token: string
): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret)

    return {
      id: payload.userId as string,
      email: payload.email as string,
    }
  } catch (error) {
    return null
  }
}

/**
 * Get the current admin user from session cookie
 */
export async function getSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)

    if (!token) {
      return null
    }

    return verifySession(token.value)
  } catch (error) {
    return null
  }
}

/**
 * Set the session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/**
 * Delete the session cookie
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
