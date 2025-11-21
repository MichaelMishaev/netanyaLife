import prisma from '../lib/prisma'

async function cleanupDuplicates() {
  try {
    console.log('🔍 Finding duplicate neighborhoods...')

    const neighborhoods = await prisma.neighborhood.findMany({
      orderBy: { display_order: 'asc' },
      include: {
        _count: {
          select: {
            businesses: true,
            pending_businesses: true
          }
        }
      }
    })

    console.log('\n📋 Current Neighborhoods:')
    neighborhoods.forEach((n, i) => {
      console.log(`${i+1}. ${n.name_he} (${n.name_ru}) - slug: ${n.slug}`)
      console.log(`   ${n._count.businesses} businesses, ${n._count.pending_businesses} pending`)
    })

    // Find the correct 3 neighborhoods we want to keep
    const keepSlugs = ['merkaz-tsafon', 'darom', 'mizrach']
    const toKeep = neighborhoods.filter(n => keepSlugs.includes(n.slug))
    const toDelete = neighborhoods.filter(n => !keepSlugs.includes(n.slug))

    if (toDelete.length === 0) {
      console.log('\n✅ No duplicates found - all clean!')
      return
    }

    console.log('\n🗑️  Neighborhoods to delete:')
    toDelete.forEach(n => {
      console.log(`   - ${n.name_he} (slug: ${n.slug})`)
    })

    // Move any businesses/pending from old neighborhoods to new ones
    for (const old of toDelete) {
      if (old._count.businesses > 0) {
        // Determine which new neighborhood to move to
        let targetNeighborhood
        if (old.slug === 'merkaz' || old.slug === 'tsafon') {
          targetNeighborhood = toKeep.find(n => n.slug === 'merkaz-tsafon')
        } else if (old.slug === 'mizrah-hair') {
          targetNeighborhood = toKeep.find(n => n.slug === 'mizrach')
        } else {
          targetNeighborhood = toKeep.find(n => n.slug === old.slug)
        }

        if (targetNeighborhood) {
          console.log(`\n📦 Moving ${old._count.businesses} businesses from ${old.slug} to ${targetNeighborhood.slug}`)
          await prisma.business.updateMany({
            where: { neighborhood_id: old.id },
            data: { neighborhood_id: targetNeighborhood.id }
          })
        }
      }

      if (old._count.pending_businesses > 0) {
        // Same logic for pending
        let targetNeighborhood
        if (old.slug === 'merkaz' || old.slug === 'tsafon') {
          targetNeighborhood = toKeep.find(n => n.slug === 'merkaz-tsafon')
        } else if (old.slug === 'mizrah-hair') {
          targetNeighborhood = toKeep.find(n => n.slug === 'mizrach')
        } else {
          targetNeighborhood = toKeep.find(n => n.slug === old.slug)
        }

        if (targetNeighborhood) {
          console.log(`📦 Moving ${old._count.pending_businesses} pending from ${old.slug} to ${targetNeighborhood.slug}`)
          await prisma.pendingBusiness.updateMany({
            where: { neighborhood_id: old.id },
            data: { neighborhood_id: targetNeighborhood.id }
          })
        }
      }
    }

    // Delete old neighborhoods
    console.log('\n🗑️  Deleting old neighborhoods...')
    await prisma.neighborhood.deleteMany({
      where: {
        id: { in: toDelete.map(n => n.id) }
      }
    })
    console.log(`   Deleted ${toDelete.length} neighborhoods`)

    // Show final result
    const final = await prisma.neighborhood.findMany({
      orderBy: { display_order: 'asc' },
      include: {
        _count: {
          select: {
            businesses: true,
            pending_businesses: true
          }
        }
      }
    })

    console.log('\n✅ Final Neighborhoods:')
    final.forEach((n, i) => {
      console.log(`${i+1}. ${n.name_he} (${n.name_ru}) - slug: ${n.slug}`)
      console.log(`   ${n._count.businesses} businesses, ${n._count.pending_businesses} pending`)
    })

    console.log('\n✅ Cleanup complete!')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

cleanupDuplicates()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
