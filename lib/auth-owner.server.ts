import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'

export interface BusinessOwnerSession {
  userId: string
  email: string
  name: string
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

/**
 * Get business owner session from cookie
 */
export async function getOwnerSession(): Promise<BusinessOwnerSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('owner_session')?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    }
  } catch (error) {
    console.error('Error verifying owner session:', error)
    return null
  }
}

/**
 * Create business owner session and set cookie
 */
export async function createOwnerSession(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const token = await new SignJWT({
    userId,
    email,
    name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // 30 days session for business owners
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set({
    name: 'owner_session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return token
}

/**
 * Clear business owner session
 */
export async function clearOwnerSession() {
  const cookieStore = await cookies()
  cookieStore.delete('owner_session')
}
