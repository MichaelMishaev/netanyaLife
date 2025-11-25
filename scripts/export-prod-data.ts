import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function exportProductionData() {
  console.log('🔍 Exporting production database...\n')

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
    ] = await Promise.all([
      prisma.city.findMany(),
      prisma.neighborhood.findMany(),
      prisma.category.findMany(),
      prisma.subcategory.findMany(),
      prisma.business.findMany(),
      prisma.pendingBusiness.findMany(),
      prisma.businessOwner.findMany(),
      prisma.pendingBusinessEdit.findMany(),
      prisma.adminUser.findMany(),
      prisma.adminSettings.findMany(),
      prisma.review.findMany(),
      prisma.event.findMany(),
    ])

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

    // Create backup directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const backupDir = path.join(process.cwd(), 'backups', `prod-${timestamp}`)

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const filePath = path.join(backupDir, 'production-data.json')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    console.log('✅ Export completed successfully!\n')
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
    console.log(`\n💾 Backup saved to: ${filePath}`)

    return data
  } catch (error) {
    console.error('❌ Error exporting data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportProductionData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
