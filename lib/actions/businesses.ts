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
        email: validated.email || null,

        // Location Info
        address: validated.address || null,
        opening_hours: validated.openingHours || null,

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
