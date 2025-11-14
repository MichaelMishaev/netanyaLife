import { prisma } from '@/lib/prisma'
import { cache } from 'react'

/**
 * Get all active categories
 * Cached for performance
 */
export const getCategories = cache(async () => {
  return await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { display_order: 'asc' },
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
      icon_name: true,
      is_popular: true,
    },
  })
})

/**
 * Get popular categories for homepage
 */
export const getPopularCategories = cache(async () => {
  return await prisma.category.findMany({
    where: { is_active: true, is_popular: true },
    orderBy: { display_order: 'asc' },
    take: 6,
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
      icon_name: true,
    },
  })
})

/**
 * Get category by slug
 */
export const getCategoryBySlug = cache(async (slug: string) => {
  return await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
      description_he: true,
      description_ru: true,
    },
  })
})
