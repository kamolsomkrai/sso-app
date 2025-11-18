import { PrismaClient, UserRole } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // --- 1. Create Users ---
  const userExec = await prisma.user.upsert({
    where: { email: "exec@example.com" },
    update: {},
    create: {
      clerkId: "user_exec_001",
      email: "exec@example.com",
      name: "ผู้บริหาร",
      role: UserRole.EXECUTIVE,
    },
  });

  const userOp = await prisma.user.upsert({
    where: { email: "operator@example.com" },
    update: {},
    create: {
      clerkId: "user_op_001",
      email: "operator@example.com",
      name: "ผู้ปฏิบัติงาน",
      role: UserRole.OPERATOR,
    },
  });
  console.log("Created users...");

  // --- 2. Create Category Tree (L1-L4) ---

  // L1 Revenue
  const l1_revenue = await prisma.budgetCategory.upsert({
    where: { categoryCode: "REV" },
    update: { categoryName: "รายรับ" },
    create: {
      categoryCode: "REV",
      categoryName: "รายรับ",
      level: 1,
      categoryType: "revenue",
      icon: "TrendingUp",
    },
  });

  // L2 Revenue
  const l2_rev_op = await prisma.budgetCategory.upsert({
    where: { categoryCode: "REV-OP" },
    update: { categoryName: "รายรับจากการดำเนินงาน" },
    create: {
      categoryCode: "REV-OP",
      categoryName: "รายรับจากการดำเนินงาน",
      level: 2,
      categoryType: "revenue",
      icon: "Activity",
      parentId: l1_revenue.id,
    },
  });

  // L3 Revenue (Example)
  await prisma.budgetCategory.upsert({
    where: { categoryCode: "REV-OP-UC" },
    update: {},
    create: {
      categoryCode: "REV-OP-UC",
      categoryName: "รายรับค่ารักษาพยาบาล UC",
      level: 3,
      categoryType: "revenue",
      parentId: l2_rev_op.id,
    },
  });
  await prisma.budgetCategory.upsert({
    where: { categoryCode: "REV-OP-EMS" },
    update: {},
    create: {
      categoryCode: "REV-OP-EMS",
      categoryName: "รายรับจากระบบปฏิบัติการฉุกเฉิน (EMS)",
      level: 3,
      categoryType: "revenue",
      parentId: l2_rev_op.id,
    },
  });

  // L1 Expense
  const l1_expense = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP" },
    update: { categoryName: "รายจ่าย" },
    create: {
      categoryCode: "EXP",
      categoryName: "รายจ่าย",
      level: 1,
      categoryType: "expense",
      icon: "TrendingDown",
    },
  });

  // L2 Expense
  const l2_exp_hr = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP-HR" },
    update: { categoryName: "รายจ่ายบุคลากร" },
    create: {
      categoryCode: "EXP-HR",
      categoryName: "รายจ่ายบุคลากร",
      level: 2,
      categoryType: "expense",
      icon: "Users",
      parentId: l1_expense.id,
    },
  });

  const l2_exp_op = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP-OP" },
    update: { categoryName: "รายจ่ายจากการดำเนินงาน" },
    create: {
      categoryCode: "EXP-OP",
      categoryName: "รายจ่ายจากการดำเนินงาน",
      level: 2,
      categoryType: "expense",
      icon: "Settings",
      parentId: l1_expense.id,
    },
  });

  const l2_exp_invest = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP-INV" },
    update: { categoryName: "รายจ่ายลงทุน" },
    create: {
      categoryCode: "EXP-INV",
      categoryName: "รายจ่ายลงทุน",
      level: 2,
      categoryType: "expense",
      icon: "Landmark",
      parentId: l1_expense.id,
    },
  });

  // L3 Expense (HR)
  const l3_exp_hr_salary = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP-HR-SAL" },
    update: {},
    create: {
      categoryCode: "EXP-HR-SAL",
      categoryName: "เงินเดือนและค่าจ้าง",
      level: 3,
      categoryType: "expense",
      parentId: l2_exp_hr.id,
    },
  });

  // L3 Expense (OP)
  const l3_exp_op_med = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP-OP-MED" },
    update: {},
    create: {
      categoryCode: "EXP-OP-MED",
      categoryName: "ค่ายา",
      level: 3,
      categoryType: "expense",
      parentId: l2_exp_op.id,
    },
  });

  const l3_exp_op_supply = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP-OP-SUP" },
    update: {},
    create: {
      categoryCode: "EXP-OP-SUP",
      categoryName: "ค่าเวชภัณฑ์มิใช่ยา",
      level: 3,
      categoryType: "expense",
      parentId: l2_exp_op.id,
    },
  });

  // L4 Expense (OP-SUP)
  const l4_med_supply = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP-OP-SUP-MED" },
    update: {},
    create: {
      categoryCode: "EXP-OP-SUP-MED",
      categoryName: "ค่าวัสดุการแพทย์",
      level: 4,
      categoryType: "expense",
      parentId: l3_exp_op_supply.id,
    },
  });

  const l4_lab_supply = await prisma.budgetCategory.upsert({
    where: { categoryCode: "EXP-OP-SUP-LAB" },
    update: {},
    create: {
      categoryCode: "EXP-OP-SUP-LAB",
      categoryName: "ค่าวัสดุวิทยาศาสตร์การแพทย์",
      level: 4,
      categoryType: "expense",
      parentId: l3_exp_op_supply.id,
    },
  });

  console.log("Created category tree...");

  // --- 3. Create Procurement Items (L4 Items) ---
  const item1_mask = await prisma.procurementItem.upsert({
    where: { id: "item_mask_001" },
    update: {},
    create: {
      id: "item_mask_001",
      itemName: "หน้ากากอนามัยทางการแพทย์",
      unitName: "กล่อง",
      inventory: 500, // มีของในคลัง 500 กล่อง
      procurementType: "ประกวดราคา",
      categoryId: l4_med_supply.id,
      createdById: userOp.id,
      updatedById: userOp.id,
    },
  });

  const item2_gloves = await prisma.procurementItem.upsert({
    where: { id: "item_gloves_001" },
    update: {},
    create: {
      id: "item_gloves_001",
      itemName: "ถุงมือยาง Size M",
      unitName: "กล่อง",
      inventory: 1000,
      procurementType: "สอบราคา",
      categoryId: l4_med_supply.id,
      createdById: userOp.id,
      updatedById: userOp.id,
    },
  });

  const item3_test_tube = await prisma.procurementItem.upsert({
    where: { id: "item_testtube_001" },
    update: {},
    create: {
      id: "item_testtube_001",
      itemName: "Test Tube 5ml",
      unitName: "ชิ้น",
      inventory: 2500,
      procurementType: "จัดซื้อโดยตรง",
      categoryId: l4_lab_supply.id,
      createdById: userOp.id,
      updatedById: userOp.id,
    },
  });
  console.log("Created procurement items...");

  // --- 4. Create Plan Data ---
  // L1 Plan
  await prisma.planFinancialData.upsert({
    where: { id: "plan_rev_2567" },
    update: {},
    create: {
      id: "plan_rev_2567",
      fiscalYear: 2567,
      planAmount: new Decimal("120000000"),
      categoryId: l1_revenue.id,
    },
  });
  await prisma.planFinancialData.upsert({
    where: { id: "plan_exp_2567" },
    update: {},
    create: {
      id: "plan_exp_2567",
      fiscalYear: 2567,
      planAmount: new Decimal("100000000"),
      categoryId: l1_expense.id,
    },
  });
  // L3 Plan
  await prisma.planFinancialData.upsert({
    where: { id: "plan_exp_hr_sal_2567" },
    update: {},
    create: {
      id: "plan_exp_hr_sal_2567",
      fiscalYear: 2567,
      planAmount: new Decimal("40000000"),
      categoryId: l3_exp_hr_salary.id,
    },
  });
  // L4 Plan
  await prisma.planFinancialData.upsert({
    where: { id: "plan_l4_medsup_2567" },
    update: {},
    create: {
      id: "plan_l4_medsup_2567",
      fiscalYear: 2567,
      planAmount: new Decimal("5000000"),
      categoryId: l4_med_supply.id,
    },
  });
  // Item Plan
  await prisma.planFinancialData.upsert({
    where: { id: "plan_item_mask_2567" },
    update: {},
    create: {
      id: "plan_item_mask_2567",
      fiscalYear: 2567,
      planAmount: new Decimal("50000"), // แผนซื้อหน้ากาก 50,000 บาท
      categoryId: l4_med_supply.id,
      procurementItemId: item1_mask.id,
    },
  });
  await prisma.planFinancialData.upsert({
    where: { id: "plan_item_gloves_2567" },
    update: {},
    create: {
      id: "plan_item_gloves_2567",
      fiscalYear: 2567,
      planAmount: new Decimal("120000"),
      categoryId: l4_med_supply.id,
      procurementItemId: item2_gloves.id,
    },
  });

  // Plans for 2566
  await prisma.planFinancialData.upsert({
    where: { id: "plan_exp_2566" },
    update: {},
    create: {
      id: "plan_exp_2566",
      fiscalYear: 2566,
      planAmount: new Decimal("95000000"),
      categoryId: l1_expense.id,
    },
  });
  await prisma.planFinancialData.upsert({
    where: { id: "plan_item_mask_2566" },
    update: {},
    create: {
      id: "plan_item_mask_2566",
      fiscalYear: 2566,
      planAmount: new Decimal("75000"),
      categoryId: l4_med_supply.id,
      procurementItemId: item1_mask.id,
    },
  });
  // Plans for 2565
  await prisma.planFinancialData.upsert({
    where: { id: "plan_exp_2565" },
    update: {},
    create: {
      id: "plan_exp_2565",
      fiscalYear: 2565,
      planAmount: new Decimal("90000000"),
      categoryId: l1_expense.id,
    },
  });
  await prisma.planFinancialData.upsert({
    where: { id: "plan_item_mask_2565" },
    update: {},
    create: {
      id: "plan_item_mask_2565",
      fiscalYear: 2565,
      planAmount: new Decimal("150000"),
      categoryId: l4_med_supply.id,
      procurementItemId: item1_mask.id,
    },
  });
  console.log("Created plan data...");

  // --- 5. Create Actual Entries (FY 2567) ---
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentFiscalYear =
    currentMonth >= 10 ? today.getFullYear() + 1 : today.getFullYear(); // eg. 2567

  // Entry 1: ซื้อหน้ากาก
  await prisma.monthlyActualEntry.create({
    data: {
      fiscalYear: currentFiscalYear,
      month: currentMonth,
      entryDate: today,
      amount: new Decimal("5000"),
      quantity: 100, // ซื้อ 100 กล่อง
      notes: "ซื้อหน้ากากอนามัย ล็อต 1",
      categoryId: l4_med_supply.id, // L4 Category
      procurementItemId: item1_mask.id, // L4 Item
      recordedById: userOp.id,
    },
  });

  // Entry 2: ซื้อถุงมือ
  await prisma.monthlyActualEntry.create({
    data: {
      fiscalYear: currentFiscalYear,
      month: currentMonth,
      entryDate: today,
      amount: new Decimal("12000"),
      quantity: 50,
      notes: "ซื้อถุงมือยาง",
      categoryId: l4_med_supply.id,
      procurementItemId: item2_gloves.id,
      recordedById: userOp.id,
    },
  });

  // Entry 3: จ่ายเงินเดือน (ไม่ผูก Item)
  await prisma.monthlyActualEntry.create({
    data: {
      fiscalYear: currentFiscalYear,
      month: currentMonth,
      entryDate: today,
      amount: new Decimal("3500000"),
      notes: "เงินเดือนบุคลากร",
      categoryId: l3_exp_hr_salary.id, // L3 Category
      // procurementItemId is null (ถูกต้อง)
      recordedById: userOp.id,
    },
  });

  // --- 6. Create Historical Actual Entries (FY 2566, 2565) ---
  // FY 2566
  await prisma.monthlyActualEntry.create({
    data: {
      fiscalYear: 2566,
      month: 10, // Oct 2022
      entryDate: new Date("2022-10-15T10:00:00Z"),
      amount: new Decimal("8000000"),
      categoryId: l1_expense.id, // ผูกกับ L1
      recordedById: userOp.id,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      fiscalYear: 2566,
      month: 11, // Nov 2022
      entryDate: new Date("2022-11-15T10:00:00Z"),
      amount: new Decimal("10000"),
      categoryId: l4_med_supply.id,
      procurementItemId: item1_mask.id,
      recordedById: userOp.id,
    },
  });

  // FY 2565
  await prisma.monthlyActualEntry.create({
    data: {
      fiscalYear: 2565,
      month: 10, // Oct 2021
      entryDate: new Date("2021-10-15T10:00:00Z"),
      amount: new Decimal("7500000"),
      categoryId: l1_expense.id, // ผูกกับ L1
      recordedById: userOp.id,
    },
  });
  await prisma.monthlyActualEntry.create({
    data: {
      fiscalYear: 2565,
      month: 11, // Nov 2021
      entryDate: new Date("2021-11-15T10:00:00Z"),
      amount: new Decimal("25000"),
      categoryId: l4_med_supply.id,
      procurementItemId: item1_mask.id,
      recordedById: userOp.id,
    },
  });

  console.log("Created actual entries...");
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
