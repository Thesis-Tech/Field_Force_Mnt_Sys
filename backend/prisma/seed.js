const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');


const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'tctc-ffms' },
    update: {},
    create: {
      name: 'Tinplate Computer Training Center',
      slug: 'tctc-ffms',
      email: 'admin@tctc.com',
      phone: '+1234567890',
      address: '123 Tech Park, TCTC',
    }
  });

  console.log(`Created/Ensured Organization: ${org.name}`);

  // Create Territories
  const northTerritory = await prisma.territory.create({
    data: {
      organizationId: org.id,
      name: 'North Region',
      description: 'Northern operational area',
    }
  });
  
  const southTerritory = await prisma.territory.create({
    data: {
      organizationId: org.id,
      name: 'South Region',
      description: 'Southern operational area',
    }
  });

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1 Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tctc.com' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Admin User',
      email: 'admin@tctc.com',
      passwordHash,
      employeeId: 'EMP-001',
      role: 'ADMIN',
    }
  });
  console.log(`Created/Ensured Admin User: ${adminUser.email}`);


  // 3 Managers
  const managers = [];
  for (let i = 1; i <= 3; i++) {
    const manager = await prisma.user.upsert({
      where: { email: `manager${i}@tctc.com` },
      update: {},
      create: {
        organizationId: org.id,
        name: `Manager ${i}`,
        email: `manager${i}@tctc.com`,
        passwordHash,
        employeeId: `EMP-M${i}`,
        role: 'MANAGER',
        territoryId: i % 2 === 0 ? northTerritory.id : southTerritory.id,
      }
    });
    managers.push(manager);
  }
  console.log(`Created/Ensured 3 Managers`);

  // 10 Field Staff
  for (let i = 1; i <= 10; i++) {
    await prisma.user.upsert({
      where: { email: `staff${i}@tctc.com` },
      update: {},
      create: {
        organizationId: org.id,
        name: `Field Staff ${i}`,
        email: `staff${i}@tctc.com`,
        passwordHash,
        employeeId: `EMP-F${i}`,
        role: 'FIELD_STAFF',
        managerId: managers[i % 3].id,
        territoryId: i % 2 === 0 ? southTerritory.id : northTerritory.id,
      }
    });
  }
  console.log(`Created/Ensured 10 Field Staff`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
