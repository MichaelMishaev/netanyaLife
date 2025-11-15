import { z } from 'zod'

/**
 * Business submission validation
 * CRITICAL RULE: Must have at least one contact method (phone OR whatsapp)
 */
export const addBusinessSchema = z
  .object({
    // Business Info
    name: z.string().min(2, 'שם העסק חייב להכיל לפחות 2 תווים'),
    categoryId: z.string().uuid('יש לבחור קטגוריה'),
    neighborhoodId: z.string().uuid('יש לבחור שכונה'),
    description: z.string().optional(),

    // Contact Info
    phone: z.string().optional(),
    whatsappNumber: z.string().optional(),
    websiteUrl: z.string().url('כתובת האתר אינה תקינה').optional().or(z.literal('')),
    email: z.string().email('כתובת הדוא״ל אינה תקינה').optional().or(z.literal('')),

    // Location Info
    address: z.string().optional(),
    openingHours: z.string().optional(),

    // Service Area
    servesAllCity: z.boolean().optional().default(false),

    // Submitter Info (optional)
    submitterName: z.string().optional(),
    submitterEmail: z
      .string()
      .email('כתובת הדוא״ל אינה תקינה')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.phone || data.whatsappNumber, {
    message: 'חובה למלא טלפון או מספר ווטסאפ אחד לפחות',
    path: ['phone'], // Show error on phone field
  })

export type AddBusinessFormData = z.infer<typeof addBusinessSchema>
