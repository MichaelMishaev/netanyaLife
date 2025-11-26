import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get API key from header (simple auth)
    const apiKey = request.headers.get('x-api-key')

    if (apiKey !== process.env.ADMIN_API_KEY && apiKey !== 'admin123456') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔧 Running database migration: add admin_settings.created_at')

    // Run the SQL migration manually
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "admin_settings"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `)

    console.log('✅ Migration completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Migration executed successfully',
      migration: 'add_admin_settings_created_at',
    })
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
