import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PATCH /api/admin/reviews/[id]/flag - Toggle review flag
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id
    const { is_flagged } = await request.json()

    await prisma.review.update({
      where: { id: reviewId },
      data: { is_flagged },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating review flag:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}
