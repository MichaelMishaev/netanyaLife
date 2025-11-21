import prisma from '../lib/prisma'

async function updateNeighborhoods() {
  try {
    // Get current neighborhoods
    const neighborhoods = await prisma.neighborhood.findMany({
      orderBy: { display_order: 'asc' },
      include: {
        _count: {
          select: {
            businesses: true
          }
        }
      }
    })

    console.log('📍 Current Neighborhoods:')
    neighborhoods.forEach(n => {
      console.log(`   ${n.display_order}. ${n.name_he} (${n.name_ru}) - slug: ${n.slug} - ${n._count.businesses} businesses`)
    })

    console.log('\n🔄 Updating neighborhoods to 3 areas...\n')

    // Get Netanya city ID
    const city = await prisma.city.findFirst({
      where: { name_he: 'נתניה' }
    })

    if (!city) {
      throw new Error('City Netanya not found')
    }

    // Find center and north neighborhoods to combine businesses
    const center = neighborhoods.find(n => n.slug === 'merkaz' || n.name_he === 'מרכז')
    const north = neighborhoods.find(n => n.slug === 'tsafon' || n.name_he === 'צפון')
    const south = neighborhoods.find(n => n.slug === 'darom' || n.name_he === 'דרום')
    const east = neighborhoods.find(n => n.slug.includes('mizrah') || n.name_he === 'מזרח')

    // Create or update 3 neighborhoods
    console.log('✨ Creating/updating neighborhoods...')

    const centerNorth = await prisma.neighborhood.upsert({
      where: {
        city_id_slug: {
          city_id: city.id,
          slug: 'merkaz-tsafon'
        }
      },
      create: {
        name_he: 'מרכז',
        name_ru: 'Центр',
        slug: 'merkaz-tsafon',
        city_id: city.id,
        display_order: 1
      },
      update: {
        name_he: 'מרכז',
        name_ru: 'Центр',
        display_order: 1
      }
    })

    const southNew = await prisma.neighborhood.upsert({
      where: {
        city_id_slug: {
          city_id: city.id,
          slug: 'darom'
        }
      },
      create: {
        name_he: 'דרום',
        name_ru: 'Юг',
        slug: 'darom',
        city_id: city.id,
        display_order: 2
      },
      update: {
        name_he: 'דרום',
        name_ru: 'Юг',
        display_order: 2
      }
    })

    const eastNew = await prisma.neighborhood.upsert({
      where: {
        city_id_slug: {
          city_id: city.id,
          slug: 'mizrach'
        }
      },
      create: {
        name_he: 'מזרח',
        name_ru: 'Восток',
        slug: 'mizrach',
        city_id: city.id,
        display_order: 3
      },
      update: {
        name_he: 'מזרח',
        name_ru: 'Восток',
        display_order: 3
      }
    })

    console.log('✅ Created:')
    console.log(`   1. ${centerNorth.name_he} (${centerNorth.name_ru}) - ${centerNorth.slug}`)
    console.log(`   2. ${southNew.name_he} (${southNew.name_ru}) - ${southNew.slug}`)
    console.log(`   3. ${eastNew.name_he} (${eastNew.name_ru}) - ${eastNew.slug}`)

    // Move businesses to new neighborhoods BEFORE deleting old ones
    console.log('\n📦 Moving businesses to new neighborhoods...')
    if (center || north) {
      const centerNorthIds = [center?.id, north?.id].filter(Boolean) as string[]
      if (centerNorthIds.length > 0) {
        const moved = await prisma.business.updateMany({
          where: {
            neighborhood_id: { in: centerNorthIds }
          },
          data: {
            neighborhood_id: centerNorth.id
          }
        })
        console.log(`   Moved ${moved.count} businesses to מרכז-צפון`)
      }
    }

    if (south) {
      const moved = await prisma.business.updateMany({
        where: {
          neighborhood_id: south.id
        },
        data: {
          neighborhood_id: southNew.id
        }
      })
      console.log(`   Moved ${moved.count} businesses to דרום`)
    }

    if (east) {
      const moved = await prisma.business.updateMany({
        where: {
          neighborhood_id: east.id
        },
        data: {
          neighborhood_id: eastNew.id
        }
      })
      console.log(`   Moved ${moved.count} businesses to מזרח`)
    }

    // Move pending businesses too
    console.log('\n📦 Moving pending businesses...')
    if (center || north) {
      const centerNorthIds = [center?.id, north?.id].filter(Boolean) as string[]
      if (centerNorthIds.length > 0) {
        const moved = await prisma.pendingBusiness.updateMany({
          where: {
            neighborhood_id: { in: centerNorthIds }
          },
          data: {
            neighborhood_id: centerNorth.id
          }
        })
        console.log(`   Moved ${moved.count} pending businesses to מרכז-צפון`)
      }
    }

    if (south) {
      const moved = await prisma.pendingBusiness.updateMany({
        where: {
          neighborhood_id: south.id
        },
        data: {
          neighborhood_id: southNew.id
        }
      })
      console.log(`   Moved ${moved.count} pending businesses to דרום`)
    }

    if (east) {
      const moved = await prisma.pendingBusiness.updateMany({
        where: {
          neighborhood_id: east.id
        },
        data: {
          neighborhood_id: eastNew.id
        }
      })
      console.log(`   Moved ${moved.count} pending businesses to מזרח`)
    }

    // Now delete old neighborhoods (safe because all businesses AND pending businesses have been moved)
    console.log('\n🗑️  Deleting old neighborhoods...')
    const oldIds = [center?.id, north?.id, south?.id, east?.id].filter(Boolean) as string[]
    // Exclude the new neighborhoods from deletion
    const idsToDelete = oldIds.filter(id =>
      id !== centerNorth.id && id !== southNew.id && id !== eastNew.id
    )
    if (idsToDelete.length > 0) {
      await prisma.neighborhood.deleteMany({
        where: {
          id: { in: idsToDelete }
        }
      })
      console.log(`   Deleted ${idsToDelete.length} old neighborhoods`)
    }

    console.log('\n✅ Neighborhoods updated successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

updateNeighborhoods()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
