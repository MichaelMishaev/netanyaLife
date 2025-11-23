import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import businessesData from '@/scripts/prod-businesses-data.json'

interface BusinessData {
  name_he: string
  name_ru: string | null
  slug_he: string
  slug_ru: string | null
  description_he: string | null
  description_ru: string | null
  phone: string | null
  whatsapp_number: string | null
  address_he: string | null
  address_ru: string | null
  website_url: string | null
  opening_hours_he: string | null
  opening_hours_ru: string | null
  is_visible: boolean
  is_verified: boolean
  is_pinned: boolean
  is_test: boolean
  category_slug: string | null
  subcategory_slug: string | null
  neighborhood_slug: string | null
}

// POST /api/admin/seed-businesses - Seed production businesses
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businesses = businessesData as BusinessData[]
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const business of businesses) {
      try {
        // Find category and neighborhood by slug
        const category = business.category_slug
          ? await prisma.category.findFirst({ where: { slug: business.category_slug } })
          : null

        const subcategory = business.subcategory_slug
          ? await prisma.subcategory.findFirst({ where: { slug: business.subcategory_slug } })
          : null

        const neighborhood = business.neighborhood_slug
          ? await prisma.neighborhood.findFirst({
              where: { slug: business.neighborhood_slug },
              select: { id: true, city_id: true },
            })
          : null

        if (!category || !neighborhood) {
          results.errors.push(`${business.name_he}: missing category or neighborhood`)
          continue
        }

        // Check if business already exists
        const existing = await prisma.business.findFirst({
          where: { slug_he: business.slug_he },
        })

        if (existing) {
          results.skipped++
          continue
        }

        // Create the business
        await prisma.business.create({
          data: {
            name_he: business.name_he,
            name_ru: business.name_ru,
            slug_he: business.slug_he,
            slug_ru: business.slug_ru,
            description_he: business.description_he,
            description_ru: business.description_ru,
            phone: business.phone,
            whatsapp_number: business.whatsapp_number,
            address_he: business.address_he,
            address_ru: business.address_ru,
            website_url: business.website_url,
            opening_hours_he: business.opening_hours_he,
            opening_hours_ru: business.opening_hours_ru,
            is_visible: business.is_visible,
            is_verified: business.is_verified,
            is_pinned: business.is_pinned,
            is_test: business.is_test,
            category_id: category.id,
            subcategory_id: subcategory?.id || null,
            neighborhood_id: neighborhood.id,
            city_id: neighborhood.city_id,
          },
        })

        results.created++
      } catch (error) {
        results.errors.push(`${business.name_he}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      total: businesses.length,
      ...results,
    })
  } catch (error) {
    console.error('Error seeding businesses:', error)
    return NextResponse.json({ error: 'Failed to seed businesses' }, { status: 500 })
  }
}
