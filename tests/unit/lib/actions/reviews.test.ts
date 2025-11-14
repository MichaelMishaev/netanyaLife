import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { submitReview } from '@/lib/actions/reviews'

/**
 * Review Submission Tests
 * Tests the review submission functionality for both Hebrew and Russian
 */

const prisma = new PrismaClient()

describe('Review Submission', () => {
  let testBusinessId: string

  beforeAll(async () => {
    // Get a test business from the seeded database
    const business = await prisma.business.findFirst({
      where: { is_visible: true },
    })

    if (!business) {
      throw new Error('No test business found. Run seed first.')
    }

    testBusinessId = business.id
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should submit a review in Hebrew with all fields', async () => {
    const result = await submitReview(testBusinessId, 'he', {
      rating: 5,
      comment: 'שירות מעולה!',
      authorName: 'יוסי כהן',
    })

    expect(result.success).toBe(true)

    // Verify the review was created
    const review = await prisma.review.findFirst({
      where: {
        business_id: testBusinessId,
        comment_he: 'שירות מעולה!',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(review).toBeDefined()
    expect(review?.rating).toBe(5)
    expect(review?.comment_he).toBe('שירות מעולה!')
    expect(review?.comment_ru).toBeNull()
    expect(review?.author_name).toBe('יוסי כהן')
    expect(review?.language).toBe('he')
    expect(review?.is_approved).toBe(true)

    // Cleanup
    if (review) {
      await prisma.review.delete({ where: { id: review.id } })
    }
  })

  it('should submit a review in Russian with all fields', async () => {
    const result = await submitReview(testBusinessId, 'ru', {
      rating: 4,
      comment: 'Отличный сервис!',
      authorName: 'Иван Петров',
    })

    expect(result.success).toBe(true)

    // Verify the review was created
    const review = await prisma.review.findFirst({
      where: {
        business_id: testBusinessId,
        comment_ru: 'Отличный сервис!',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(review).toBeDefined()
    expect(review?.rating).toBe(4)
    expect(review?.comment_ru).toBe('Отличный сервис!')
    expect(review?.comment_he).toBeNull()
    expect(review?.author_name).toBe('Иван Петров')
    expect(review?.language).toBe('ru')
    expect(review?.is_approved).toBe(true)

    // Cleanup
    if (review) {
      await prisma.review.delete({ where: { id: review.id } })
    }
  })

  it('should submit a review with only rating (no comment)', async () => {
    const result = await submitReview(testBusinessId, 'he', {
      rating: 3,
    })

    expect(result.success).toBe(true)

    // Verify the review was created
    const review = await prisma.review.findFirst({
      where: {
        business_id: testBusinessId,
        rating: 3,
      },
      orderBy: { created_at: 'desc' },
    })

    expect(review).toBeDefined()
    expect(review?.rating).toBe(3)
    expect(review?.comment_he).toBeNull()
    expect(review?.comment_ru).toBeNull()
    expect(review?.author_name).toBeNull()

    // Cleanup
    if (review) {
      await prisma.review.delete({ where: { id: review.id } })
    }
  })

  it('should submit an anonymous review (no author name)', async () => {
    const result = await submitReview(testBusinessId, 'he', {
      rating: 5,
      comment: 'אנונימי',
    })

    expect(result.success).toBe(true)

    // Verify the review was created
    const review = await prisma.review.findFirst({
      where: {
        business_id: testBusinessId,
        comment_he: 'אנונימי',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(review).toBeDefined()
    expect(review?.author_name).toBeNull()

    // Cleanup
    if (review) {
      await prisma.review.delete({ where: { id: review.id } })
    }
  })

  it('should reject invalid rating (0)', async () => {
    const result = await submitReview(testBusinessId, 'he', {
      rating: 0,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should reject invalid rating (6)', async () => {
    const result = await submitReview(testBusinessId, 'he', {
      rating: 6,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should reject invalid rating (negative)', async () => {
    const result = await submitReview(testBusinessId, 'he', {
      rating: -1,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should handle non-existent business ID gracefully', async () => {
    const result = await submitReview(
      '00000000-0000-0000-0000-000000000000',
      'he',
      {
        rating: 5,
      }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should auto-approve all reviews', async () => {
    const result = await submitReview(testBusinessId, 'he', {
      rating: 4,
    })

    expect(result.success).toBe(true)

    const review = await prisma.review.findFirst({
      where: {
        business_id: testBusinessId,
        rating: 4,
      },
      orderBy: { created_at: 'desc' },
    })

    expect(review?.is_approved).toBe(true)

    // Cleanup
    if (review) {
      await prisma.review.delete({ where: { id: review.id } })
    }
  })
})
