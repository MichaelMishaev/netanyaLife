'use server'

import { revalidatePath } from 'next/cache'
import { getOwnerSession } from '@/lib/auth-owner.server'
import prisma from '@/lib/prisma'
import { generateUniqueBusinessSlug } from '@/lib/utils/slug'

/**
 * Get all businesses owned by the current business owner (approved + pending)
 */
export async function getOwnerBusinesses() {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    // Fetch approved businesses
    const businesses = await prisma.business.findMany({
      where: {
        owner_id: session.userId,
        deleted_at: null,
      },
      include: {
        category: true,
        neighborhood: true,
        reviews: {
          where: { is_approved: true },
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Fetch pending and rejected businesses submitted by owner
    const pendingBusinesses = await prisma.pendingBusiness.findMany({
      where: {
        owner_id: session.userId,
        status: { in: ['PENDING', 'REJECTED'] },
      },
      include: {
        category: true,
        neighborhood: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Calculate average rating for approved businesses
    const businessesWithStats = businesses.map((business) => {
      const totalReviews = business.reviews.length
      const averageRating =
        totalReviews > 0
          ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0

      return {
        id: business.id,
        name_he: business.name_he,
        name_ru: business.name_ru,
        slug_he: business.slug_he,
        category: {
          name_he: business.category?.name_he || '',
          name_ru: business.category?.name_ru || '',
        },
        neighborhood: {
          name_he: business.neighborhood.name_he,
          name_ru: business.neighborhood.name_ru,
        },
        is_visible: business.is_visible,
        is_verified: business.is_verified,
        averageRating,
        totalReviews,
        status: 'approved' as const,
        created_at: business.created_at,
      }
    })

    // Format pending and rejected businesses
    const pendingWithInfo = pendingBusinesses.map((pending) => ({
      id: pending.id,
      name_he: pending.name,
      name_ru: null,
      slug_he: null,
      category: {
        name_he: pending.category?.name_he || '',
        name_ru: pending.category?.name_ru || '',
      },
      neighborhood: {
        name_he: pending.neighborhood.name_he,
        name_ru: pending.neighborhood.name_ru,
      },
      is_visible: false,
      is_verified: false,
      averageRating: 0,
      totalReviews: 0,
      status: pending.status.toLowerCase() as 'pending' | 'rejected',
      created_at: pending.created_at,
      rejection_reason: pending.rejection_reason,
      reviewed_at: pending.reviewed_at,
    }))

    // Combine approved, pending, and rejected businesses, sort by created_at desc
    const allBusinesses = [...businessesWithStats, ...pendingWithInfo].sort(
      (a, b) => {
        const aDate = new Date(a.created_at).getTime()
        const bDate = new Date(b.created_at).getTime()
        return bDate - aDate
      }
    )

    return { success: true, businesses: allBusinesses }
  } catch (error) {
    console.error('Error fetching owner businesses:', error)
    return { error: 'Failed to fetch businesses' }
  }
}

/**
 * Get business details for editing (verify ownership)
 */
export async function getBusinessForEdit(businessId: string) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        category: true,
        subcategory: true,
        neighborhood: true,
        city_id_fk: true,
      },
    })

    if (!business) {
      return { error: 'Business not found' }
    }

    // Verify ownership
    if (business.owner_id !== session.userId) {
      return { error: 'You do not have permission to edit this business' }
    }

    // Check if there's already a pending edit
    const pendingEdit = await prisma.pendingBusinessEdit.findFirst({
      where: {
        business_id: businessId,
        owner_id: session.userId,
        status: 'PENDING',
      },
    })

    return { success: true, business, pendingEdit }
  } catch (error) {
    console.error('Error fetching business for edit:', error)
    return { error: 'Failed to fetch business' }
  }
}

/**
 * Update business details (creates pending edit for admin approval)
 */
export async function updateBusinessDetails(
  businessId: string,
  data: {
    description_he?: string
    description_ru?: string
    phone?: string
    whatsapp_number?: string
    website_url?: string
    email?: string
    opening_hours_he?: string
    opening_hours_ru?: string
    address_he?: string
    address_ru?: string
  }
) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { owner_id: true },
    })

    if (!business) {
      return { error: 'Business not found' }
    }

    if (business.owner_id !== session.userId) {
      return { error: 'You do not have permission to edit this business' }
    }

    // Validate: At least one of phone OR whatsapp_number must be provided
    if (!data.phone && !data.whatsapp_number) {
      return { error: 'At least one contact method (phone or WhatsApp) is required' }
    }

    // Check if there's already a pending edit for this business
    const existingPendingEdit = await prisma.pendingBusinessEdit.findFirst({
      where: {
        business_id: businessId,
        owner_id: session.userId,
        status: 'PENDING',
      },
    })

    if (existingPendingEdit) {
      // Update existing pending edit
      await prisma.pendingBusinessEdit.update({
        where: { id: existingPendingEdit.id },
        data: {
          description_he: data.description_he,
          description_ru: data.description_ru,
          phone: data.phone || null,
          whatsapp_number: data.whatsapp_number || null,
          website_url: data.website_url || null,
          email: data.email || null,
          opening_hours_he: data.opening_hours_he || null,
          opening_hours_ru: data.opening_hours_ru || null,
          address_he: data.address_he || null,
          address_ru: data.address_ru || null,
          updated_at: new Date(),
        },
      })
    } else {
      // Create new pending edit
      await prisma.pendingBusinessEdit.create({
        data: {
          business_id: businessId,
          owner_id: session.userId,
          description_he: data.description_he,
          description_ru: data.description_ru,
          phone: data.phone || null,
          whatsapp_number: data.whatsapp_number || null,
          website_url: data.website_url || null,
          email: data.email || null,
          opening_hours_he: data.opening_hours_he || null,
          opening_hours_ru: data.opening_hours_ru || null,
          address_he: data.address_he || null,
          address_ru: data.address_ru || null,
          status: 'PENDING',
        },
      })
    }

    revalidatePath(`/[locale]/business-portal`)
    revalidatePath(`/[locale]/admin/pending-edits`)

    return { success: true, isPending: true }
  } catch (error) {
    console.error('Error creating pending edit:', error)
    return { error: 'Failed to submit edit for approval' }
  }
}

