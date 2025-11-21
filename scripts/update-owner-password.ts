/**
 * Update Business Owner Password
 * Updates password for a business owner account
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@gmail.com'
  const newPassword = 'admin123456'

  console.log(`🔑 Updating password for: ${email}`)

  // Check if owner exists
  const owner = await prisma.businessOwner.findUnique({
    where: { email },
  })

  if (!owner) {
    console.error(`❌ Business owner not found: ${email}`)
    process.exit(1)
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10)

  // Update password
  await prisma.businessOwner.update({
    where: { email },
    data: {
      password_hash: passwordHash,
    },
  })

  console.log(`✅ Password updated successfully!`)
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${newPassword}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
