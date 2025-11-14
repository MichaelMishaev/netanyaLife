import { describe, it, expect } from 'vitest'
import { addBusinessSchema } from '@/lib/validations/business'

/**
 * Business Validation Tests
 * CRITICAL: Must validate phone OR whatsapp requirement
 */

describe('Business Validation Schema', () => {
  it('should validate a complete business with phone', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      description: 'Test description',
      phone: '+972-50-123-4567',
      address: 'Test address',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should validate a complete business with whatsapp', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      description: 'Test description',
      whatsappNumber: '+972-50-123-4567',
      address: 'Test address',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should validate a business with both phone and whatsapp', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
      whatsappNumber: '+972-50-765-4321',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should REJECT business without phone AND whatsapp', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      description: 'Test description',
      // NO phone or whatsapp
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('טלפון או מספר ווטסאפ')
    }
  })

  it('should reject business with name shorter than 2 chars', () => {
    const data = {
      name: 'A',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject business without category', () => {
    const data = {
      name: 'Test Business',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject business without neighborhood', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      phone: '+972-50-123-4567',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject invalid website URL', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
      websiteUrl: 'not-a-valid-url',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept valid website URL', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
      websiteUrl: 'https://example.com',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept empty string for website URL', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
      websiteUrl: '',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
      email: 'not-an-email',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept valid email', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
      email: 'test@example.com',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept empty string for email', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
      email: '',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept all optional fields as undefined', () => {
    const data = {
      name: 'Test Business',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      neighborhoodId: '123e4567-e89b-12d3-a456-426614174001',
      phone: '+972-50-123-4567',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
