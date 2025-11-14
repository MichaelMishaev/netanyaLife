'use server'

import { prisma } from '@/lib/prisma'
import { reviewSchema } from '@/lib/validations/review'
import { revalidatePath } from 'next/cache'

export async function submitReview(
  businessId: string,
  locale: string,
  data: { rating: number; comment?: string; authorName?: string }
) {
  try {
    // Validate input
    const validated = reviewSchema.parse(data)

    // Create review
    await prisma.review.create({
      data: {
        business_id: businessId,
        rating: validated.rating,
        comment_he: locale === 'he' ? validated.comment || null : null,
        comment_ru: locale === 'ru' ? validated.comment || null : null,
        author_name: validated.authorName || null,
        language: locale,
        is_approved: true, // Auto-approve for now
      },
    })

    // Revalidate business page
    revalidatePath(`/${locale}/business`)

    return { success: true }
  } catch (error) {
    console.error('Error submitting review:', error)
    return { success: false, error: 'Failed to submit review' }
  }
}
