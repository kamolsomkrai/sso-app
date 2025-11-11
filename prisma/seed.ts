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
      role: UserRole.OPERATOR,
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
      role: UserRole.DEPT_HEAD,
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
      role: UserRole.EXECUTIVE,
    },
  });

  // ----------------------------------------------------
  // 2. สร้างปีงบประมาณ (FiscalYears)
  // ----------------------------------------------------
  console.log("Seeding Fiscal Years...");
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
      category_type: CategoryType.revenue,
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
      category_type: CategoryType.expense,
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
      category_type: CategoryType.revenue,
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
      category_type: CategoryType.expense,
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
      category_type: CategoryType.expense,
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
      category_type: CategoryType.revenue,
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
      category_type: CategoryType.expense,
      level: 3,
      display_order: 1,
      parent_id: exp01.category_id,
    },
  });
  const nonDrug = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP0202" },
    update: {},
    create: {
      category_code: "EXP0202",
      category_name: "ค่าเวชภัณฑ์มิใช่ยา",
      category_type: CategoryType.expense,
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
      category_code: "EXP020201",
      category_name: "ค่าวัสดุการแพทย์",
      category_type: CategoryType.expense,
      level: 4,
      display_order: 1,
      parent_id: nonDrug.category_id,
    },
  });
  const sciSupply = await prisma.budgetCategory.upsert({
    where: { category_code: "EXP020202" },
    update: {},
    create: {
      category_code: "EXP020202",
      category_name: "ค่าวัสดุวิทยาศาสตร์การแพทย์",
      category_type: CategoryType.expense,
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
      category_type: CategoryType.expense,
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
      category_type: CategoryType.expense,
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
      category_type: CategoryType.expense,
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
      category_type: CategoryType.expense,
      level: 2,
      display_order: 13,
      parent_id: expL1.category_id,
    },
  });
  const pcuDept = await prisma.budgetCategory.upsert({
    where: { category_code: "DEPT_PCU" },
    update: {},
    create: {
      category_code: "DEPT_PCU",
      category_name: "PCU",
      category_type: CategoryType.expense,
      level: 2,
      display_order: 14,
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
  // 5. สร้าง "ราย list" (L4 Items) - ตามข้อมูลที่ให้มา
  // ----------------------------------------------------
  console.log("Seeding Procurement Items (L4)...");

  // รายการวัสดุการแพทย์
  const item1 = await prisma.procurementItem.create({
    data: {
      item_name: "เครื่องวัดความดันดิจิตอลแบบพกพา",
      procurement_code: "MED-001",
      unit: "เครื่อง",
      quantity: 1,
      unit_price: 2900.0,
      plan_amount: 2900.0,
      requesting_dept_id: lrDept.category_id,
      category_id: medSupply.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  const item2 = await prisma.procurementItem.create({
    data: {
      item_name: "ชุดตรวจคัดกรอง COVID-19 Rapid Test",
      procurement_code: "MED-002",
      unit: "ชุด",
      quantity: 100,
      unit_price: 150.0,
      plan_amount: 15000.0,
      requesting_dept_id: erDept.category_id,
      category_id: medSupply.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  const item3 = await prisma.procurementItem.create({
    data: {
      item_name: "สายสวนหลอดเลือดดำ ขนาดต่างๆ",
      procurement_code: "MED-003",
      unit: "ชุด",
      quantity: 50,
      unit_price: 80.0,
      plan_amount: 4000.0,
      requesting_dept_id: ipd1Dept.category_id,
      category_id: medSupply.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  // รายการวัสดุวิทยาศาสตร์การแพทย์
  const item4 = await prisma.procurementItem.create({
    data: {
      item_name: "สารเคมีตรวจเลือด CBC",
      procurement_code: "SCI-001",
      unit: "ชุด",
      quantity: 20,
      unit_price: 1200.0,
      plan_amount: 24000.0,
      requesting_dept_id: labDept.category_id,
      category_id: sciSupply.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  // รายการครุภัณฑ์ต่ำกว่าเกณฑ์ (ตามข้อมูลตัวอย่าง)
  const item5 = await prisma.procurementItem.create({
    data: {
      item_name: "แบตเตอรี่รถยนต์ 12 V 200Ah",
      procurement_code: "EQP-001",
      unit: "ก้อน",
      quantity: 2,
      unit_price: 7000.0,
      plan_amount: 14000.0,
      requesting_dept_id: lrDept.category_id, // งานซ่อมบำรุง
      category_id: medSupply.category_id, // ใช้ medSupply ชั่วคราว
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  const item6 = await prisma.procurementItem.create({
    data: {
      item_name: "บันไดอลูมิเนียม 7 ขั้น",
      procurement_code: "EQP-002",
      unit: "ตัว",
      quantity: 1,
      unit_price: 1500.0,
      plan_amount: 1500.0,
      requesting_dept_id: lrDept.category_id, // งานซ่อมบำรุง
      category_id: medSupply.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  // รายการวัสดุสำนักงาน
  const item7 = await prisma.procurementItem.create({
    data: {
      item_name: "สติ๊กเกอร์เทอร์มอล ขนาด 5*3 ซม.",
      procurement_code: "OFF-001",
      unit: "ม้วน",
      quantity: 10,
      unit_price: 150.0,
      plan_amount: 1500.0,
      requesting_dept_id: pcuDept.category_id, // PCU
      category_id: medSupply.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  const item8 = await prisma.procurementItem.create({
    data: {
      item_name: "กล่องเอกสาร 3 ช่อง",
      procurement_code: "OFF-002",
      unit: "กล่อง",
      quantity: 4,
      unit_price: 300.0,
      plan_amount: 1200.0,
      requesting_dept_id: pcuDept.category_id, // PCU
      category_id: medSupply.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  // ----------------------------------------------------
  // 6. สร้าง "ข้อมูลใช้จริงรายเดือน" (MonthlyActualEntry)
  // ----------------------------------------------------
  console.log("Seeding Monthly Actual Entries (5-Year History)...");

  // ข้อมูลจริงสำหรับเครื่องวัดความดัน (3 ปีย้อนหลัง)
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 2800.0,
      fiscalYear: 2568,
      month: 10,
      procurement_item_id: item1.item_id,
      category_id: item1.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 2750.0,
      fiscalYear: 2567,
      month: 11,
      procurement_item_id: item1.item_id,
      category_id: item1.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 2700.0,
      fiscalYear: 2566,
      month: 10,
      procurement_item_id: item1.item_id,
      category_id: item1.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  // ข้อมูลจริงสำหรับชุดตรวจ COVID-19
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 6000.0,
      fiscalYear: 2568,
      month: 10,
      procurement_item_id: item2.item_id,
      category_id: item2.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 5000.0,
      fiscalYear: 2568,
      month: 1,
      procurement_item_id: item2.item_id,
      category_id: item2.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 7000.0,
      fiscalYear: 2567,
      month: 10,
      procurement_item_id: item2.item_id,
      category_id: item2.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  // ข้อมูลจริงสำหรับสารเคมีตรวจเลือด
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 10000.0,
      fiscalYear: 2568,
      month: 10,
      procurement_item_id: item4.item_id,
      category_id: item4.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 11000.0,
      fiscalYear: 2568,
      month: 1,
      procurement_item_id: item4.item_id,
      category_id: item4.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 9000.0,
      fiscalYear: 2567,
      month: 10,
      procurement_item_id: item4.item_id,
      category_id: item4.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });

  // ข้อมูลจริงสำหรับสติ๊กเกอร์เทอร์มอล (กระจายตามไตรมาส)
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 750.0,
      fiscalYear: 2569,
      month: 3, // ไตรมาส 1
      procurement_item_id: item7.item_id,
      category_id: item7.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      amount: 750.0,
      fiscalYear: 2569,
      month: 7, // ไตรมาส 3
      procurement_item_id: item7.item_id,
      category_id: item7.category_id,
      createdById: user1.providerId,
      updatedById: user1.providerId,
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
