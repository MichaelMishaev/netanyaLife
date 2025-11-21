import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPendingBusiness() {
  try {
    // Find the recent pending business with phone 0655765567
    const pending = await prisma.pendingBusiness.findFirst({
      where: {
        phone: {
          contains: '0655765567',
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    if (!pending) {
      console.log('❌ No pending business found with that phone number')
      return
    }

    console.log('\n📋 Pending Business Details:')
    console.log(`Name: ${pending.name}`)
    console.log(`Phone: ${pending.phone}`)
    console.log(`Submitter Email: ${pending.submitter_email || 'NOT PROVIDED ❌'}`)
    console.log(`Status: ${pending.status}`)
    console.log(`Created: ${pending.created_at}`)

    // Check if there's a matching business owner
    if (pending.submitter_email) {
      const owner = await prisma.businessOwner.findUnique({
        where: {
          email: pending.submitter_email,
        },
      })

      if (owner) {
        console.log(`\n✅ Matching Owner Found: ${owner.name} (${owner.email})`)
        console.log(`   Owner ID: ${owner.id}`)
      } else {
        console.log(`\n❌ NO matching owner account for: ${pending.submitter_email}`)
      }
    } else {
      console.log('\n⚠️  No submitter_email provided - business will NOT be linked to any owner!')
    }

    // Check all owner accounts
    console.log('\n📧 All Business Owner Accounts:')
    const owners = await prisma.businessOwner.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    owners.forEach((owner, index) => {
      console.log(`${index + 1}. ${owner.name} (${owner.email})`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPendingBusiness()
