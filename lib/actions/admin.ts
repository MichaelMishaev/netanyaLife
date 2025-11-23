'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { generateUniqueBusinessSlug } from '@/lib/utils/slug'

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

    // Look up business owner by submitter email (if provided)
    let ownerId: string | null = null
    if (pending.submitter_email) {
      const owner = await prisma.businessOwner.findUnique({
        where: { email: pending.submitter_email },
        select: { id: true },
      })
      if (owner) {
        ownerId = owner.id
      }
    }

    // Generate unique slugs for both languages
    const slugHe = await generateUniqueBusinessSlug(pending.name, 'he')
    const slugRu = pending.language === 'ru'
      ? await generateUniqueBusinessSlug(pending.name, 'ru')
      : null

    // Create the business - map language-specific fields
    await prisma.business.create({
      data: {
        name_he: pending.language === 'he' ? pending.name : '',
        name_ru: pending.language === 'ru' ? pending.name : null,
        slug_he: slugHe,
        slug_ru: slugRu,
        city_id: pending.neighborhood.city_id,
        category_id: pending.category_id,
        subcategory_id: pending.subcategory_id || null,
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
        serves_all_city: pending.serves_all_city || false,
        owner_id: ownerId, // Link to business owner if found
      },
    })

    // Update pending status
    await prisma.pendingBusiness.update({
      where: { id: pendingId },
      data: { status: 'APPROVED' },
    })

    // Revalidate admin pages
    revalidatePath(`/${locale}/admin/pending`)
    revalidatePath(`/${locale}/admin`)

    // Revalidate search results page for this category/neighborhood
    // This ensures newly approved businesses show up immediately
    revalidatePath(`/${locale}/search`, 'layout')

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
 * Create category
 */
export async function createCategory(data: {
  name_he: string
  name_ru: string
  slug: string
  icon_name?: string
  description_he?: string
  description_ru?: string
  is_popular?: boolean
  display_order: number
  locale: string
}) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.category.create({
      data: {
        name_he: data.name_he,
        name_ru: data.name_ru,
        slug: data.slug,
        icon_name: data.icon_name || null,
        description_he: data.description_he || null,
        description_ru: data.description_ru || null,
        is_popular: data.is_popular || false,
        is_active: true,
        display_order: data.display_order,
      },
    })

    revalidatePath(`/${data.locale}/admin/categories`)
    revalidatePath(`/${data.locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

/**
 * Update category
 */
export async function updateCategory(
  categoryId: string,
  data: {
    name_he: string
    name_ru: string
    slug: string
    icon_name?: string
    description_he?: string
    description_ru?: string
    is_popular?: boolean
    display_order: number
    locale: string
  }
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name_he: data.name_he,
        name_ru: data.name_ru,
        slug: data.slug,
        icon_name: data.icon_name || null,
        description_he: data.description_he || null,
        description_ru: data.description_ru || null,
        is_popular: data.is_popular || false,
        display_order: data.display_order,
      },
    })

    revalidatePath(`/${data.locale}/admin/categories`)
    revalidatePath(`/${data.locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

/**
 * Toggle category active status
 */
export async function toggleCategoryActive(categoryId: string, locale: string) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { is_active: true },
    })

    if (!category) {
      return { success: false, error: 'Category not found' }
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { is_active: !category.is_active },
    })

    revalidatePath(`/${locale}/admin/categories`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error toggling category:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

/**
 * Delete category
 */
export async function deleteCategory(categoryId: string, locale: string) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Check if category has businesses
    const count = await prisma.business.count({
      where: { category_id: categoryId },
    })

    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${count} businesses`,
      }
    }

    await prisma.category.delete({
      where: { id: categoryId },
    })

    revalidatePath(`/${locale}/admin/categories`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

/**
 * Create neighborhood
 */
export async function createNeighborhood(data: {
  city_id: string
  name_he: string
  name_ru: string
  slug: string
  description_he?: string
  description_ru?: string
  display_order: number
  locale: string
}) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.neighborhood.create({
      data: {
        city_id: data.city_id,
        name_he: data.name_he,
        name_ru: data.name_ru,
        slug: data.slug,
        description_he: data.description_he || null,
        description_ru: data.description_ru || null,
        is_active: true,
        display_order: data.display_order,
      },
    })

    revalidatePath(`/${data.locale}/admin/neighborhoods`)
    revalidatePath(`/${data.locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error creating neighborhood:', error)
    return { success: false, error: 'Failed to create neighborhood' }
  }
}

/**
 * Update neighborhood
 */
