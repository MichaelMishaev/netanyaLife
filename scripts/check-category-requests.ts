import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const requests = await prisma.categoryRequest.findMany({
    orderBy: { created_at: 'desc' },
    take: 10
  })

  console.log('Recent category requests:', JSON.stringify(requests, null, 2))
  console.log(`\nTotal count: ${requests.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
