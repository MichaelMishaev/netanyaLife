/**
 * Remove "All Netanya" neighborhood from database
 * This should NOT be a selectable option in the dropdown
 * According to sysAnal.md, users select specific neighborhoods first
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Searching for "All Netanya" neighborhoods...\n')

  // Find any neighborhoods with "כל נתניה" or similar
  const allNetanyaHoods = await prisma.neighborhood.findMany({
    where: {
      OR: [
        { name_he: { contains: 'כל נתניה' } },
        { name_ru: { contains: 'Вся Нетания' } },
        { slug: { contains: 'all' } },
      ],
    },
  })

  if (allNetanyaHoods.length === 0) {
    console.log('✅ No "All Netanya" neighborhoods found!')
    console.log('✅ Database is clean')
    return
  }

  console.log(`❌ Found ${allNetanyaHoods.length} "All Netanya" neighborhood(s):\n`)
  allNetanyaHoods.forEach((hood, index) => {
    console.log(`${index + 1}. ${hood.name_he} (${hood.name_ru})`)
    console.log(`   ID: ${hood.id}`)
    console.log(`   Slug: ${hood.slug}`)
    console.log(`   Active: ${hood.is_active}`)
    console.log('')
  })

  // Delete them
  console.log('🗑️  Deleting "All Netanya" neighborhoods...\n')

  for (const hood of allNetanyaHoods) {
    await prisma.neighborhood.delete({
      where: { id: hood.id },
    })
    console.log(`✅ Deleted: ${hood.name_he} (${hood.slug})`)
  }

  console.log('\n✅ All "All Netanya" neighborhoods removed!')
  console.log('\n📋 Current neighborhoods in database:')

  const remaining = await prisma.neighborhood.findMany({
    orderBy: { display_order: 'asc' },
  })

  remaining.forEach((hood, index) => {
    console.log(`${index + 1}. ${hood.name_he} (${hood.slug})`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
