import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOwnerAccount() {
  try {
    console.log('\n📧 Business Owner Accounts:')
    const owners = await prisma.businessOwner.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            businesses: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    })

    owners.forEach((owner, index) => {
      console.log(
        `${index + 1}. ${owner.name} (${owner.email})\n   ID: ${owner.id}\n   Businesses: ${owner._count.businesses}`
      )
    })

    console.log('\n💡 Which email are you logged in with?')
    console.log('If you\'re not logged in with 345287@gmail.com, that\'s why you don\'t see businesses!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOwnerAccount()
