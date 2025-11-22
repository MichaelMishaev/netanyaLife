import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name_he: true,
      is_test: true,
      is_visible: true,
      is_verified: true,
    },
  })

  const testBusinesses = businesses.filter(b => b.is_test === true)
  const realBusinesses = businesses.filter(b => b.is_test === false)

  console.log('=== Business Summary ===')
  console.log('Total:', businesses.length)
  console.log('Test businesses:', testBusinesses.length)
  console.log('Real businesses:', realBusinesses.length)

  console.log('\n=== Real Businesses ===')
  realBusinesses.forEach(b => {
    console.log(`- ${b.name_he} | visible: ${b.is_visible} | verified: ${b.is_verified}`)
  })

  console.log('\n=== Test Businesses ===')
  testBusinesses.forEach(b => {
    console.log(`- ${b.name_he} | visible: ${b.is_visible}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
