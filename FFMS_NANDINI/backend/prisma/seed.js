const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Required – will throw if missing
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  const adminRole = process.env.ADMIN_ROLE || 'ADMIN';
  const adminStatus = process.env.ADMIN_STATUS || 'ACTIVE';

  if (!adminEmail) {
    throw new Error('❌ ADMIN_EMAIL environment variable is required');
  }
  if (!adminPassword) {
    throw new Error('❌ ADMIN_PASSWORD environment variable is required');
  }

  // Ensure default organization exists
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Tinplate Computer Training Center',
        slug: 'tctc-ffms',
        isActive: true
      }
    });
    console.log(`✅ Default organization created: ${org.name}`);
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: hashedPassword,
      role: adminRole,
      status: adminStatus,
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      name: adminName,
      role: adminRole,
      status: adminStatus,
      organizationId: org.id,
      employeeId: 'EMP-001'
    },
  });

  console.log(`✅ Admin user seeded: ${user.email} (${user.role})`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());