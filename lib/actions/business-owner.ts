'use server'

import { revalidatePath } from 'next/cache'
import { getOwnerSession } from '@/lib/auth-owner.server'
import prisma from '@/lib/prisma'
import { generateUniqueBusinessSlug } from '@/lib/utils/slug'

/**
 * Get all businesses owned by the current business owner
 */
export async function getOwnerBusinesses() {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

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

    // Calculate average rating for each business
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
      }
    })

    return { success: true, businesses: businessesWithStats }
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

    return { success: true, business }
  } catch (error) {
    console.error('Error fetching business for edit:', error)
    return { error: 'Failed to fetch business' }
  }
}

/**
 * Update business details (only editable fields)
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

    // Update business (only editable fields)
    await prisma.business.update({
      where: { id: businessId },
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

    revalidatePath(`/[locale]/business-portal`)
    revalidatePath(`/[locale]/business/${business.owner_id}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating business:', error)
    return { error: 'Failed to update business' }
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
 * Create a new business directly for the owner (bypasses pending approval)
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

    // Generate unique slugs
    const slug_he = await generateUniqueBusinessSlug(data.name_he, 'he')
    const slug_ru = data.name_ru
      ? await generateUniqueBusinessSlug(data.name_ru, 'ru')
      : null

    // Create business directly (no pending approval needed)
    const business = await prisma.business.create({
      data: {
        name_he: data.name_he,
        name_ru: data.name_ru || null,
        slug_he,
        slug_ru,
        description_he: data.description_he || null,
        description_ru: data.description_ru || null,
        city_id: data.city_id,
        neighborhood_id: data.neighborhood_id,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id || null,
        phone: data.phone || null,
        whatsapp_number: data.whatsapp_number || null,
        website_url: data.website_url || null,
        email: data.email || null,
        opening_hours_he: data.opening_hours_he || null,
        opening_hours_ru: data.opening_hours_ru || null,
        address_he: data.address_he || null,
        address_ru: data.address_ru || null,
        owner_id: session.userId, // Auto-link to logged-in owner
        is_visible: true, // Immediately visible
        is_verified: false, // Admin can verify later
      },
    })

    revalidatePath('/[locale]/business-portal')

    return { success: true, businessId: business.id }
  } catch (error) {
    console.error('Error creating business:', error)
    return { error: 'Failed to create business' }
  }
}
