'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

/**
 * Approve a pending business and create it as an active business
 */
export async function approvePendingBusiness(pendingId: string, locale: string) {
  // Check authentication
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const pending = await prisma.pendingBusiness.findUnique({
      where: { id: pendingId },
      include: {
        neighborhood: {
          select: {
            city_id: true,
          },
        },
      },
    })

    if (!pending) {
      return { success: false, error: 'Pending business not found' }
    }

    // Create the business - map language-specific fields
    await prisma.business.create({
      data: {
        name_he: pending.language === 'he' ? pending.name : '',
        name_ru: pending.language === 'ru' ? pending.name : null,
        slug_he:
          pending.language === 'he'
            ? pending.name.toLowerCase().replace(/\s+/g, '-')
            : pending.name.toLowerCase().replace(/\s+/g, '-'),
        slug_ru:
          pending.language === 'ru'
            ? pending.name.toLowerCase().replace(/\s+/g, '-')
            : null,
        city_id: pending.neighborhood.city_id,
        category_id: pending.category_id,
        neighborhood_id: pending.neighborhood_id,
        description_he: pending.language === 'he' ? pending.description : null,
        description_ru: pending.language === 'ru' ? pending.description : null,
        phone: pending.phone,
        whatsapp_number: pending.whatsapp_number,
        website_url: pending.website_url,
        email: pending.email,
        address_he: pending.language === 'he' ? pending.address : null,
        address_ru: pending.language === 'ru' ? pending.address : null,
        opening_hours_he:
          pending.language === 'he' ? pending.opening_hours : null,
        opening_hours_ru:
          pending.language === 'ru' ? pending.opening_hours : null,
        is_visible: true,
        is_verified: false,
        is_pinned: false,
      },
    })

    // Update pending status
    await prisma.pendingBusiness.update({
      where: { id: pendingId },
      data: { status: 'APPROVED' },
    })

    revalidatePath(`/${locale}/admin/pending`)
    revalidatePath(`/${locale}/admin`)

    return { success: true }
  } catch (error) {
    console.error('Error approving pending business:', error)
    return { success: false, error: 'Failed to approve business' }
  }
}

/**
 * Reject a pending business
 */
export async function rejectPendingBusiness(pendingId: string, locale: string) {
  // Check authentication
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.pendingBusiness.update({
      where: { id: pendingId },
      data: { status: 'REJECTED' },
    })

    revalidatePath(`/${locale}/admin/pending`)
    revalidatePath(`/${locale}/admin`)

    return { success: true }
  } catch (error) {
    console.error('Error rejecting pending business:', error)
    return { success: false, error: 'Failed to reject business' }
  }
}

/**
 * Toggle business visibility
 */
export async function toggleBusinessVisibility(
  businessId: string,
  locale: string
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return { success: false, error: 'Business not found' }
    }

    await prisma.business.update({
      where: { id: businessId },
      data: { is_visible: !business.is_visible },
    })

    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/admin`)

    return { success: true }
  } catch (error) {
    console.error('Error toggling business visibility:', error)
    return { success: false, error: 'Failed to update business' }
  }
}

/**
 * Toggle business verification
 */
export async function toggleBusinessVerification(
  businessId: string,
  locale: string
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return { success: false, error: 'Business not found' }
    }

    await prisma.business.update({
      where: { id: businessId },
      data: { is_verified: !business.is_verified },
    })

    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/admin`)

    return { success: true }
  } catch (error) {
    console.error('Error toggling business verification:', error)
    return { success: false, error: 'Failed to update business' }
  }
}

/**
 * Delete business (soft delete)
 */
export async function deleteBusiness(businessId: string, locale: string) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { deleted_at: new Date() },
    })

    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/admin`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting business:', error)
    return { success: false, error: 'Failed to delete business' }
  }
}

/**
 * Toggle business pinning (for featured results)
 */
export async function toggleBusinessPinned(
  businessId: string,
  locale: string
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { is_pinned: true, pinned_order: true },
    })

    if (!business) {
      return { success: false, error: 'Business not found' }
    }

    if (!business.is_pinned) {
      // Pin it: Get max pinned_order and add 1
      const maxPinned = await prisma.business.findFirst({
        where: { is_pinned: true },
        orderBy: { pinned_order: 'desc' },
        select: { pinned_order: true },
      })

      const nextOrder = (maxPinned?.pinned_order || 0) + 1

      await prisma.business.update({
        where: { id: businessId },
        data: {
          is_pinned: true,
          pinned_order: nextOrder,
        },
      })
    } else {
      // Unpin it
      await prisma.business.update({
        where: { id: businessId },
        data: {
          is_pinned: false,
          pinned_order: null,
        },
      })
    }

    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/admin`)
    // Revalidate search pages since pinning affects ordering
    revalidatePath(`/${locale}/search`)

    return { success: true }
  } catch (error) {
    console.error('Error toggling business pinning:', error)
    return { success: false, error: 'Failed to update business' }
  }
}

/**
 * Update admin settings
 */
export async function updateAdminSetting(
  key: string,
  value: string,
  locale: string
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.adminSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    revalidatePath(`/${locale}/admin/settings`)

    return { success: true }
  } catch (error) {
    console.error('Error updating admin setting:', error)
    return { success: false, error: 'Failed to update setting' }
  }
}