export async function updateNeighborhood(
  neighborhoodId: string,
  data: {
    name_he: string
    name_ru: string
    slug: string
    description_he?: string
    description_ru?: string
    display_order: number
    locale: string
  }
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.neighborhood.update({
      where: { id: neighborhoodId },
      data: {
        name_he: data.name_he,
        name_ru: data.name_ru,
        slug: data.slug,
        description_he: data.description_he || null,
        description_ru: data.description_ru || null,
        display_order: data.display_order,
      },
    })

    revalidatePath(`/${data.locale}/admin/neighborhoods`)
    revalidatePath(`/${data.locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating neighborhood:', error)
    return { success: false, error: 'Failed to update neighborhood' }
  }
}

/**
 * Toggle neighborhood active status
 */
export async function toggleNeighborhoodActive(
  neighborhoodId: string,
  locale: string
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id: neighborhoodId },
      select: { is_active: true },
    })

    if (!neighborhood) {
      return { success: false, error: 'Neighborhood not found' }
    }

    await prisma.neighborhood.update({
      where: { id: neighborhoodId },
      data: { is_active: !neighborhood.is_active },
    })

    revalidatePath(`/${locale}/admin/neighborhoods`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error toggling neighborhood:', error)
    return { success: false, error: 'Failed to update neighborhood' }
  }
}

/**
 * Delete neighborhood
 */
export async function deleteNeighborhood(neighborhoodId: string, locale: string) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Check if neighborhood has businesses
    const count = await prisma.business.count({
      where: { neighborhood_id: neighborhoodId },
    })

    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete neighborhood with ${count} businesses`,
      }
    }

    await prisma.neighborhood.delete({
      where: { id: neighborhoodId },
    })

    revalidatePath(`/${locale}/admin/neighborhoods`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting neighborhood:', error)
    return { success: false, error: 'Failed to delete neighborhood' }
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

/**
 * Create business directly (admin only - bypasses pending queue)
 */
export async function createBusiness(locale: string, data: any) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Validate required fields
    if (!data.name || !data.categoryId || !data.neighborhoodId) {
      return { success: false, error: 'Missing required fields' }
    }

    // At least phone or whatsapp required
    if (!data.phone && !data.whatsappNumber) {
      return {
        success: false,
        error:
          locale === 'he'
            ? 'חובה למלא טלפון או מספר ווטסאפ אחד לפחות'
            : 'Требуется телефон или WhatsApp',
      }
    }

    // Get neighborhood to get city_id
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id: data.neighborhoodId },
      select: { city_id: true },
    })

    if (!neighborhood) {
      return { success: false, error: 'Neighborhood not found' }
    }

    // Generate unique slugs for both languages
    const slugHe = await generateUniqueBusinessSlug(data.name, 'he')
    const slugRu = locale === 'ru'
      ? await generateUniqueBusinessSlug(data.name, 'ru')
      : null

    // Create the business
    await prisma.business.create({
      data: {
        name_he: locale === 'he' ? data.name : '',
        name_ru: locale === 'ru' ? data.name : null,
        slug_he: slugHe,
        slug_ru: slugRu,
        city_id: neighborhood.city_id,
        category_id: data.categoryId,
        subcategory_id: data.subcategoryId || null,
        neighborhood_id: data.neighborhoodId,
        description_he: locale === 'he' && data.description ? data.description : null,
        description_ru: locale === 'ru' && data.description ? data.description : null,
        phone: data.phone || null,
        whatsapp_number: data.whatsappNumber || null,
        website_url: data.websiteUrl || null,
        email: data.email || null,
        address_he: locale === 'he' && data.address ? data.address : null,
        address_ru: locale === 'ru' && data.address ? data.address : null,
        opening_hours_he:
          locale === 'he' && data.openingHours ? data.openingHours : null,
        opening_hours_ru:
          locale === 'ru' && data.openingHours ? data.openingHours : null,
        is_visible: data.isVisible !== undefined ? data.isVisible : true,
        is_verified: data.isVerified !== undefined ? data.isVerified : false,
        is_pinned: data.isPinned !== undefined ? data.isPinned : false,
        is_test: data.isTest !== undefined ? data.isTest : true,
      },
    })

    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/admin`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error creating business:', error)
    return { success: false, error: 'Failed to create business' }
  }
}

/**
 * Update existing business (admin only)
 */
export async function updateBusiness(businessId: string, locale: string, data: any) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Check if business exists
    const existing = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!existing) {
      return { success: false, error: 'Business not found' }
    }

    // Validate required fields
    if (!data.name_he || !data.categoryId || !data.neighborhoodId) {
      return { success: false, error: 'Missing required fields' }
    }

    // At least phone or whatsapp required
    if (!data.phone && !data.whatsappNumber) {
      return {
        success: false,
        error:
          locale === 'he'
            ? 'חובה למלא טלפון או מספר ווטסאפ אחד לפחות'
            : 'Требуется телефон или WhatsApp',
      }
    }

    // Update the business
    await prisma.business.update({
      where: { id: businessId },
      data: {
        name_he: data.name_he,
        name_ru: data.name_ru || null,
        category_id: data.categoryId,
        subcategory_id: data.subcategoryId || null,
        neighborhood_id: data.neighborhoodId,
        description_he: data.description_he || null,
        description_ru: data.description_ru || null,
        phone: data.phone || null,
        whatsapp_number: data.whatsappNumber || null,
        website_url: data.websiteUrl || null,
        email: data.email || null,
        address_he: data.address_he || null,
        address_ru: data.address_ru || null,
        opening_hours_he: data.opening_hours_he || null,
        opening_hours_ru: data.opening_hours_ru || null,
        is_visible: data.isVisible !== undefined ? data.isVisible : existing.is_visible,
        is_verified: data.isVerified !== undefined ? data.isVerified : existing.is_verified,
        is_pinned: data.isPinned !== undefined ? data.isPinned : existing.is_pinned,
        is_test: data.isTest !== undefined ? data.isTest : existing.is_test,
      },
    })

    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/admin/business-map`)
    revalidatePath(`/${locale}/admin`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating business:', error)
    return { success: false, error: 'Failed to update business' }
  }
}

