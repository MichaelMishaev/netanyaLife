'use server'

import {
  verifyAdminCredentials,
  createSession,
  setSessionCookie,
  deleteSessionCookie,
} from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function adminLogin(locale: string, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  const user = await verifyAdminCredentials(email, password)

  if (!user) {
    return { success: false, error: 'Invalid credentials' }
  }

  // Create session
  const token = await createSession(user)
  await setSessionCookie(token)

  // Redirect to admin dashboard
  redirect(`/${locale}/admin`)
}

export async function adminLogout(locale: string) {
  await deleteSessionCookie()
  redirect(`/${locale}/admin-login`)
}
