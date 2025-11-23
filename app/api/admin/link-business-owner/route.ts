import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * Link a business to a business owner
 * POST /api/admin/link-business-owner
 * Body: { businessId: string, ownerEmail: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, ownerEmail } = body

    if (!businessId || !ownerEmail) {
      return NextResponse.json(
        { error: 'businessId and ownerEmail are required' },
        { status: 400 }
      )
    }

    // Find the business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name_he: true, owner_id: true }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Find the owner by email
    const owner = await prisma.businessOwner.findUnique({
      where: { email: ownerEmail.toLowerCase() },
      select: { id: true, email: true, name: true }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    // Update the business
    await prisma.business.update({
      where: { id: businessId },
      data: { owner_id: owner.id }
    })

    return NextResponse.json({
      success: true,
      message: `Business "${business.name_he}" linked to owner "${owner.name}" (${owner.email})`
    })
  } catch (error) {
    console.error('Error linking business to owner:', error)
    return NextResponse.json(
      { error: 'Failed to link business to owner' },
      { status: 500 }
    )
  }
}

/**
 * GET - List businesses without owners and all owners
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get businesses without owners
    const businessesWithoutOwner = await prisma.business.findMany({
      where: { owner_id: null },
      orderBy: { created_at: 'desc' },
      take: 20,
      select: { id: true, name_he: true, created_at: true }
    })

    // Get all owners
    const owners = await prisma.businessOwner.findMany({
      orderBy: { created_at: 'desc' },
      select: { id: true, email: true, name: true }
    })

    return NextResponse.json({
      businessesWithoutOwner,
      owners
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
