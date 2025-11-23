'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface CategoryRequestData {
  categoryNameHe: string
  categoryNameRu?: string
  description?: string
  requesterName?: string
  requesterEmail?: string
  requesterPhone?: string
  businessName?: string
}

export async function submitCategoryRequest(data: CategoryRequestData) {
  try {
    console.log('🔵 SERVER: Received category request:', data)

    // Validate required fields
    if (!data.categoryNameHe?.trim()) {
      console.log('❌ SERVER: Validation failed - Hebrew name missing')
      return {
        success: false,
        error: 'Category name in Hebrew is required',
      }
    }

    console.log('🟢 SERVER: Creating category request in database...')

    // Create category request
    const created = await prisma.categoryRequest.create({
      data: {
        category_name_he: data.categoryNameHe.trim(),
        category_name_ru: data.categoryNameRu?.trim() || null,
        description: data.description?.trim() || null,
        requester_name: data.requesterName?.trim() || null,
        requester_email: data.requesterEmail?.trim() || null,
        requester_phone: data.requesterPhone?.trim() || null,
        business_name: data.businessName?.trim() || null,
        status: 'PENDING',
      },
    })

    console.log('✅ SERVER: Category request created successfully:', created.id)

    // Revalidate admin pages
    revalidatePath('/[locale]/admin/category-requests', 'page')

    return {
      success: true,
    }
  } catch (error) {
    console.error('❌ SERVER: Error submitting category request:', error)
    return {
      success: false,
      error: 'Failed to submit category request',
    }
  }
}

interface ApproveCategoryRequestData {
  requestId: string
  adminEmail: string
  createCategory?: boolean
  adminNotes?: string
}

export async function approveCategoryRequest(data: ApproveCategoryRequestData) {
  try {
    const request = await prisma.categoryRequest.findUnique({
      where: { id: data.requestId },
    })

    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      }
    }

    let createdCategoryId: string | null = null

    // If createCategory is true, create the category
    if (data.createCategory) {
      // Generate slug - transliterate Hebrew to English
      // Use a simple transliteration or require manual slug input
      const hebrewToEnglish: Record<string, string> = {
        'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
        'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
        'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'f',
        'צ': 'ts', 'ץ': 'ts', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
      }

      const slug = request.category_name_he
        .toLowerCase()
        .split('')
        .map(char => hebrewToEnglish[char] || char)
        .join('')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      // Check if slug already exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug },
      })

      if (existingCategory) {
        return {
          success: false,
          error: 'A category with this name already exists',
        }
      }

      // Create the category
      const newCategory = await prisma.category.create({
        data: {
          name_he: request.category_name_he,
          name_ru: request.category_name_ru || request.category_name_he,
          slug,
          is_active: true,
          is_popular: false,
          display_order: 0,
        },
      })

      createdCategoryId = newCategory.id
    }

    // Update request status
    await prisma.categoryRequest.update({
      where: { id: data.requestId },
      data: {
        status: 'APPROVED',
        reviewed_at: new Date(),
        reviewed_by: data.adminEmail,
        admin_notes: data.adminNotes,
        created_category_id: createdCategoryId,
      },
    })

    // Revalidate paths
    revalidatePath('/[locale]/admin/category-requests', 'page')
    if (createdCategoryId) {
      revalidatePath('/[locale]/admin/categories', 'page')
      revalidatePath('/[locale]/add-business', 'page')
    }

    return {
      success: true,
      categoryCreated: !!createdCategoryId,
    }
  } catch (error) {
    console.error('Error approving category request:', error)
    return {
      success: false,
      error: 'Failed to approve request',
    }
  }
}

interface RejectCategoryRequestData {
  requestId: string
  adminEmail: string
  adminNotes?: string
}

export async function rejectCategoryRequest(data: RejectCategoryRequestData) {
  try {
    const request = await prisma.categoryRequest.findUnique({
      where: { id: data.requestId },
    })

    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      }
    }

    // Update request status
    await prisma.categoryRequest.update({
      where: { id: data.requestId },
      data: {
        status: 'REJECTED',
        reviewed_at: new Date(),
        reviewed_by: data.adminEmail,
        admin_notes: data.adminNotes,
      },
    })

    // Revalidate admin page
    revalidatePath('/[locale]/admin/category-requests', 'page')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error rejecting category request:', error)
    return {
      success: false,
      error: 'Failed to reject request',
    }
  }
}
