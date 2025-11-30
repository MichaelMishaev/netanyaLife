import { z } from 'zod'

/**
 * Business submission validation
 * CRITICAL RULE: Must have at least one contact method (phone OR whatsapp)
 */
export const addBusinessSchema = z
  .object({
    // Business Info
    name: z.string().min(2, 'שם העסק חייב להכיל לפחות 2 תווים'),
    categoryId: z.string().min(1, 'יש לבחור קטגוריה'),
    subcategoryId: z.string().optional(),
    neighborhoodId: z.string().min(1, 'יש לבחור שכונה'),
    description: z.string().optional(),

    // Contact Info
    phone: z.string().optional(),
    whatsappNumber: z.string().optional(),
    websiteUrl: z
      .string()
      .optional()
      .transform((val) => {
        // Handle empty strings
        if (!val || val.trim() === '') return undefined

        // Trim whitespace
        const trimmed = val.trim()

        // If already has protocol, return as-is
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed
        }

        // Auto-prepend https:// for URLs without protocol
        return `https://${trimmed}`
      })
      .refine(
        (val) => {
          if (!val) return true // Allow empty/undefined

          // Validate URL format
          try {
            new URL(val)
            return true
          } catch {
            return false
          }
        },
        { message: 'כתובת האתר אינה תקינה' }
      ),
    instagramUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),

    // Location Info
    address: z.string().optional(),
    openingHours: z.string().optional(),

    // Service Area
    servesAllCity: z.boolean().optional().default(false),

    // Submitter Info (optional)
    submitterName: z.string().optional(),
    submitterEmail: z
      .string()
      .optional()
      .transform((val) => (!val || val.trim() === '' ? undefined : val.trim()))
      .refine(
        (val) => {
          if (!val) return true // Allow empty/undefined
          // Simple email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        },
        { message: 'כתובת הדוא״ל אינה תקינה' }
      ),
  })
  .refine((data) => data.phone || data.whatsappNumber, {
    message: 'חובה למלא טלפון או מספר ווטסאפ אחד לפחות',
    path: ['phone'], // Show error on phone field
  })

export type AddBusinessFormData = z.infer<typeof addBusinessSchema>
