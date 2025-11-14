import { prisma } from '@/lib/prisma'
import { cache } from 'react'

/**
 * Get all neighborhoods for a city
 * Cached for performance
 */
export const getNeighborhoods = cache(async (cityId: string) => {
  return await prisma.neighborhood.findMany({
    where: { city_id: cityId, is_active: true },
    orderBy: { display_order: 'asc' },
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
    },
  })
})

/**
 * Get neighborhood by slug
 */
export const getNeighborhoodBySlug = cache(
  async (citySlug: string, neighborhoodSlug: string) => {
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true },
    })

    if (!city) return null

    return await prisma.neighborhood.findFirst({
      where: {
        city_id: city.id,
        slug: neighborhoodSlug,
      },
      select: {
        id: true,
        name_he: true,
        name_ru: true,
        slug: true,
      },
    })
  }
)

/**
 * Get Netanya city (default)
 */
export const getNetanyaCity = cache(async () => {
  return await prisma.city.findUnique({
    where: { slug: 'netanya' },
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
    },
  })
})
