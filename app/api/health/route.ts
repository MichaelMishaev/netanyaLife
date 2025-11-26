import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Try to query the database
    const city = await prisma.city.findFirst()
    const categoriesCount = await prisma.category.count()
    const neighborhoodsCount = await prisma.neighborhood.count()

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      data: {
        city: city?.slug,
        categories: categoriesCount,
        neighborhoods: neighborhoodsCount,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
