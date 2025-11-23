import { prisma } from '../lib/prisma'

async function main() {
  // Find the business "הלקוח המרוצה"
  const business = await prisma.business.findFirst({
    where: { name_he: { contains: 'הלקוח' } },
    select: { id: true, name_he: true, owner_id: true, created_at: true }
  })
  console.log('Business:', business)

  // Find recent business owners
  const owners = await prisma.businessOwner.findMany({
    orderBy: { created_at: 'desc' },
    take: 5,
    select: { id: true, email: true, name: true, created_at: true }
  })
  console.log('Recent owners:', owners)

  // If we find both and business has no owner, prompt to link
  if (business && !business.owner_id && owners.length > 0) {
    console.log('\nTo link business to owner, run:')
    console.log(`UPDATE businesses SET owner_id = '${owners[0].id}' WHERE id = '${business.id}';`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
