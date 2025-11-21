import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function linkBusinessToOwner() {
  try {
    // Get all business owners
    const owners = await prisma.businessOwner.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    console.log('\n📋 Available Business Owners:')
    owners.forEach((owner, index) => {
      console.log(`${index + 1}. ${owner.name} (${owner.email}) - ID: ${owner.id}`)
    })

    // Get all businesses without an owner
    const unlinkedBusinesses = await prisma.business.findMany({
      where: {
        owner_id: null,
      },
      select: {
        id: true,
        name_he: true,
        name_ru: true,
        slug_he: true,
      },
    })

    console.log('\n🏢 Businesses Without Owner:')
    if (unlinkedBusinesses.length === 0) {
      console.log('✅ All businesses are already linked to owners!')
      return
    }

    unlinkedBusinesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name_he} / ${business.name_ru} (slug: ${business.slug_he})`)
    })

    // For automation: link first owner to all unlinked businesses
    if (owners.length > 0 && unlinkedBusinesses.length > 0) {
      const firstOwner = owners[0]

      console.log(`\n🔗 Linking all businesses to: ${firstOwner.name} (${firstOwner.email})`)

      const result = await prisma.business.updateMany({
        where: {
          owner_id: null,
        },
        data: {
          owner_id: firstOwner.id,
        },
      })

      console.log(`✅ Successfully linked ${result.count} business(es) to ${firstOwner.name}`)

      // Verify
      const linkedBusinesses = await prisma.business.findMany({
        where: {
          owner_id: firstOwner.id,
        },
        select: {
          name_he: true,
          name_ru: true,
        },
      })

      console.log('\n✅ Businesses now owned by', firstOwner.name + ':')
      linkedBusinesses.forEach(b => {
        console.log(`   - ${b.name_he} / ${b.name_ru}`)
      })
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

linkBusinessToOwner()
