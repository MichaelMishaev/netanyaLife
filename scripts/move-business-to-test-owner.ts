/**
 * Move specific business to test owner
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find test owner
  const testOwner = await prisma.businessOwner.findUnique({
    where: { email: 'test@gmail.com' },
  })

  if (!testOwner) {
    console.error('❌ Test owner not found')
    process.exit(1)
  }

  console.log(`🔍 Test owner: ${testOwner.name} (${testOwner.email})`)
  console.log(`   ID: ${testOwner.id}`)

  // Find the business "מיכאל חשמל"
  const business = await prisma.business.findFirst({
    where: {
      slug_he: 'mykal-chshml',
    },
  })

  if (!business) {
    console.error('❌ Business "מיכאל חשמל" not found')
    process.exit(1)
  }

  console.log(`\n🏢 Found business: ${business.name_he}`)
  console.log(`   Slug: ${business.slug_he}`)
  console.log(`   Current owner_id: ${business.owner_id || 'null'}`)

  // Update business owner
  await prisma.business.update({
    where: { id: business.id },
    data: { owner_id: testOwner.id },
  })

  console.log(`\n✅ Successfully moved business to ${testOwner.name}!`)

  // Verify
  const updated = await prisma.business.findUnique({
    where: { id: business.id },
    include: { owner: true },
  })

  console.log(`\n✅ Verification:`)
  console.log(`   Business: ${updated?.name_he}`)
  console.log(`   Owner: ${updated?.owner?.name} (${updated?.owner?.email})`)
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