/**
 * Get business stats (views, clicks, reviews)
 */
export async function getBusinessStats(businessId: string) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { owner_id: true },
    })

    if (!business) {
      return { error: 'Business not found' }
    }

    if (business.owner_id !== session.userId) {
      return { error: 'You do not have permission to view these stats' }
    }

    // Get view count
    const viewCount = await prisma.event.count({
      where: {
        business_id: businessId,
        type: 'BUSINESS_VIEWED',
      },
    })

    // Get CTA click count
    const ctaClickCount = await prisma.event.count({
      where: {
        business_id: businessId,
        type: 'CTA_CLICKED',
      },
    })

    // Get reviews count and average rating
    const reviews = await prisma.review.findMany({
      where: {
        business_id: businessId,
        is_approved: true,
      },
      select: {
        rating: true,
      },
    })

    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0

    return {
      success: true,
      stats: {
        views: viewCount,
        ctaClicks: ctaClickCount,
        totalReviews,
        averageRating: averageRating.toFixed(1),
      },
    }
  } catch (error) {
    console.error('Error fetching business stats:', error)
    return { error: 'Failed to fetch stats' }
  }
}

/**
 * Create a new business for the owner (requires admin approval)
 */
export async function createOwnerBusiness(data: {
  name_he: string
  name_ru?: string
  description_he?: string
  description_ru?: string
  category_id: string
  subcategory_id?: string
  neighborhood_id: string
  city_id: string
  phone?: string
  whatsapp_number?: string
  website_url?: string
  email?: string
  opening_hours_he?: string
  opening_hours_ru?: string
  address_he?: string
  address_ru?: string
  serves_all_city?: boolean
}) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    // Validation: At least one of phone OR whatsapp_number must be provided
    if (!data.phone && !data.whatsapp_number) {
      return { error: 'At least one contact method (phone or WhatsApp) is required' }
    }

    // Validate business owner exists (critical check to prevent foreign key errors)
    const ownerExists = await prisma.businessOwner.findUnique({
      where: { id: session.userId },
    })

    if (!ownerExists) {
      return {
        error: 'Your business owner account is missing from the database. Please log out, clear your cookies, and register a new account.'
      }
    }

    // Validate category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.category_id },
    })

    if (!categoryExists) {
      return { error: 'Invalid category selected. Please refresh the page and try again.' }
    }

    // Validate subcategory exists (if provided)
    if (data.subcategory_id) {
      const subcategoryExists = await prisma.subcategory.findUnique({
        where: { id: data.subcategory_id },
      })

      if (!subcategoryExists) {
        return { error: 'Invalid subcategory selected. Please refresh the page and try again.' }
      }
    }

    // Validate neighborhood exists
    const neighborhoodExists = await prisma.neighborhood.findUnique({
      where: { id: data.neighborhood_id },
    })

    if (!neighborhoodExists) {
      return { error: 'Invalid neighborhood selected. Please refresh the page and try again.' }
    }

    // Get owner details for submitter info
    const owner = await prisma.businessOwner.findUnique({
      where: { id: session.userId },
      select: { email: true, phone: true },
    })

    // Create pending business (requires admin approval)
    // NOTE: PendingBusiness uses single-language fields, not bilingual
    const pendingBusiness = await prisma.pendingBusiness.create({
      data: {
        name: data.name_he, // Primary name (Hebrew)
        description: data.description_he || null,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id || null,
        neighborhood_id: data.neighborhood_id,
        phone: data.phone || null,
        whatsapp_number: data.whatsapp_number || null,
        website_url: data.website_url || null,
        email: data.email || null,
        opening_hours: data.opening_hours_he || null,
        address: data.address_he || null,
        serves_all_city: data.serves_all_city || false,
        submitter_email: owner?.email || null,
        submitter_phone: owner?.phone || null,
        owner_id: session.userId, // Link to business owner for tracking
        status: 'PENDING',
        language: 'he', // Hebrew as default
      },
    })

    revalidatePath('/[locale]/business-portal')
    revalidatePath('/admin/pending')

    return { success: true, pendingBusinessId: pendingBusiness.id }
  } catch (error) {
    console.error('Error creating pending business:', error)

    // Parse Prisma errors for user-friendly messages
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[]; field_name?: string } }

      // Handle specific Prisma error codes
      if (prismaError.code === 'P2002') {
        return { error: 'A business with similar details already exists. Please check your information.' }
      } else if (prismaError.code === 'P2003') {
        const target = prismaError.meta?.target?.[0] || prismaError.meta?.field_name
        console.error('P2003 Foreign key constraint failed. Target:', target, 'Full error:', error)

        if (target === 'category_id' || target?.includes('category')) {
          return { error: 'Invalid category. Please refresh the page and select a valid category.' }
        } else if (target === 'subcategory_id' || target?.includes('subcategory')) {
          return { error: 'Invalid subcategory. Please refresh the page and select a valid subcategory.' }
        } else if (target === 'neighborhood_id' || target?.includes('neighborhood')) {
          return { error: 'Invalid neighborhood. Please refresh the page and select a valid neighborhood.' }
        } else if (target === 'owner_id' || target?.includes('owner')) {
          return { error: 'Your account session is invalid. Please log out and log in again.' }
        }
        // Include target field name in error for debugging
        return { error: `Invalid selection (${target || 'unknown'}). Please refresh the page and try again.` }
      } else if (prismaError.code === 'P2000') {
        return { error: 'One or more fields contain too much text. Please shorten your input.' }
      } else if (prismaError.code === 'P2001') {
        return { error: 'Required data is missing. Please fill in all required fields.' }
      }
    }

    return { error: 'Failed to create business. Please try again or contact support if the problem persists.' }
  }
}

