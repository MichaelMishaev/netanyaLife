import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function markExistingAsTest() {
  console.log('Marking all existing businesses as test...');

  // Update all businesses
  const businessesResult = await prisma.business.updateMany({
    where: {
      is_test: false, // Only update those not already marked
    },
    data: {
      is_test: true,
    },
  });

  console.log(`Updated ${businessesResult.count} businesses to is_test = true`);

  // Update all pending businesses
  const pendingResult = await prisma.pendingBusiness.updateMany({
    where: {
      is_test: false,
    },
    data: {
      is_test: true,
    },
  });

  console.log(`Updated ${pendingResult.count} pending businesses to is_test = true`);

  console.log('Done!');
}

markExistingAsTest()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
