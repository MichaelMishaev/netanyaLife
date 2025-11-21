import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createOwnerSession } from '@/lib/auth-owner.server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, redirectTo } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingOwner = await prisma.businessOwner.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingOwner) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create business owner
    const businessOwner = await prisma.businessOwner.create({
      data: {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name,
        is_active: true,
        is_verified: false, // Email verification required (future feature)
      },
    })

    // Create session
    await createOwnerSession(businessOwner.id, businessOwner.email, businessOwner.name)

    // Redirect to requested page or default to business portal
    const redirect = redirectTo || '/he/business-portal'

    return NextResponse.json(
      {
        success: true,
        redirect,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Business owner registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