/**
 * Toggle business test flag
 */
export async function toggleBusinessTest(
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
      select: { is_test: true },
    })

    if (!business) {
      return { success: false, error: 'Business not found' }
    }

    await prisma.business.update({
      where: { id: businessId },
      data: { is_test: !business.is_test },
    })

    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/admin`)

    return { success: true }
  } catch (error) {
    console.error('Error toggling business test flag:', error)
    return { success: false, error: 'Failed to update business' }
  }
}

/**
 * Toggle whether test businesses show on public pages
 */
export async function toggleShowTestOnPublic(locale: string) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const setting = await prisma.adminSettings.findUnique({
      where: { key: 'show_test_on_public' },
    })

    const currentValue = setting?.value === 'true'
    const newValue = !currentValue

    await prisma.adminSettings.upsert({
      where: { key: 'show_test_on_public' },
      update: { value: newValue.toString() },
      create: {
        key: 'show_test_on_public',
        value: newValue.toString(),
        description: 'When true, test businesses will appear on public pages (for testing only)',
      },
    })

    // Revalidate all public pages
    revalidatePath(`/${locale}`)
    revalidatePath(`/${locale}/search`)
    revalidatePath(`/${locale}/admin/businesses`)

    return { success: true, showTestOnPublic: newValue }
  } catch (error) {
    console.error('Error toggling show_test_on_public:', error)
    return { success: false, error: 'Failed to update setting' }
  }
}

/**
 * Get current show_test_on_public setting
 */
export async function getShowTestOnPublic(): Promise<boolean> {
  try {
    const setting = await prisma.adminSettings.findUnique({
      where: { key: 'show_test_on_public' },
    })
    return setting?.value === 'true'
  } catch {
    return false
  }
}

// ============================================================================
// SUBCATEGORY ACTIONS
// ============================================================================

/**
 * Create subcategory
 */
export async function createSubcategory(data: {
  category_id: string
  name_he: string
  name_ru: string
  slug: string
  display_order: number
  locale: string
}) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.subcategory.create({
      data: {
        category_id: data.category_id,
        name_he: data.name_he,
        name_ru: data.name_ru,
        slug: data.slug,
        is_active: true,
        display_order: data.display_order,
      },
    })

    revalidatePath(`/${data.locale}/admin/categories`)
    revalidatePath(`/${data.locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return { success: false, error: 'Failed to create subcategory' }
  }
}

/**
 * Update subcategory
 */
