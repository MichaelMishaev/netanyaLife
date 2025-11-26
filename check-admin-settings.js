const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Checking AdminSettings...')

  try {
    const settings = await prisma.adminSettings.findMany()
    console.log(`Found ${settings.length} settings:`)
    settings.forEach(s => console.log(`  - ${s.key} = ${s.value}`))

    if (settings.length === 0) {
      console.log('\nNo settings found. Creating top_pinned_count...')
      await prisma.adminSettings.create({
        data: {
          key: 'top_pinned_count',
          value: '3',
          description: 'Number of pinned businesses to show first in search results',
        },
      })
      console.log('✅ Created top_pinned_count setting')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
