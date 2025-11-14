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
    })

    if (!pending) {
      return { success: false, error: 'Pending business not found' }
    }

    // Create the business
    await prisma.business.create({
      data: {
        name_he: pending.name_he,
        name_ru: pending.name_ru,
        slug_he: pending.name_he
          ? pending.name_he.toLowerCase().replace(/\s+/g, '-')
          : null,
        slug_ru: pending.name_ru
          ? pending.name_ru.toLowerCase().replace(/\s+/g, '-')
          : null,
        category_id: pending.category_id,
        neighborhood_id: pending.neighborhood_id,
        description_he: pending.description_he,
        description_ru: pending.description_ru,
        phone: pending.phone,
        whatsapp_number: pending.whatsapp_number,
        website_url: pending.website_url,
        email: pending.email,
        address_he: pending.address_he,
        address_ru: pending.address_ru,
        opening_hours_he: pending.opening_hours_he,
        opening_hours_ru: pending.opening_hours_ru,
        is_visible: true,
        is_verified: false,
        is_pinned: false,
      },
    })

    // Update pending status
    await prisma.pendingBusiness.update({
      where: { id: pendingId },
      data: { status: 'approved' },
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
      data: { status: 'rejected' },
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
