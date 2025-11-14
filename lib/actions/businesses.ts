'use server'

import { prisma } from '@/lib/prisma'
import { addBusinessSchema } from '@/lib/validations/business'
import { revalidatePath } from 'next/cache'

export async function submitPendingBusiness(locale: string, data: any) {
  try {
    // Validate input
    const validated = addBusinessSchema.parse(data)

    // Create pending business
    await prisma.pendingBusiness.create({
      data: {
        // Business Info (bilingual)
        name_he: locale === 'he' ? validated.name : null,
        name_ru: locale === 'ru' ? validated.name : null,
        category_id: validated.categoryId,
        neighborhood_id: validated.neighborhoodId,
        description_he: locale === 'he' ? validated.description || null : null,
        description_ru: locale === 'ru' ? validated.description || null : null,

        // Contact Info
        phone: validated.phone || null,
        whatsapp_number: validated.whatsappNumber || null,
        website_url: validated.websiteUrl || null,
        email: validated.email || null,

        // Location Info (bilingual)
        address_he: locale === 'he' ? validated.address || null : null,
        address_ru: locale === 'ru' ? validated.address || null : null,
        opening_hours_he:
          locale === 'he' ? validated.openingHours || null : null,
        opening_hours_ru:
          locale === 'ru' ? validated.openingHours || null : null,

        // Submitter Info
        submitter_name: validated.submitterName || null,
        submitter_email: validated.submitterEmail || null,

        // Status
        status: 'pending',
      },
    })

    // Revalidate admin pending page
    revalidatePath(`/admin/pending`)

    return { success: true }
  } catch (error) {
    console.error('Error submitting pending business:', error)

    // Return validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Validation failed',
        details: error.message,
      }
    }

    return { success: false, error: 'Failed to submit business' }
  }
}
