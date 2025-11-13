// prisma/seed.ts

import { PrismaClient, UserRole, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Starting seed ---");

  // ----------------------------------------------------
  // 1. สร้างผู้ใช้งาน (Users)
  // ----------------------------------------------------
  console.log("Seeding Users...");
  const user1 = await prisma.user.upsert({
    where: { providerId: "provider-1001" },
    update: {},
    create: {
      providerId: "provider-1001",
      firstName: "สมชาย",
      lastName: "ใจดี",
      position: "นักวิชาการคอมพิวเตอร์",
      role: "OPERATOR",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { providerId: "provider-2002" },
    update: {},
    create: {
      providerId: "provider-2002",
      firstName: "สมศรี",
      lastName: "มั่งมี",
      position: "หัวหน้าฝ่ายบริหาร",
      role: "DEPT_HEAD",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { providerId: "provider-9009" },
    update: {},
    create: {
      providerId: "provider-9009",
      firstName: "อารี",
      lastName: "สุจริต",
      position: "ผู้อำนวยการ",
      role: "EXECUTIVE",
    },
  });

  // ----------------------------------------------------
  // 2. สร้างปีงบประมาณ (FiscalYears) - (เพิ่ม 2565)
  // ----------------------------------------------------
  console.log("Seeding Fiscal Years...");
  await prisma.fiscalYear.upsert({
    where: { fiscal_year: 2565 },
    update: {},
    create: { fiscal_year: 2565, year_label: "2565" },
  });
  await prisma.fiscalYear.upsert({
    where: { fiscal_year: 2566 },
    update: {},
    create: { fiscal_year: 2566, year_label: "2566" },
  });
  await prisma.fiscalYear.upsert({
    where: { fiscal_year: 2567 },
    update: {},
    create: { fiscal_year: 2567, year_label: "2567" },
  });
  await prisma.fiscalYear.upsert({
    where: { fiscal_year: 2568 },
    update: {},
    create: { fiscal_year: 2568, year_label: "2568" },
  });
  await prisma.fiscalYear.upsert({
    where: { fiscal_year: 2569 },
    update: {},
    create: {
      fiscal_year: 2569,
      year_label: "2569",
      is_active: true,
      is_planning: true,
    },
  });
  await prisma.fiscalYear.upsert({
    where: { fiscal_year: 2570 },
    update: {},
    create: { fiscal_year: 2570, year_label: "2570", is_planning: true },
  });
  await prisma.fiscalYear.upsert({
    where: { fiscal_year: 2571 },
    update: {},
    create: { fiscal_year: 2571, year_label: "2571", is_planning: true },
  });

  // ----------------------------------------------------
  // 3. สร้างหมวดหมู่งบประมาณ (BudgetCategory Tree)
  // ----------------------------------------------------
  console.log("Seeding Budget Categories (L1)...");
  const revL1 = await prisma.budgetCategory.upsert({
    where: { category_code: "REV" },
    update: {},
    create: {
      category_code: "REV",
      category_name: "รายรับ",
      category_type: "revenue",
      level: 1,
      display_order: 1,
    },
  });
  const expL1 = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP" },
    update: {},
    create: {
      category_code: "EXP",
      category_name: "รายจ่าย",
      category_type: "expense",
      level: 1,
      display_order: 2,
    },
  });

  console.log("Seeding Budget Categories (L2)...");
  const rev01 = await prisma.budgetCategory.upsert({
    where: { category_code: "REV01" },
    update: {},
    create: {
      category_code: "REV01",
      category_name: "รายรับจากการดำเนินงาน",
      category_type: "revenue",
      level: 2,
      display_order: 1,
      parent_id: revL1.category_id,
    },
  });
  const exp01 = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP01" },
    update: {},
    create: {
      category_code: "EXP01",
      category_name: "รายจ่ายบุคลากร",
      category_type: "expense",
      level: 2,
      display_order: 1,
      parent_id: expL1.category_id,
    },
  });
  const exp02 = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP02" },
    update: {},
    create: {
      category_code: "EXP02",
      category_name: "รายจ่ายจากการดำเนินงาน",
      category_type: "expense",
      level: 2,
      display_order: 2,
      parent_id: expL1.category_id,
    },
  });

  console.log("Seeding Budget Categories (L3)...");
  const ucRevenue = await prisma.budgetCategory.upsert({
    where: { category_code: "REV0101" },
    update: {},
    create: {
      category_code: "REV0101",
      category_name: "รายรับค่ารักษาพยาบาลสำหรับโครงการสุขภาพถ้วนหน้า UC",
      category_type: "revenue",
      level: 3,
      display_order: 1,
      parent_id: rev01.category_id,
    },
  });
  const exp0101 = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP0101" },
    update: {},
    create: {
      category_code: "EXP0101",
      category_name: "ค่าจ้างลูกจ้างชั่วคราว / พนักงานกระทรวง",
      category_type: "expense",
      level: 3,
      display_order: 1,
      parent_id: exp01.category_id,
    },
  });
  const nonDrug = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP0202" },
    update: {},
    create: {
      category_id: "l3-nondrug-uuid", //
      category_code: "EXP0202",
      category_name: "ค่าเวชภัณฑ์มิใช่ยา",
      category_type: "expense",
      level: 3,
      display_order: 2,
      parent_id: exp02.category_id,
    },
  });

  console.log("Seeding Budget Categories (L4)...");
  const medSupply = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP020201" },
    update: {},
    create: {
      category_id: "l4-medsupply-uuid", //
      category_code: "EXP020201",
      category_name: "ค่าวัสดุการแพทย์",
      category_type: "expense",
      level: 4,
      display_order: 1,
      parent_id: nonDrug.category_id,
    },
  });
  const sciSupply = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP020202" },
    update: {},
    create: {
      category_id: "l4-scisupply-uuid", //
      category_code: "EXP020202",
      category_name: "ค่าวัสดุวิทยาศาสตร์การแพทย์",
      category_type: "expense",
      level: 4,
      display_order: 2,
      parent_id: nonDrug.category_id,
    },
  });

  // สร้าง L2 Department Categories (สำหรับ `requesting_dept_id`)
  console.log("Seeding L2 Requesting Departments...");
  const lrDept = await prisma.budgetCategory.upsert({
    where: { category_code: "DEPT_LR" },
    update: {},
    create: {
      category_code: "DEPT_LR",
      category_name: "LR",
      category_type: "expense",
      level: 2,
      display_order: 10,
      parent_id: expL1.category_id,
    },
  });
  const erDept = await prisma.budgetCategory.upsert({
    where: { category_code: "DEPT_ER" },
    update: {},
    create: {
      category_code: "DEPT_ER",
      category_name: "ER",
      category_type: "expense",
      level: 2,
      display_order: 11,
      parent_id: expL1.category_id,
    },
  });
  const ipd1Dept = await prisma.budgetCategory.upsert({
    where: { category_code: "DEPT_IPD1" },
    update: {},
    create: {
      category_code: "DEPT_IPD1",
      category_name: "IPD1",
      category_type: "expense",
      level: 2,
      display_order: 12,
      parent_id: expL1.category_id,
    },
  });
  const labDept = await prisma.budgetCategory.upsert({
    where: { category_code: "DEPT_LAB" },
    update: {},
    create: {
      category_code: "DEPT_LAB",
      category_name: "LAB",
      category_type: "expense",
      level: 2,
      display_order: 13,
      parent_id: expL1.category_id,
    },
  });

  // ----------------------------------------------------
  // 4. สร้าง "แผน" (Targets)
  // ----------------------------------------------------
  console.log("Seeding Plan Financial Data...");
  await prisma.planFinancialData.upsert({
    where: {
      category_id_fiscal_year: {
        category_id: ucRevenue.category_id,
        fiscal_year: 2569,
      },
    },
    update: {},
    create: {
      category_id: ucRevenue.category_id,
      fiscal_year: 2569,
      plan_amount: 59315000.0,
    },
  });
  await prisma.planFinancialData.upsert({
    where: {
      category_id_fiscal_year: {
        category_id: ucRevenue.category_id,
        fiscal_year: 2570,
      },
    },
    update: {},
    create: {
      category_id: ucRevenue.category_id,
      fiscal_year: 2570,
      plan_amount: 60501300.0,
    },
  });
  await prisma.planFinancialData.upsert({
    where: {
      category_id_fiscal_year: {
        category_id: ucRevenue.category_id,
        fiscal_year: 2571,
      },
    },
    update: {},
    create: {
      category_id: ucRevenue.category_id,
      fiscal_year: 2571,
      plan_amount: 61711326.0,
    },
  });
  await prisma.planFinancialData.upsert({
    where: {
      category_id_fiscal_year: {
        category_id: medSupply.category_id,
        fiscal_year: 2569,
      },
    },
    update: {},
    create: {
      category_id: medSupply.category_id,
      fiscal_year: 2569,
      plan_amount: 2400000.0,
    },
  });
  await prisma.planFinancialData.upsert({
    where: {
      category_id_fiscal_year: {
        category_id: medSupply.category_id,
        fiscal_year: 2570,
      },
    },
    update: {},
    create: {
      category_id: medSupply.category_id,
      fiscal_year: 2570,
      plan_amount: 2448000.0,
    },
  });
  await prisma.planFinancialData.upsert({
    where: {
      category_id_fiscal_year: {
        category_id: medSupply.category_id,
        fiscal_year: 2571,
      },
    },
    update: {},
    create: {
      category_id: medSupply.category_id,
      fiscal_year: 2571,
      plan_amount: 2496960.0,
    },
  });

  // ----------------------------------------------------
  // 5. สร้าง "ราย list" (L4 Items)
  // ----------------------------------------------------
  console.log("Seeding Procurement Items (L4)...");

  const item1 = await prisma.procurementItem.upsert({
    where: { item_id: 1 },
    update: {},
    create: {
      item_name: "เครื่องวัดความดันดิจิตอลแบบพกพา",
      procurement_code: "MED-001",
      unit: "เครื่อง",
      quantity: 1,
      unit_price: 2900.0,
      plan_amount: 2900.0,
      requestingDept: { connect: { category_id: lrDept.category_id } },
      category: { connect: { category_id: medSupply.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  const item2 = await prisma.procurementItem.upsert({
    where: { item_id: 2 },
    update: {},
    create: {
      item_name: "ชุดตรวจคัดกรอง COVID-19 Rapid Test",
      procurement_code: "MED-002",
      unit: "ชุด",
      quantity: 100,
      unit_price: 150.0,
      plan_amount: 15000.0,
      requestingDept: { connect: { category_id: erDept.category_id } },
      category: { connect: { category_id: medSupply.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  const item3 = await prisma.procurementItem.upsert({
    where: { item_id: 3 },
    update: {},
    create: {
      item_name: "สายสวนหลอดเลือดดำ ขนาดต่างๆ",
      procurement_code: "MED-003",
      unit: "ชุด",
      quantity: 50,
      unit_price: 80.0,
      plan_amount: 4000.0,
      requestingDept: { connect: { category_id: ipd1Dept.category_id } },
      category: { connect: { category_id: medSupply.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  const item4 = await prisma.procurementItem.upsert({
    where: { item_id: 4 },
    update: {},
    create: {
      item_name: "สารเคมีตรวจเลือด CBC",
      procurement_code: "SCI-001",
      unit: "ชุด",
      quantity: 20,
      unit_price: 1200.0,
      plan_amount: 24000.0,
      requestingDept: { connect: { category_id: labDept.category_id } },
      category: { connect: { category_id: sciSupply.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  // ----------------------------------------------------
  // 6. สร้าง "ข้อมูลใช้จริงรายเดือน" (MonthlyActualEntry)
  // (อัปเดตให้ครอบคลุม 5 ปี)
  // ----------------------------------------------------
  console.log("Seeding Monthly Actual Entries (5-Year History)...");

  // --- 🔴 ปีปัจจุบัน 2569 (ข้อมูลรายเดือน) ---
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 2900.0,
      fiscalYear: 2569,
      month: 10, // ต.ค. 68
      procurementItem: { connect: { item_id: item1.item_id } },
      category: { connect: { category_id: item1.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 7000.0,
      fiscalYear: 2569,
      month: 10, // ต.ค. 68
      procurementItem: { connect: { item_id: item2.item_id } },
      category: { connect: { category_id: item2.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 8000.0,
      fiscalYear: 2569,
      month: 11, // พ.ย. 68
      procurementItem: { connect: { item_id: item2.item_id } },
      category: { connect: { category_id: item2.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 4000.0,
      fiscalYear: 2569,
      month: 10, // ต.ค. 68
      procurementItem: { connect: { item_id: item3.item_id } },
      category: { connect: { category_id: item3.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 12000.0,
      fiscalYear: 2569,
      month: 10, // ต.ค. 68
      procurementItem: { connect: { item_id: item4.item_id } },
      category: { connect: { category_id: item4.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 12000.0,
      fiscalYear: 2569,
      month: 11, // พ.ย. 68
      procurementItem: { connect: { item_id: item4.item_id } },
      category: { connect: { category_id: item4.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  // --- 🔵 ปี 2568 (ยอดรวมปีก่อน) ---
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 2800.0,
      fiscalYear: 2568,
      month: 10,
      procurementItem: { connect: { item_id: item1.item_id } },
      category: { connect: { category_id: item1.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 11000.0,
      fiscalYear: 2568,
      month: 10, // (6000 + 5000)
      procurementItem: { connect: { item_id: item2.item_id } },
      category: { connect: { category_id: item2.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 3800.0,
      fiscalYear: 2568,
      month: 10,
      procurementItem: { connect: { item_id: item3.item_id } },
      category: { connect: { category_id: item3.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 21000.0,
      fiscalYear: 2568,
      month: 10, // (10000 + 11000)
      procurementItem: { connect: { item_id: item4.item_id } },
      category: { connect: { category_id: item4.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  // --- 🔵 ปี 2567 (ยอดรวมปีก่อน) ---
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 2750.0,
      fiscalYear: 2567,
      month: 10,
      procurementItem: { connect: { item_id: item1.item_id } },
      category: { connect: { category_id: item1.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 15000.0,
      fiscalYear: 2567,
      month: 10, // (7000 + 8000)
      procurementItem: { connect: { item_id: item2.item_id } },
      category: { connect: { category_id: item2.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 3500.0,
      fiscalYear: 2567,
      month: 10,
      procurementItem: { connect: { item_id: item3.item_id } },
      category: { connect: { category_id: item3.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 9000.0,
      fiscalYear: 2567,
      month: 10,
      procurementItem: { connect: { item_id: item4.item_id } },
      category: { connect: { category_id: item4.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  // --- 🔵 ปี 2566 (ยอดรวมปีก่อน) ---
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 2700.0,
      fiscalYear: 2566,
      month: 10,
      procurementItem: { connect: { item_id: item1.item_id } },
      category: { connect: { category_id: item1.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 15000.0,
      fiscalYear: 2566,
      month: 10,
      procurementItem: { connect: { item_id: item2.item_id } },
      category: { connect: { category_id: item2.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 3500.0,
      fiscalYear: 2566,
      month: 10,
      procurementItem: { connect: { item_id: item3.item_id } },
      category: { connect: { category_id: item3.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 8500.0,
      fiscalYear: 2566,
      month: 10,
      procurementItem: { connect: { item_id: item4.item_id } },
      category: { connect: { category_id: item4.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  // --- 🔵 ปี 2565 (ยอดรวมปีก่อน) ---
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 2500.0,
      fiscalYear: 2565,
      month: 10,
      procurementItem: { connect: { item_id: item1.item_id } },
      category: { connect: { category_id: item1.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 20000.0,
      fiscalYear: 2565,
      month: 10,
      procurementItem: { connect: { item_id: item2.item_id } },
      category: { connect: { category_id: item2.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 3000.0,
      fiscalYear: 2565,
      month: 10,
      procurementItem: { connect: { item_id: item3.item_id } },
      category: { connect: { category_id: item3.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 8000.0,
      fiscalYear: 2565,
      month: 10,
      procurementItem: { connect: { item_id: item4.item_id } },
      category: { connect: { category_id: item4.category_id } },
      createdBy: { connect: { providerId: user1.providerId } },
      updatedBy: { connect: { providerId: user1.providerId } },
    },
  });

  console.log("--- Seed finished successfully ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
