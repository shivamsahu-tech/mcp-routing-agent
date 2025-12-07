import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const employeesData = [
  // ... your 6 employee records
  { name: 'David Lee', email: 'david.lee@company.com', position: 'Senior Backend Developer', salary: 110000 },
  { name: 'Emily Chen', email: 'emily.c@company.com', position: 'HR Specialist', salary: 62000 },
  { name: 'Frank Miller', email: 'frank.m@company.com', position: 'Marketing Lead', salary: 88000 },
  { name: 'Grace Hall', email: 'grace.h@company.com', position: 'Financial Controller', salary: 105000 },
  { name: 'Henry Scott', email: 'henry.s@company.com', position: 'Junior UI/UX Designer', salary: 55000 },
  { name: 'Ivy Rose', email: 'ivy.r@company.com', position: 'Sales Representative', salary: 72000 },
];

const ordersData = [
  // ... your 6 order records
  { orderNo: 'ORD-2025-004', customer: 'Global Tech Solutions', amount: 5230.99, status: 'Delivered' },
  { orderNo: 'ORD-2025-005', customer: 'Horizon Investments', amount: 250.00, status: 'Processing' },
  { orderNo: 'ORD-2025-006', customer: 'Pioneer Media Group', amount: 1890.50, status: 'Shipped' },
  { orderNo: 'ORD-2025-007', customer: 'Apex Manufacturing', amount: 45000.75, status: 'Pending Payment' },
  { orderNo: 'ORD-2025-008', customer: 'Stellar Logistics', amount: 750.25, status: 'Cancelled' },
  { orderNo: 'ORD-2025-009', customer: 'Evergreen Farms', amount: 120.00, status: 'Completed' },
];

async function main() {
  console.log(`\nStart seeding ...`);

  // --- Seed Employees ---
  for (const e of employeesData) {
    const employee = await prisma.employee.upsert({
      where: { email: e.email },
      update: e,
      create: e,
    });
    console.log(`Upserted employee with id: ${employee.id} and email: ${employee.email}`);
  }

  // --- Seed Orders ---
  const orderResult = await prisma.order.createMany({
    data: ordersData,
    skipDuplicates: true,
  });
  console.log(`\nCreated ${orderResult.count} orders in bulk.`);

  console.log(`\nSeeding finished.`);
}

main()
  .catch((e) => {
    console.error(`\nError during seeding:`, e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect the Prisma Client connection after completion or failure
    await prisma.$disconnect();
  });