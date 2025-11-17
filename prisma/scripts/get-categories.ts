import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true
    },
    orderBy: { name_he: 'asc' }
  })

  console.log(JSON.stringify(categories, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
