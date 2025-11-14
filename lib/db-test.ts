/**
 * Database Connection Test
 * Run with: npx tsx lib/db-test.ts
 *
 * This file verifies the Prisma connection is working
 * Can be deleted after Day 3 seed is complete
 */

import { prisma } from './prisma'

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')

    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT current_database(), version()`

    console.log('✅ Database connection successful!')
    console.log('📊 Connection details:', result)

    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    console.log('\n📋 Tables created:')
    console.log(tables)

  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
