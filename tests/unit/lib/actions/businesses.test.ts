import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { submitPendingBusiness } from '@/lib/actions/businesses'

/**
 * Pending Business Submission Tests
 * Tests the public business submission functionality
 */

const prisma = new PrismaClient()

describe('Pending Business Submission', () => {
  let testCategoryId: string
  let testNeighborhoodId: string

  beforeAll(async () => {
    // Get test category and neighborhood from seeded database
    const category = await prisma.category.findFirst({
      where: { is_active: true },
    })
    const neighborhood = await prisma.neighborhood.findFirst()

    if (!category || !neighborhood) {
      throw new Error('No test data found. Run seed first.')
    }

    testCategoryId = category.id
    testNeighborhoodId = neighborhood.id
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should submit a pending business in Hebrew with phone', async () => {
    const data = {
      name: 'עסק בדיקה',
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      description: 'תיאור בדיקה',
      phone: '+972-50-123-4567',
      address: 'כתובת בדיקה',
    }

    const result = await submitPendingBusiness('he', data)
    expect(result.success).toBe(true)

    // Verify the pending business was created
    const pending = await prisma.pendingBusiness.findFirst({
      where: {
        name_he: 'עסק בדיקה',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(pending).toBeDefined()
    expect(pending?.name_he).toBe('עסק בדיקה')
    expect(pending?.name_ru).toBeNull()
    expect(pending?.description_he).toBe('תיאור בדיקה')
    expect(pending?.phone).toBe('+972-50-123-4567')
    expect(pending?.status).toBe('pending')

    // Cleanup
    if (pending) {
      await prisma.pendingBusiness.delete({ where: { id: pending.id } })
    }
  })

  it('should submit a pending business in Russian with whatsapp', async () => {
    const data = {
      name: 'Тестовый бизнес',
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      description: 'Тестовое описание',
      whatsappNumber: '+972-50-765-4321',
      address: 'Тестовый адрес',
    }

    const result = await submitPendingBusiness('ru', data)
    expect(result.success).toBe(true)

    // Verify the pending business was created
    const pending = await prisma.pendingBusiness.findFirst({
      where: {
        name_ru: 'Тестовый бизнес',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(pending).toBeDefined()
    expect(pending?.name_ru).toBe('Тестовый бизнес')
    expect(pending?.name_he).toBeNull()
    expect(pending?.description_ru).toBe('Тестовое описание')
    expect(pending?.whatsapp_number).toBe('+972-50-765-4321')
    expect(pending?.status).toBe('pending')

    // Cleanup
    if (pending) {
      await prisma.pendingBusiness.delete({ where: { id: pending.id } })
    }
  })

  it('should submit with both phone and whatsapp', async () => {
    const data = {
      name: 'Test Business',
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      phone: '+972-50-111-1111',
      whatsappNumber: '+972-50-222-2222',
    }

    const result = await submitPendingBusiness('he', data)
    expect(result.success).toBe(true)

    const pending = await prisma.pendingBusiness.findFirst({
      where: {
        phone: '+972-50-111-1111',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(pending?.phone).toBe('+972-50-111-1111')
    expect(pending?.whatsapp_number).toBe('+972-50-222-2222')

    // Cleanup
    if (pending) {
      await prisma.pendingBusiness.delete({ where: { id: pending.id } })
    }
  })

  it('should submit with submitter info', async () => {
    const data = {
      name: 'Test Business',
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      phone: '+972-50-123-4567',
      submitterName: 'John Doe',
      submitterEmail: 'john@example.com',
    }

    const result = await submitPendingBusiness('he', data)
    expect(result.success).toBe(true)

    const pending = await prisma.pendingBusiness.findFirst({
      where: {
        submitter_email: 'john@example.com',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(pending?.submitter_name).toBe('John Doe')
    expect(pending?.submitter_email).toBe('john@example.com')

    // Cleanup
    if (pending) {
      await prisma.pendingBusiness.delete({ where: { id: pending.id } })
    }
  })

  it('should submit with all optional fields', async () => {
    const data = {
      name: 'Complete Business',
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      description: 'Full description',
      phone: '+972-50-123-4567',
      whatsappNumber: '+972-50-765-4321',
      websiteUrl: 'https://example.com',
      email: 'business@example.com',
      address: 'Full address',
      openingHours: 'Sun-Thu: 9-17',
      submitterName: 'Jane Doe',
      submitterEmail: 'jane@example.com',
    }

    const result = await submitPendingBusiness('he', data)
    expect(result.success).toBe(true)

    const pending = await prisma.pendingBusiness.findFirst({
      where: {
        website_url: 'https://example.com',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(pending).toBeDefined()
    expect(pending?.email).toBe('business@example.com')
    expect(pending?.website_url).toBe('https://example.com')
    expect(pending?.opening_hours_he).toBe('Sun-Thu: 9-17')

    // Cleanup
    if (pending) {
      await prisma.pendingBusiness.delete({ where: { id: pending.id } })
    }
  })

  it('should REJECT submission without phone or whatsapp', async () => {
    const data = {
      name: 'Invalid Business',
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      // NO phone or whatsapp
    }

    const result = await submitPendingBusiness('he', data)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should reject submission with invalid category ID', async () => {
    const data = {
      name: 'Test Business',
      categoryId: 'invalid-uuid',
      neighborhoodId: testNeighborhoodId,
      phone: '+972-50-123-4567',
    }

    const result = await submitPendingBusiness('he', data)
    expect(result.success).toBe(false)
  })

  it('should reject submission with invalid URL', async () => {
    const data = {
      name: 'Test Business',
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      phone: '+972-50-123-4567',
      websiteUrl: 'not-a-url',
    }

    const result = await submitPendingBusiness('he', data)
    expect(result.success).toBe(false)
  })

  it('should default status to pending', async () => {
    const data = {
      name: 'Status Test',
      categoryId: testCategoryId,
      neighborhoodId: testNeighborhoodId,
      phone: '+972-50-999-9999',
    }

    const result = await submitPendingBusiness('he', data)
    expect(result.success).toBe(true)

    const pending = await prisma.pendingBusiness.findFirst({
      where: {
        phone: '+972-50-999-9999',
      },
      orderBy: { created_at: 'desc' },
    })

    expect(pending?.status).toBe('pending')

    // Cleanup
    if (pending) {
      await prisma.pendingBusiness.delete({ where: { id: pending.id } })
    }
  })
})
