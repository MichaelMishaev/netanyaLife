'use server'

import { prisma } from '@/lib/prisma'
import { addBusinessSchema } from '@/lib/validations/business'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'

export async function submitPendingBusiness(locale: string, data: any) {
  try {
    // Debug: Log received data
    console.log('🔍 SERVER received data:', {
      name: data.name,
      categoryId: data.categoryId,
      neighborhoodId: data.neighborhoodId,
      phone: data.phone,
      whatsappNumber: data.whatsappNumber,
      servesAllCity: data.servesAllCity,
    })

    // Validate input
    const validated = addBusinessSchema.parse(data)

    // Check for duplicates by name and phone/whatsapp
    const phoneToCheck = validated.phone || validated.whatsappNumber

    if (phoneToCheck) {
      // Check in existing businesses
      const existingBusiness = await prisma.business.findFirst({
        where: {
          AND: [
            {
              OR: [
                {
                  name_he: {
                    equals: validated.name,
                    mode: 'insensitive',
                  },
                },
                {
                  name_ru: {
                    equals: validated.name,
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              OR: [
                { phone: phoneToCheck },
                { whatsapp_number: phoneToCheck },
              ],
            },
          ],
        },
      })

      if (existingBusiness) {
        return {
          success: false,
          error:
            locale === 'he'
              ? 'עסק זה כבר קיים במערכת'
              : 'Этот бизнес уже существует в системе',
        }
      }

      // Check in pending businesses
      const existingPending = await prisma.pendingBusiness.findFirst({
        where: {
          name: {
            equals: validated.name,
            mode: 'insensitive',
          },
          status: 'PENDING',
          OR: [
            { phone: phoneToCheck },
            { whatsapp_number: phoneToCheck },
          ],
        },
      })

      if (existingPending) {
        return {
          success: false,
          error:
            locale === 'he'
              ? 'עסק זה כבר ממתין לאישור במערכת'
              : 'Этот бизнес уже ожидает одобрения в системе',
        }
      }
    }

    // Create pending business
    await prisma.pendingBusiness.create({
      data: {
        // Business Info
        name: validated.name,
        description: validated.description || null,
        language: locale, // 'he' or 'ru'
        category_id: validated.categoryId,
        neighborhood_id: validated.neighborhoodId,

        // Contact Info
        phone: validated.phone || null,
        whatsapp_number: validated.whatsappNumber || null,
        website_url: validated.websiteUrl || null,

        // Location Info
        address: validated.address || null,
        opening_hours: validated.openingHours || null,

        // Service Area
        serves_all_city: validated.servesAllCity || false,

        // Submitter Info
        submitter_name: validated.submitterName || null,
        submitter_email: validated.submitterEmail || null,

        // Status
        status: 'PENDING',
      },
    })

    // Revalidate admin pending page
    revalidatePath(`/admin/pending`)

    return { success: true }
  } catch (error) {
    console.error('❌ Error submitting pending business:', error)

    // Return detailed validation errors
    if (error instanceof ZodError) {
      console.log('📋 Validation errors:', error.issues)

      // Format errors for user display
      const fieldErrors = error.issues.map((issue) => {
        const field = issue.path.join('.')
        return `${field}: ${issue.message}`
      })

      return {
        success: false,
        error:
          locale === 'he'
            ? `שגיאות בטופס:\n${fieldErrors.join('\n')}`
            : `Form errors:\n${fieldErrors.join('\n')}`,
        validationErrors: error.issues.reduce(
          (acc, issue) => {
            const field = issue.path[0] as string
            acc[field] = issue.message
            return acc
          },
          {} as Record<string, string>
        ),
      }
    }

    return {
      success: false,
      error:
        locale === 'he'
          ? 'שגיאה בשליחת הטופס. נסה שוב.'
          : 'Failed to submit business. Please try again.',
    }
  }
}
