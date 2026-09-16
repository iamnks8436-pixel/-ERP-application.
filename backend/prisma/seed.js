const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const products = [
  {
    sku: 'STL-BEAM-I200',
    name: 'Structural Steel I-Beam 200mm',
    description: 'Hot-rolled structural steel I-beam for industrial construction',
    unit: 'PCS',
    physicalQuantity: 500,
  },
  {
    sku: 'AL-SHEET-3MM',
    name: 'Aluminium Sheet 3mm',
    description: 'Industrial grade aluminium sheet, 3mm thickness',
    unit: 'SHEET',
    physicalQuantity: 1200,
  },
  {
    sku: 'BRG-6205-2RS',
    name: 'Ball Bearing 6205-2RS',
    description: 'Sealed deep groove ball bearing for machinery',
    unit: 'PCS',
    physicalQuantity: 5000,
  },
  {
    sku: 'HYD-CYL-100',
    name: 'Hydraulic Cylinder 100mm Bore',
    description: 'Double-acting hydraulic cylinder, 100mm bore, 500mm stroke',
    unit: 'PCS',
    physicalQuantity: 150,
  },
  {
    sku: 'V-BELT-B85',
    name: 'Industrial V-Belt B85',
    description: 'Classical V-belt for power transmission systems',
    unit: 'PCS',
    physicalQuantity: 800,
  },
  {
    sku: 'WLD-ELEC-3.2',
    name: 'Welding Electrode 3.2mm',
    description: 'Mild steel welding electrodes, 3.2mm diameter',
    unit: 'KG',
    physicalQuantity: 2000,
  },
];

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const salesPassword = await bcrypt.hash('Sales@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      email: 'admin@erp.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'sales@erp.com' },
    update: {},
    create: {
      email: 'sales@erp.com',
      password: salesPassword,
      name: 'Sales Representative',
      role: 'SALES_USER',
    },
  });

  for (const productData of products) {
    const { physicalQuantity, ...productFields } = productData;

    const product = await prisma.product.upsert({
      where: { sku: productFields.sku },
      update: {},
      create: productFields,
    });

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: { physicalQuantity },
      create: {
        productId: product.id,
        physicalQuantity,
        reservedQuantity: 0,
      },
    });
  }

  console.log('Seed completed successfully.');
  console.log('Login credentials:');
  console.log('  ADMIN:      admin@erp.com / Admin@123');
  console.log('  SALES_USER: sales@erp.com / Sales@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
