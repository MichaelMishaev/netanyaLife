/**
 * Find business owner
 * Run with: npx tsx scripts/find-business-owner.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businessName = 'מיכאל חשמל'
  
  console.log(`🔍 Searching for business: ${businessName}`)
  
  const business = await prisma.business.findFirst({
    where: {
      name_he: {
        contains: businessName,
      },
    },
    include: {
      owner: true,
      category: true,
      neighborhood: true,
    },
  })
  
  if (!business) {
    console.log('❌ Business not found')
    return
  }
  
  console.log('\n📋 Business Details:')
  console.log(`   Name (HE): ${business.name_he}`)
  console.log(`   Name (RU): ${business.name_ru || 'N/A'}`)
  console.log(`   Slug (HE): ${business.slug_he}`)
  console.log(`   Category: ${business.category?.name_he || 'N/A'}`)
  console.log(`   Neighborhood: ${business.neighborhood?.name_he || 'N/A'}`)
  console.log(`   Phone: ${business.phone || 'N/A'}`)
  console.log(`   WhatsApp: ${business.whatsapp_number || 'N/A'}`)
  console.log(`   Email: ${business.email || 'N/A'}`)
  
  if (business.owner) {
    console.log('\n👤 Owner Details:')
    console.log(`   ID: ${business.owner.id}`)
    console.log(`   Email: ${business.owner.email}`)
    console.log(`   Name: ${business.owner.name || 'N/A'}`)
    console.log(`   Phone: ${business.owner.phone || 'N/A'}`)
    console.log(`   Created: ${business.owner.created_at}`)
  } else {
    console.log('\n👤 Owner: No owner assigned')
  }
  
  console.log('\n🔧 Business Status:')
  console.log(`   Visible: ${business.is_visible}`)
  console.log(`   Verified: ${business.is_verified}`)
  console.log(`   Pinned: ${business.is_pinned}`)
  console.log(`   Created: ${business.created_at}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Search failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