export async function updateSubcategory(
  subcategoryId: string,
  data: {
    name_he: string
    name_ru: string
    slug: string
    display_order: number
    locale: string
  }
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.subcategory.update({
      where: { id: subcategoryId },
      data: {
        name_he: data.name_he,
        name_ru: data.name_ru,
        slug: data.slug,
        display_order: data.display_order,
      },
    })

    revalidatePath(`/${data.locale}/admin/categories`)
    revalidatePath(`/${data.locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating subcategory:', error)
    return { success: false, error: 'Failed to update subcategory' }
  }
}

/**
 * Toggle subcategory active status
 */
export async function toggleSubcategoryActive(subcategoryId: string, locale: string) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
      select: { is_active: true },
    })

    if (!subcategory) {
      return { success: false, error: 'Subcategory not found' }
    }

    await prisma.subcategory.update({
      where: { id: subcategoryId },
      data: { is_active: !subcategory.is_active },
    })

    revalidatePath(`/${locale}/admin/categories`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error toggling subcategory:', error)
    return { success: false, error: 'Failed to update subcategory' }
  }
}

/**
 * Delete subcategory
 */
export async function deleteSubcategory(subcategoryId: string, locale: string) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Check if subcategory has businesses
    const count = await prisma.business.count({
      where: { subcategory_id: subcategoryId },
    })

    if (count > 0) {
      return {
        success: false,
        error: locale === 'he'
          ? `לא ניתן למחוק תת-קטגוריה עם ${count} עסקים`
          : `Невозможно удалить подкатегорию с ${count} бизнесами`,
      }
    }

    await prisma.subcategory.delete({
      where: { id: subcategoryId },
    })

    revalidatePath(`/${locale}/admin/categories`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting subcategory:', error)
    return { success: false, error: 'Failed to delete subcategory' }
  }
}

/**
 * Reorder subcategories
 */
export async function reorderSubcategories(
  categoryId: string,
  subcategoryIds: string[],
  locale: string
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Update display_order for each subcategory
    await Promise.all(
      subcategoryIds.map((id, index) =>
        prisma.subcategory.update({
          where: { id },
          data: { display_order: index + 1 },
        })
      )
    )

    revalidatePath(`/${locale}/admin/categories`)
    revalidatePath(`/${locale}`)

    return { success: true }
  } catch (error) {
    console.error('Error reordering subcategories:', error)
    return { success: false, error: 'Failed to reorder subcategories' }
  }
}

/**
 * Update business subcategory
 */
export async function updateBusinessSubcategory(
  businessId: string,
  subcategoryId: string | null,
  locale: string
) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { category_id: true },
    })

    if (!business) {
      return { success: false, error: 'Business not found' }
    }

    // If subcategoryId is provided, verify it belongs to the business's category
    if (subcategoryId) {
      const subcategory = await prisma.subcategory.findUnique({
        where: { id: subcategoryId },
        select: { category_id: true },
      })

      if (!subcategory || subcategory.category_id !== business.category_id) {
        return {
          success: false,
          error: locale === 'he'
            ? 'תת-קטגוריה לא תואמת לקטגוריה של העסק'
            : 'Подкатегория не соответствует категории бизнеса'
        }
      }
    }

    await prisma.business.update({
      where: { id: businessId },
      data: { subcategory_id: subcategoryId },
    })

    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/admin/business-map`)
    revalidatePath(`/${locale}/admin`)

    return { success: true }
  } catch (error) {
    console.error('Error updating business subcategory:', error)
    return { success: false, error: 'Failed to update business subcategory' }
  }
}

/**
 * Move businesses from one category to another (super admin only)
 */
export async function moveBusinessesToCategory(
  businessIds: string[],
  newCategoryId: string,
  newSubcategoryId: string | null,
  locale: string
) {
  // Check authentication
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify super admin (only super admin can move businesses)
  // session is already an AdminUser from getSession()
  if (session.email !== '345287@gmail.com') {
    return {
      success: false,
      error: locale === 'he'
        ? 'פעולה זו מותרת רק למנהל על'
        : 'Эта операция разрешена только суперадминистратору'
    }
  }

  try {
    // Verify new category exists
    const category = await prisma.category.findUnique({
      where: { id: newCategoryId },
    })

    if (!category) {
      return {
        success: false,
        error: locale === 'he' ? 'קטגוריה לא נמצאה' : 'Категория не найдена'
      }
    }

    // Verify subcategory if provided
    if (newSubcategoryId) {
      const subcategory = await prisma.subcategory.findUnique({
        where: { id: newSubcategoryId },
      })

      if (!subcategory || subcategory.category_id !== newCategoryId) {
        return {
          success: false,
          error: locale === 'he'
            ? 'תת-קטגוריה לא תואמת לקטגוריה'
            : 'Подкатегория не соответствует категории'
        }
      }
    }

    // Move all businesses
    await prisma.business.updateMany({
      where: {
        id: { in: businessIds },
      },
      data: {
        category_id: newCategoryId,
        subcategory_id: newSubcategoryId,
        updated_at: new Date(),
      },
    })

    // Revalidate pages
    revalidatePath(`/${locale}/admin/categories`)
    revalidatePath(`/${locale}/admin/businesses`)
    revalidatePath(`/${locale}/search`, 'layout')

    return {
      success: true,
      message: locale === 'he'
        ? `${businessIds.length} עסקים הועברו בהצלחה`
        : `${businessIds.length} бизнесов успешно перемещено`
    }
  } catch (error) {
    console.error('Error moving businesses to category:', error)
    return {
      success: false,
      error: locale === 'he'
        ? 'שגיאה בהעברת עסקים'
        : 'Ошибка при перемещении бизнесов'
    }
  }
}
