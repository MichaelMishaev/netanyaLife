import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanya-local.com'

  // Static routes for both locales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/he`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/ru`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/he/add-business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ru/add-business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Get all visible businesses
  const businesses = await prisma.business.findMany({
    where: {
      is_visible: true,
      deleted_at: null,
    },
    select: {
      slug_he: true,
      slug_ru: true,
      updated_at: true,
    },
  })

  // Business detail pages
  const businessRoutes: MetadataRoute.Sitemap = businesses.flatMap(
    (business) => {
      const routes = []

      if (business.slug_he) {
        routes.push({
          url: `${baseUrl}/he/business/${business.slug_he}`,
          lastModified: business.updated_at,
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        })
      }

      if (business.slug_ru) {
        routes.push({
          url: `${baseUrl}/ru/business/${business.slug_ru}`,
          lastModified: business.updated_at,
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        })
      }

      return routes
    }
  )

  // Get all categories
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    select: { slug: true },
  })

  // Get all neighborhoods
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { is_active: true },
    select: { slug: true },
  })

  // Search results pages
  const searchRoutes: MetadataRoute.Sitemap = []

  for (const category of categories) {
    for (const neighborhood of neighborhoods) {
      searchRoutes.push({
        url: `${baseUrl}/he/search/${category.slug}/${neighborhood.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
      searchRoutes.push({
        url: `${baseUrl}/ru/search/${category.slug}/${neighborhood.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  return [...staticRoutes, ...businessRoutes, ...searchRoutes]
}
