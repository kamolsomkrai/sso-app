import { PrismaClient, UserRole, BudgetType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // 1. Create Departments
  const itDept = await prisma.department.create({ data: { name: "IT" } });
  const hrDept = await prisma.department.create({ data: { name: "HR" } });
  const financeDept = await prisma.department.create({
    data: { name: "Finance" },
  });

  // 2. Create Categories
  const softwareCat = await prisma.expenseCategory.create({
    data: { name: "Software" },
  });
  const hardwareCat = await prisma.expenseCategory.create({
    data: { name: "Hardware" },
  });
  const servicesCat = await prisma.expenseCategory.create({
    data: { name: "Services" },
  });

  // 3. Create Users (Roles)
  const executive = await prisma.user.create({
    data: {
      email: "executive@sso.th",
      name: "ผู้บริหาร",
      role: UserRole.EXECUTIVE,
    },
  });

  const itHead = await prisma.user.create({
    data: {
      email: "it.head@sso.th",
      name: "หัวหน้าแผนก IT",
      role: UserRole.DEPT_HEAD,
      departmentId: itDept.id,
    },
  });

  const softwareHead = await prisma.user.create({
    data: {
      email: "software.head@sso.th",
      name: "หัวหน้ากลุ่ม Software",
      role: UserRole.GROUP_HEAD,
      departmentId: itDept.id,
      // หมายเหตุ: ในระบบจริง อาจต้องมีตาราง Group แยกย่อย
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@sso.th",
      name: "ผู้ปฏิบัติงาน IT",
      role: UserRole.OPERATOR,
      departmentId: itDept.id,
    },
  });

  // 4. Create Mock Budgets (Targets) - FY2024 (ปีงบ 2567)
  const currentFiscalYear = 2024; // สมมติปีงบ 2567
  const budgetMonths = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Thai FY Months

  // L1 - Executive Budget (Expense)
  for (const month of budgetMonths) {
    await prisma.budget.create({
      data: {
        year: currentFiscalYear,
        month: month,
        amount: 500000, // เป้าหมายรวม 5 แสน/เดือน
        type: BudgetType.EXPENSE,
        departmentId: null, // null = L1 Executive
        categoryId: null,
      },
    });
  }

  // L2 - IT Department Budget (Expense)
  for (const month of budgetMonths) {
    await prisma.budget.create({
      data: {
        year: currentFiscalYear,
        month: month,
        amount: 200000, // เป้าหมาย IT 2 แสน/เดือน
        type: BudgetType.EXPENSE,
        departmentId: itDept.id, // L2
        categoryId: null,
      },
    });
  }

  // L3 - Software Category Budget (Expense)
  for (const month of budgetMonths) {
    await prisma.budget.create({
      data: {
        year: currentFiscalYear,
        month: month,
        amount: 80000, // เป้าหมาย Software 8 หมื่น/เดือน
        type: BudgetType.EXPENSE,
        departmentId: itDept.id,
        categoryId: softwareCat.id, // L3
      },
    });
  }

  // 5. Create Mock Expense Items (Actuals)
  // Q1 FY2024 (Oct-Dec 2023)
  await prisma.expenseItem.create({
    data: {
      name: "AWS WAF",
      details: "AWS WAF for 10 websites",
      actualCost: 75000,
      date: new Date("2023-10-15T10:00:00Z"), // ต.ค.
      departmentId: itDept.id,
      categoryId: softwareCat.id,
    },
  });
  await prisma.expenseItem.create({
    data: {
      name: "New Server",
      details: "Dell PowerEdge R760",
      actualCost: 150000, // ใช้เกินงบ L3
      date: new Date("2023-11-20T10:00:00Z"), // พ.ย.
      departmentId: itDept.id,
      categoryId: hardwareCat.id,
    },
  });
  await prisma.expenseItem.create({
    data: {
      name: "HR Software License",
      details: "Workday 1 year",
      actualCost: 120000,
      date: new Date("2023-11-25T10:00:00Z"), // พ.ย.
      departmentId: hrDept.id,
      categoryId: softwareCat.id,
    },
  });

  // 6. Create Mock Variance Note (Root Cause)
  await prisma.varianceNote.create({
    data: {
      year: currentFiscalYear,
      quarter: 1, // Q1
      note: "ค่าใช้จ่าย Q1 เกินเป้า 5% เนื่องจากจัดซื้อ Server ด่วน (Dell R760) นอกแผนงาน ทดแทนเครื่องเก่าที่เสียหาย",
      departmentId: itDept.id,
      authorUserId: itHead.id,
    },
  });

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
