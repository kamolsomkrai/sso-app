import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create Departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: "พัสดุ" },
      update: {},
      create: {
        name: "พัสดุ",
        code: "PST",
        description: "หน่วยงานด้านพัสดุและการจัดซื้อจัดจ้าง",
      },
    }),
  ]);

  // Create Workgroups
  const workgroups = await Promise.all([
    prisma.workgroup.upsert({
      where: { name: "วัสดุสำนักงาน" },
      update: {},
      create: {
        name: "วัสดุสำนักงาน",
        code: "OFFICE",
        description: "กลุ่มงานวัสดุสำนักงานและเครื่องเขียน",
        departmentId: departments[0].id,
      },
    }),
  ]);

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      hashedPassword,
      name: "System Administrator",
      role: Role.ADMIN,
      departmentId: departments[0].id,
      workgroupId: workgroups[0].id,
    },
  });

  // Create Budget Year 2569
  const budgetYear = await prisma.budgetYear.upsert({
    where: { fiscalYear: 2569 },
    update: {},
    create: {
      fiscalYear: 2569,
      yearName: "ปีงบประมาณ 2569",
      isActive: true,
      totalBudget: 100000000,
      allocatedBudget: 60000000,
      remainingBudget: 40000000,
      // เป้าหมายรายเดือน
      janBudget: 8000000,
      febBudget: 7500000,
      marBudget: 8200000,
      aprBudget: 7800000,
      mayBudget: 8500000,
      junBudget: 9000000,
      julBudget: 9200000,
      augBudget: 8800000,
      sepBudget: 9500000,
      octBudget: 9800000,
      novBudget: 9200000,
      decBudget: 8900000,
    },
  });

  // Create Budget Items with monthly targets
  const rootItem = await prisma.budgetItem.create({
    data: {
      budgetYearId: budgetYear.id,
      itemName: "งบประมาณทั้งหมด",
      level: 1,
      order: 1,
      isEditable: false,
      previousYearActual: 95000000,
      currentYearBudget: 100000000,
      currentYearEstimate: 105000000,
      // เป้าหมายรายไตรมาส
      q1BudgetTarget: 23700000,
      q2BudgetTarget: 25300000,
      q3BudgetTarget: 27500000,
      q4BudgetTarget: 27900000,
      // เป้าหมายรายเดือน
      janBudgetTarget: 8000000,
      febBudgetTarget: 7500000,
      marBudgetTarget: 8200000,
      aprBudgetTarget: 7800000,
      mayBudgetTarget: 8500000,
      junBudgetTarget: 9000000,
      julBudgetTarget: 9200000,
      augBudgetTarget: 8800000,
      sepBudgetTarget: 9500000,
      octBudgetTarget: 9800000,
      novBudgetTarget: 9200000,
      decBudgetTarget: 8900000,
    },
  });

  // Create Procurement Items
  const procurementItem = await prisma.procurementItem.upsert({
    where: { itemCode: "คส104-1" },
    update: {},
    create: {
      itemCode: "คส104-1",
      itemName: "กระดาษ A4 80แกรม",
      unitName: "รีม",
      unitPrice: 120.75,
      workgroupId: workgroups[0].id,
      description: "กระดาษ A4 สำหรับพิมพ์เอกสาร 80 แกรม",
    },
  });

  // Create Procurement Plan Entry with targets
  const planEntry = await prisma.procurementPlanEntry.create({
    data: {
      fiscalYear: 2569,
      itemId: procurementItem.id,
      createdById: adminUser.id,
      // จำนวนจริง
      q1Quantity: 150,
      q2Quantity: 180,
      q3Quantity: 0,
      q4Quantity: 0,
      // เป้าหมายรายไตรมาส
      q1Target: 200,
      q2Target: 220,
      q3Target: 240,
      q4Target: 260,
      // เป้าหมายรายเดือน
      janTarget: 60,
      febTarget: 70,
      marTarget: 70,
      aprTarget: 70,
      mayTarget: 75,
      junTarget: 75,
      julTarget: 80,
      augTarget: 80,
      sepTarget: 80,
      octTarget: 85,
      novTarget: 85,
      decTarget: 90,
      // คำนวณอัตโนมัติ
      totalQuantity: 330,
      totalTarget: 920,
      totalAmount: 330 * 120.75,
      achievementRate: (330 / 920) * 100,
    },
  });

  // Create Monthly Progress Tracking
  const monthlyProgress = await prisma.monthlyProgress.create({
    data: {
      planEntryId: planEntry.id,
      fiscalYear: 2569,
      month: 1,
      monthName: "มกราคม",
      targetAmount: 60 * 120.75,
      actualAmount: 50 * 120.75,
      progressPercent: 83.3,
      status: "COMPLETED",
      createdById: adminUser.id,
    },
  });

  // Create Quarterly Summary
  const quarterlySummary = await prisma.quarterlySummary.create({
    data: {
      budgetYearId: budgetYear.id,
      departmentId: departments[0].id,
      workgroupId: workgroups[0].id,
      fiscalYear: 2569,
      quarter: 1,
      procurementTarget: 200,
      procurementActual: 150,
      budgetTarget: 23700000,
      budgetActual: 18000000,
      achievementRate: 75.0,
      budgetUtilization: 75.9,
      status: "COMPLETED",
      createdById: adminUser.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`📊 Created department: ${departments[0].name}`);
  console.log(`📊 Created workgroup: ${workgroups[0].name}`);
  console.log(`📅 Created budget year: ${budgetYear.yearName}`);
  console.log(`📦 Created procurement item: ${procurementItem.itemName}`);
  console.log(`🎯 Created plan entry with monthly & quarterly targets`);
  console.log(`📈 Created monthly progress tracking`);
  console.log(`📋 Created quarterly summary`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
