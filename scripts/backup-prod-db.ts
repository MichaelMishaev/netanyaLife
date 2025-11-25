import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Use Railway production DATABASE_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function backupProductionDatabase() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-')
  
  console.log(`🔍 Backing up production database...`)
  console.log(`📅 Timestamp: ${timestamp}\n`)

  try {
    // Export all tables
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
      categoryRequests,
    ] = await Promise.all([
      prisma.city.findMany(),
      prisma.neighborhood.findMany(),
      prisma.category.findMany({
        include: {
          subcategories: true
        }
      }),
      prisma.subcategory.findMany(),
      prisma.business.findMany(),
      prisma.pendingBusiness.findMany(),
      prisma.businessOwner.findMany(),
      prisma.pendingBusinessEdit.findMany(),
      prisma.adminUser.findMany(),
      prisma.adminSettings.findMany(),
      prisma.review.findMany(),
      prisma.event.findMany(),
      prisma.categoryRequest.findMany(),
    ])

    const data = {
      metadata: {
        backupTimestamp: timestamp,
        backupDate: new Date().toISOString(),
        databaseSource: 'production',
      },
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
      categoryRequests,
    }

    // Create backup directory with full timestamp
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const fileName = `db_backup_${timestamp}.json`
    const filePath = path.join(backupDir, fileName)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    console.log('✅ Backup completed successfully!\n')
    console.log('📊 Data counts:')
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
    console.log(`   Category Requests: ${categoryRequests.length}`)
    console.log(`\n💾 Backup saved to: ${filePath}`)
    console.log(`📦 File: ${fileName}`)

    return data
  } catch (error) {
    console.error('❌ Error creating backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backupProductionDatabase()
  .then(() => {
    console.log('\n✨ Backup process completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Backup process failed:', error)
    process.exit(1)
  })