/**
 * Get rejected pending business for resubmission (verify ownership)
 */
export async function getRejectedPendingBusiness(pendingId: string) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    const pendingBusiness = await prisma.pendingBusiness.findUnique({
      where: { id: pendingId },
      include: {
        category: true,
        subcategory: true,
        neighborhood: true,
      },
    })

    if (!pendingBusiness) {
      return { error: 'Business not found' }
    }

    // Verify ownership
    if (pendingBusiness.owner_id !== session.userId) {
      return { error: 'You do not have permission to edit this business' }
    }

    // Only allow editing rejected businesses
    if (pendingBusiness.status !== 'REJECTED') {
      return { error: 'This business is not rejected' }
    }

    return { success: true, business: pendingBusiness }
  } catch (error) {
    console.error('Error fetching rejected pending business:', error)
    return { error: 'Failed to fetch business' }
  }
}

/**
 * Resubmit a rejected pending business with updates
 */
export async function resubmitPendingBusiness(
  pendingId: string,
  data: {
    name?: string
    description?: string
    category_id?: string
    subcategory_id?: string
    neighborhood_id?: string
    phone?: string
    whatsapp_number?: string
    website_url?: string
    email?: string
    opening_hours?: string
    address?: string
    serves_all_city?: boolean
  }
) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    // Verify ownership and status
    const pendingBusiness = await prisma.pendingBusiness.findUnique({
      where: { id: pendingId },
      select: { owner_id: true, status: true },
    })

    if (!pendingBusiness) {
      return { error: 'Business not found' }
    }

    if (pendingBusiness.owner_id !== session.userId) {
      return { error: 'You do not have permission to edit this business' }
    }

    if (pendingBusiness.status !== 'REJECTED') {
      return { error: 'This business is not rejected' }
    }

    // Validation: At least one of phone OR whatsapp_number must be provided
    if (!data.phone && !data.whatsapp_number) {
      return { error: 'At least one contact method (phone or WhatsApp) is required' }
    }

    // Update pending business and reset status to PENDING
    await prisma.pendingBusiness.update({
      where: { id: pendingId },
      data: {
        name: data.name,
        description: data.description || null,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id || null,
        neighborhood_id: data.neighborhood_id,
        phone: data.phone || null,
        whatsapp_number: data.whatsapp_number || null,
        website_url: data.website_url || null,
        email: data.email || null,
        opening_hours: data.opening_hours || null,
        address: data.address || null,
        serves_all_city: data.serves_all_city || false,
        status: 'PENDING', // Reset to pending
        rejection_reason: null, // Clear rejection reason
        reviewed_at: null, // Clear review timestamp
        reviewed_by: null, // Clear reviewer
        updated_at: new Date(),
      },
    })

    revalidatePath('/[locale]/business-portal')
    revalidatePath('/[locale]/admin/pending')

    return { success: true }
  } catch (error) {
    console.error('Error resubmitting pending business:', error)
    return { error: 'Failed to resubmit business' }
  }
}

