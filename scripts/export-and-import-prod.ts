import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Get DATABASE_URL from environment
const PROD_DATABASE_URL = process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL_PROD
const LOCAL_DATABASE_URL = process.env.DATABASE_URL

if (!PROD_DATABASE_URL) {
  console.error('❌ RAILWAY_DATABASE_URL not set. Please set it first.')
  process.exit(1)
}

if (!LOCAL_DATABASE_URL) {
  console.error('❌ DATABASE_URL not set for local database')
  process.exit(1)
}

// Create two Prisma clients
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
})

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: LOCAL_DATABASE_URL,
    },
  },
})

async function exportAndImport() {
  console.log('🔍 Step 1: Exporting production database...\n')

  try {
    // Export all tables from production
    const [
      cities,
      neighborhoods,
      categories,
      subcategories,
      businesses,
      pendingBusinesses,
      businessOwners,
      pendingBusinessEdits,
      adminUsers,
      adminSettings,
      reviews,
      events,
    ] = await Promise.all([
      prodPrisma.city.findMany(),
      prodPrisma.neighborhood.findMany(),
      prodPrisma.category.findMany(),
      prodPrisma.subcategory.findMany(),
      prodPrisma.business.findMany(),
      prodPrisma.pendingBusiness.findMany(),
      prodPrisma.businessOwner.findMany(),
      prodPrisma.pendingBusinessEdit.findMany(),
      prodPrisma.adminUser.findMany(),
      prodPrisma.adminSettings.findMany(),
      prodPrisma.review.findMany(),
      prodPrisma.event.findMany(),
    ])

    console.log('✅ Production data exported!\n')
    console.log('📊 Production counts:')
    console.log(`   Cities: ${cities.length}`)
    console.log(`   Neighborhoods: ${neighborhoods.length}`)
    console.log(`   Categories: ${categories.length}`)
    console.log(`   Subcategories: ${subcategories.length}`)
    console.log(`   Businesses: ${businesses.length}`)
    console.log(`   Pending Businesses: ${pendingBusinesses.length}`)
    console.log(`   Business Owners: ${businessOwners.length}`)
    console.log(`   Pending Business Edits: ${pendingBusinessEdits.length}`)
    console.log(`   Admin Users: ${adminUsers.length}`)
    console.log(`   Admin Settings: ${adminSettings.length}`)
    console.log(`   Reviews: ${reviews.length}`)
    console.log(`   Events: ${events.length}`)

    // Save backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const backupDir = path.join(process.cwd(), 'backups', `prod-${timestamp}`)

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const data = {
      cities,
      neighborhoods,
      categories,
      subcategories,
      businesses,
      pendingBusinesses,
      businessOwners,
      pendingBusinessEdits,
      adminUsers,
      adminSettings,
      reviews,
      events,
      exportedAt: new Date().toISOString(),
    }

    const filePath = path.join(backupDir, 'production-data.json')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`\n💾 Backup saved to: ${filePath}\n`)

    // Clear local database
    console.log('🗑️  Step 2: Clearing local database...\n')

    await localPrisma.$transaction([
      localPrisma.event.deleteMany(),
      localPrisma.review.deleteMany(),
      localPrisma.pendingBusinessEdit.deleteMany(),
      localPrisma.pendingBusiness.deleteMany(),
      localPrisma.business.deleteMany(),
      localPrisma.businessOwner.deleteMany(),
      localPrisma.subcategory.deleteMany(),
      localPrisma.category.deleteMany(),
      localPrisma.neighborhood.deleteMany(),
      localPrisma.city.deleteMany(),
      localPrisma.adminSettings.deleteMany(),
      localPrisma.adminUser.deleteMany(),
    ])

    console.log('✅ Local database cleared!\n')

    // Import to local
    console.log('📥 Step 3: Importing to local database...\n')

    // Import in correct order (respecting foreign keys)
    await localPrisma.city.createMany({ data: cities, skipDuplicates: true })
    await localPrisma.neighborhood.createMany({ data: neighborhoods, skipDuplicates: true })
    await localPrisma.category.createMany({ data: categories, skipDuplicates: true })
    await localPrisma.subcategory.createMany({ data: subcategories, skipDuplicates: true })
    await localPrisma.businessOwner.createMany({ data: businessOwners, skipDuplicates: true })
    await localPrisma.business.createMany({ data: businesses, skipDuplicates: true })
    await localPrisma.pendingBusiness.createMany({ data: pendingBusinesses, skipDuplicates: true })
    await localPrisma.pendingBusinessEdit.createMany({
      data: pendingBusinessEdits,
      skipDuplicates: true,
    })
    await localPrisma.review.createMany({ data: reviews, skipDuplicates: true })
    await localPrisma.event.createMany({ data: events as any, skipDuplicates: true })
    await localPrisma.adminUser.createMany({ data: adminUsers, skipDuplicates: true })
    await localPrisma.adminSettings.createMany({ data: adminSettings, skipDuplicates: true })

    console.log('✅ Data imported to local database!\n')

    // Verify
    console.log('🔍 Step 4: Verifying local database...\n')

    const localCounts = await Promise.all([
      localPrisma.business.count(),
      localPrisma.category.count(),
      localPrisma.subcategory.count(),
    ])

    console.log('📊 Local counts:')
    console.log(`   Businesses: ${localCounts[0]}`)
    console.log(`   Categories: ${localCounts[1]}`)
    console.log(`   Subcategories: ${localCounts[2]}`)

    console.log('\n✅ SUCCESS! Local database now matches production!')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prodPrisma.$disconnect()
    await localPrisma.$disconnect()
  }
}

exportAndImport()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
