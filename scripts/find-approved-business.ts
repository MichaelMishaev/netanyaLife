import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findApprovedBusiness() {
  try {
    // Find the business with phone 0655765567
    const business = await prisma.business.findFirst({
      where: {
        phone: {
          contains: '655765567',
        },
      },
      include: {
        owner: true,
        category: true,
        neighborhood: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    if (!business) {
      console.log('❌ Business not found in approved businesses')
      return
    }

    console.log('\n✅ Business Found (Approved):')
    console.log(`Name: ${business.name_he}`)
    console.log(`Phone: ${business.phone}`)
    console.log(`Category: ${business.category?.name_he}`)
    console.log(`Neighborhood: ${business.neighborhood.name_he}`)
    console.log(`Created: ${business.created_at}`)
    console.log(`\n🔗 Owner Link:`)
    console.log(`Owner ID: ${business.owner_id || 'NULL ❌'}`)

    if (business.owner) {
      console.log(`✅ Linked to: ${business.owner.name} (${business.owner.email})`)
      console.log(`   Owner ID: ${business.owner.id}`)
    } else {
      console.log(`❌ NOT linked to any owner!`)
      console.log(`\n⚠️  This business has no owner_id - that's why it doesn't show in the portal!`)
    }

    // Check all owner accounts
    console.log('\n📧 All Business Owner Accounts:')
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
    })

    owners.forEach((owner, index) => {
      console.log(`${index + 1}. ${owner.name} (${owner.email}) - ${owner._count.businesses} businesses`)
    })

    console.log('\n💡 Solution: Link this business to the owner account you\'re logged in with!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findApprovedBusiness()