/**
 * Get pending edits for owner's businesses (for notification/status display)
 */
export async function getOwnerPendingEdits() {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    const pendingEdits = await prisma.pendingBusinessEdit.findMany({
      where: {
        owner_id: session.userId,
        status: { in: ['PENDING', 'REJECTED'] }, // Include pending and rejected
      },
      include: {
        business: {
          select: {
            id: true,
            name_he: true,
            name_ru: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return { success: true, edits: pendingEdits }
  } catch (error) {
    console.error('Error fetching pending edits:', error)
    return { error: 'Failed to fetch pending edits' }
  }
}

/**
 * Dismiss a rejected edit (remove it from the list)
 */
export async function dismissRejectedEdit(businessId: string) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    // Find the rejected edit for this business
    const rejectedEdit = await prisma.pendingBusinessEdit.findFirst({
      where: {
        business_id: businessId,
        owner_id: session.userId,
        status: 'REJECTED',
      },
    })

    if (!rejectedEdit) {
      return { error: 'No rejected edit found' }
    }

    // Delete the rejected edit record
    await prisma.pendingBusinessEdit.delete({
      where: { id: rejectedEdit.id },
    })

    revalidatePath('/[locale]/business-portal')

    return { success: true }
  } catch (error) {
    console.error('Error dismissing rejected edit:', error)
    return { error: 'Failed to dismiss rejected edit' }
  }
}
