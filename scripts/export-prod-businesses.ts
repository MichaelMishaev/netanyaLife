import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  // Get all real businesses (not test)
  const realBusinesses = await prisma.business.findMany({
    where: {
      is_test: false,
      deleted_at: null,
    },
    include: {
      category: { select: { slug: true, name_he: true } },
      subcategory: { select: { slug: true, name_he: true } },
      neighborhood: { select: { slug: true, name_he: true } },
    },
  })

  console.log(`Found ${realBusinesses.length} real businesses to export`)

  // Create seed data format
  const seedData = realBusinesses.map((b) => ({
    name_he: b.name_he,
    name_ru: b.name_ru,
    slug_he: b.slug_he,
    slug_ru: b.slug_ru,
    description_he: b.description_he,
    description_ru: b.description_ru,
    phone: b.phone,
    whatsapp_number: b.whatsapp_number,
    address_he: b.address_he,
    address_ru: b.address_ru,
    website_url: b.website_url,
    opening_hours_he: b.opening_hours_he,
    opening_hours_ru: b.opening_hours_ru,
    is_visible: b.is_visible,
    is_verified: b.is_verified,
    is_pinned: b.is_pinned,
    is_test: false, // Production businesses
    category_slug: b.category?.slug,
    subcategory_slug: b.subcategory?.slug,
    neighborhood_slug: b.neighborhood?.slug,
  }))

  // Write to JSON file
  fs.writeFileSync(
    'scripts/prod-businesses-data.json',
    JSON.stringify(seedData, null, 2),
    'utf-8'
  )

  console.log('Exported to scripts/prod-businesses-data.json')

  // Also generate SQL for direct database import
  const sqlStatements: string[] = []

  for (const b of realBusinesses) {
    const escape = (val: string | null) => {
      if (val === null) return 'NULL'
      return `'${val.replace(/'/g, "''")}'`
    }

    sqlStatements.push(`
INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  ${escape(b.name_he)}, ${escape(b.name_ru)}, ${escape(b.slug_he)}, ${escape(b.slug_ru)},
  ${escape(b.description_he)}, ${escape(b.description_ru)},
  ${escape(b.phone)}, ${escape(b.whatsapp_number)},
  ${escape(b.address_he)}, ${escape(b.address_ru)}, ${escape(b.website_url)},
  ${escape(b.opening_hours_he)}, ${escape(b.opening_hours_ru)},
  ${b.is_visible}, ${b.is_verified}, ${b.is_pinned}, false,
  (SELECT id FROM categories WHERE slug = ${escape(b.category?.slug || null)}),
  ${b.subcategory ? `(SELECT id FROM subcategories WHERE slug = ${escape(b.subcategory.slug)})` : 'NULL'},
  (SELECT id FROM neighborhoods WHERE slug = ${escape(b.neighborhood?.slug || null)}),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;`)
  }

  fs.writeFileSync(
    'scripts/prod-businesses.sql',
    sqlStatements.join('\n'),
    'utf-8'
  )

  console.log('Exported SQL to scripts/prod-businesses.sql')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
