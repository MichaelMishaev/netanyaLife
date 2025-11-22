import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// DELETE /api/admin/reviews/[id] - Delete a review
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id

    await prisma.review.delete({
      where: { id: reviewId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
