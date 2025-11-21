import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createOwnerSession } from '@/lib/auth-owner.server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, redirectTo } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find business owner by email
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!businessOwner || !businessOwner.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, businessOwner.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!businessOwner.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      )
    }

    // Update last login
    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: { last_login_at: new Date() },
    })

    // Create session
    await createOwnerSession(businessOwner.id, businessOwner.email, businessOwner.name)

    // Redirect to requested page or default to business portal
    const redirect = redirectTo || '/he/business-portal'

    return NextResponse.json({
      success: true,
      redirect,
    })
  } catch (error) {
    console.error('Business owner login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
