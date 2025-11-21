/**
 * Update admin password
 * Run with: npx tsx scripts/update-admin-password.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = '345287@gmail.com'
  const newPassword = 'admin123456'
  
  console.log('🔐 Updating admin password...')
  
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  const updated = await prisma.adminUser.update({
    where: { email: adminEmail },
    data: {
      password_hash: hashedPassword,
    },
  })
  
  console.log(`✅ Password updated for: ${updated.email}`)
  console.log(`   New password: ${newPassword}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Update failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
