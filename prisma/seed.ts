// prisma/seed-complete.ts
import {
  PrismaClient,
  UserRole,
  CategoryType,
  ProcurementType,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  // ล้างข้อมูลเก่าทั้งหมด (ระวังการใช้ใน production)
  console.log("🧹 Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.monthlyActualEntry.deleteMany();
  await prisma.planFinancialData.deleteMany();
  await prisma.procurementItem.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.user.deleteMany();

  // --- 1. Create Users ---
  console.log("👥 Creating users...");

  const userExec = await prisma.user.create({
    data: {
      providerId: "prov_exec_001",
      cid: "1234567890123",
      email: "executive@hospital.com",
      name: "นพ.พร้อม ใจบริการ",
      firstNameTh: "พร้อม",
      lastNameTh: "ใจบริการ",
      firstNameEn: "Prom",
      lastNameEn: "Jaiboriban",
      titleTh: "นายแพทย์",
      titleEn: "Dr.",
      mobileNumber: "0812345678",
      organizationBusinessId: "HOS001",
      organizationHcode: "12345",
      organizationHnameTh: "โรงพยาบาลตัวอย่าง",
      organizationPosition: "ผู้อำนวยการโรงพยาบาล",
      organizationPositionType: "นพท.",
      ialLevel: 3.0,
      isHrAdmin: false,
      isDirector: true,
      role: UserRole.EXECUTIVE,
      lastLoginAt: new Date(),
    },
  });

  const userDeptHead = await prisma.user.create({
    data: {
      providerId: "prov_dept_001",
      cid: "2345678901234",
      email: "depthead@hospital.com",
      name: "พญ.สมใจ ดูแลดี",
      firstNameTh: "สมใจ",
      lastNameTh: "ดูแลดี",
      firstNameEn: "Somjai",
      lastNameEn: "Duradedee",
      titleTh: "แพทย์หญิง",
      titleEn: "Dr.",
      mobileNumber: "0823456789",
      organizationBusinessId: "HOS001",
      organizationHcode: "12345",
      organizationHnameTh: "โรงพยาบาลตัวอย่าง",
      organizationPosition: "หัวหน้าแผนกเวชปฏิบัติ",
      organizationPositionType: "นพ.",
      ialLevel: 2.8,
      isHrAdmin: true,
      isDirector: false,
      role: UserRole.DEPT_HEAD,
      lastLoginAt: new Date(),
    },
  });

  const userOperator = await prisma.user.create({
    data: {
      providerId: "prov_op_001",
      cid: "3456789012345",
      email: "operator@hospital.com",
      name: "นางสาวปฏิบัติ งานดี",
      firstNameTh: "ปฏิบัติ",
      lastNameTh: "งานดี",
      firstNameEn: "Pattibat",
      lastNameEn: "Ngandee",
      titleTh: "นางสาว",
      titleEn: "Ms.",
      mobileNumber: "0834567890",
      organizationBusinessId: "HOS001",
      organizationHcode: "12345",
      organizationHnameTh: "โรงพยาบาลตัวอย่าง",
      organizationPosition: "เจ้าหน้าที่พัสดุ",
      organizationPositionType: "พนักงานราชการ",
      ialLevel: 2.5,
      isHrAdmin: false,
      isDirector: false,
      role: UserRole.OPERATOR,
      lastLoginAt: new Date(),
    },
  });

  const userGroupHead = await prisma.user.create({
    data: {
      providerId: "prov_group_001",
      cid: "4567890123456",
      email: "grouplead@hospital.com",
      name: "นายกลุ่ม งานนำ",
      firstNameTh: "กลุ่ม",
      lastNameTh: "งานนำ",
      firstNameEn: "Klum",
      lastNameEn: "Ngamnam",
      titleTh: "นาย",
      titleEn: "Mr.",
      mobileNumber: "0845678901",
      organizationBusinessId: "HOS001",
      organizationHcode: "12345",
      organizationHnameTh: "โรงพยาบาลตัวอย่าง",
      organizationPosition: "หัวหน้ากลุ่มงานพัสดุ",
      organizationPositionType: "หัวหน้ากลุ่มงาน",
      ialLevel: 2.7,
      isHrAdmin: false,
      isDirector: false,
      role: UserRole.GROUP_HEAD,
      lastLoginAt: new Date(),
    },
  });

  console.log(`✅ Created ${await prisma.user.count()} users`);

  // --- 2. Create Budget Category Tree ---
  console.log("📊 Creating budget categories...");

  // ========== REVENUE CATEGORIES ==========
  const l1Revenue = await prisma.budgetCategory.create({
    data: {
      categoryCode: "REV",
      categoryName: "รายรับ",
      level: 1,
      categoryType: CategoryType.REVENUE,
      icon: "TrendingUp",
      description: "รายรับทั้งหมดของโรงพยาบาล",
    },
  });

  // L2 Revenue Categories
  const l2RevOp = await prisma.budgetCategory.create({
    data: {
      categoryCode: "REV-OP",
      categoryName: "รายรับจากการดำเนินงาน",
      level: 2,
      categoryType: CategoryType.REVENUE,
      icon: "Activity",
      parentId: l1Revenue.id,
      description: "รายรับจากการให้บริการทางการแพทย์",
    },
  });

  const l2RevGov = await prisma.budgetCategory.create({
    data: {
      categoryCode: "REV-GOV",
      categoryName: "รายรับจากรัฐบาล",
      level: 2,
      categoryType: CategoryType.REVENUE,
      icon: "Landmark",
      parentId: l1Revenue.id,
      description: "รายรับจากงบประมาณรัฐบาล",
    },
  });

  // L3 Revenue Categories
  const l3RevUc = await prisma.budgetCategory.create({
    data: {
      categoryCode: "REV-OP-UC",
      categoryName: "รายรับค่ารักษาพยาบาล UC",
      level: 3,
      categoryType: CategoryType.REVENUE,
      parentId: l2RevOp.id,
      description: "รายรับจากบัตรทอง/Universal Coverage",
    },
  });

  const l3RevEms = await prisma.budgetCategory.create({
    data: {
      categoryCode: "REV-OP-EMS",
      categoryName: "รายรับจากระบบปฏิบัติการฉุกเฉิน",
      level: 3,
      categoryType: CategoryType.REVENUE,
      parentId: l2RevOp.id,
      description: "รายรับจากบริการรถพยาบาลฉุกเฉิน",
    },
  });

  const l3RevOpd = await prisma.budgetCategory.create({
    data: {
      categoryCode: "REV-OP-OPD",
      categoryName: "รายรับจาก OPD",
      level: 3,
      categoryType: CategoryType.REVENUE,
      parentId: l2RevOp.id,
      description: "รายรับจากผู้ป่วยนอก",
    },
  });

  const l3RevGovMain = await prisma.budgetCategory.create({
    data: {
      categoryCode: "REV-GOV-MAIN",
      categoryName: "รายรับรัฐบาล - งบประมาณหลัก",
      level: 3,
      categoryType: CategoryType.REVENUE,
      parentId: l2RevGov.id,
      description: "งบประมาณแผ่นดินหลัก",
    },
  });

  // ========== EXPENSE CATEGORIES ==========
  const l1Expense = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP",
      categoryName: "รายจ่าย",
      level: 1,
      categoryType: CategoryType.EXPENSE,
      icon: "TrendingDown",
      description: "รายจ่ายทั้งหมดของโรงพยาบาล",
    },
  });

  // L2 Expense Categories
  const l2ExpHr = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-HR",
      categoryName: "รายจ่ายบุคลากร",
      level: 2,
      categoryType: CategoryType.EXPENSE,
      icon: "Users",
      parentId: l1Expense.id,
      description: "ค่าใช้จ่ายด้านบุคลากร",
    },
  });

  const l2ExpOp = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-OP",
      categoryName: "รายจ่ายจากการดำเนินงาน",
      level: 2,
      categoryType: CategoryType.EXPENSE,
      icon: "Settings",
      parentId: l1Expense.id,
      description: "ค่าใช้จ่ายในการดำเนินงาน",
    },
  });

  const l2ExpInvest = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-INV",
      categoryName: "รายจ่ายลงทุน",
      level: 2,
      categoryType: CategoryType.EXPENSE,
      icon: "Landmark",
      parentId: l1Expense.id,
      description: "ค่าใช้จ่ายในการลงทุน",
    },
  });

  const l2ExpMaintain = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-MAIN",
      categoryName: "รายจ่ายบำรุงรักษา",
      level: 2,
      categoryType: CategoryType.EXPENSE,
      icon: "Wrench",
      parentId: l1Expense.id,
      description: "ค่าใช้จ่ายบำรุงรักษาอาคารและอุปกรณ์",
    },
  });

  // L3 Expense Categories
  const l3ExpHrSalary = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-HR-SAL",
      categoryName: "เงินเดือนและค่าจ้าง",
      level: 3,
      categoryType: CategoryType.EXPENSE,
      parentId: l2ExpHr.id,
      description: "เงินเดือน ค่าจ้าง และค่าตอบแทน",
    },
  });

  const l3ExpHrWelfare = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-HR-WELF",
      categoryName: "สวัสดิการบุคลากร",
      level: 3,
      categoryType: CategoryType.EXPENSE,
      parentId: l2ExpHr.id,
      description: "ค่ารักษาพยาบาลและสวัสดิการบุคลากร",
    },
  });

  const l3ExpOpMed = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-OP-MED",
      categoryName: "ค่ายา",
      level: 3,
      categoryType: CategoryType.EXPENSE,
      parentId: l2ExpOp.id,
      description: "ค่ายาและเวชภัณฑ์",
    },
  });

  const l3ExpOpSupply = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-OP-SUP",
      categoryName: "ค่าเวชภัณฑ์มิใช่ยา",
      level: 3,
      categoryType: CategoryType.EXPENSE,
      parentId: l2ExpOp.id,
      description: "ค่าวัสดุการแพทย์และวิทยาศาสตร์",
    },
  });

  const l3ExpOpUtility = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-OP-UTIL",
      categoryName: "ค่าน้ำ ค่าไฟ ค่าโทรศัพท์",
      level: 3,
      categoryType: CategoryType.EXPENSE,
      parentId: l2ExpOp.id,
      description: "ค่าน้ำประปา ไฟฟ้า และโทรศัพท์",
    },
  });

  const l3ExpInvEquip = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-INV-EQP",
      categoryName: "ค่าอุปกรณ์การแพทย์",
      level: 3,
      categoryType: CategoryType.EXPENSE,
      parentId: l2ExpInvest.id,
      description: "ค่าซื้ออุปกรณ์และเครื่องมือการแพทย์",
    },
  });

  // L4 Expense Categories
  const l4MedSupply = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-OP-SUP-MED",
      categoryName: "ค่าวัสดุการแพทย์",
      level: 4,
      categoryType: CategoryType.EXPENSE,
      parentId: l3ExpOpSupply.id,
      description: "ค่าวัสดุการแพทย์เช่น หน้ากาก ถุงมือ",
    },
  });

  const l4LabSupply = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-OP-SUP-LAB",
      categoryName: "ค่าวัสดุวิทยาศาสตร์การแพทย์",
      level: 4,
      categoryType: CategoryType.EXPENSE,
      parentId: l3ExpOpSupply.id,
      description: "ค่าวัสดุห้องปฏิบัติการ",
    },
  });

  const l4OfficeSupply = await prisma.budgetCategory.create({
    data: {
      categoryCode: "EXP-OP-SUP-OFF",
      categoryName: "ค่าวัสดุสำนักงาน",
      level: 4,
      categoryType: CategoryType.EXPENSE,
      parentId: l3ExpOpSupply.id,
      description: "ค่าวัสดุสิ้นเปลืองสำนักงาน",
    },
  });

  console.log(
    `✅ Created ${await prisma.budgetCategory.count()} budget categories`
  );

  // --- 3. Create Procurement Items ---
  console.log("📦 Creating procurement items...");

  const itemMask = await prisma.procurementItem.create({
    data: {
      itemName: "หน้ากากอนามัยทางการแพทย์",
      unitName: "กล่อง",
      inventory: 500,
      procurementType: ProcurementType.BIDDING,
      specifications: "หน้ากากอนามัย 3 ชั้น มาตรฐาน FDA",
      minStockLevel: 100,
      maxStockLevel: 1000,
      unitPrice: new Decimal("50.00"),
      lastPurchasePrice: new Decimal("48.50"),
      categoryId: l4MedSupply.id,
      createdById: userOperator.id,
      updatedById: userOperator.id,
    },
  });

  const itemGloves = await prisma.procurementItem.create({
    data: {
      itemName: "ถุงมือยางทางการแพทย์ Size M",
      unitName: "กล่อง",
      inventory: 300,
      procurementType: ProcurementType.QUOTATION,
      specifications: "ถุงมือยางไม่มีแป้ง ปลอดเชื้อ",
      minStockLevel: 50,
      maxStockLevel: 500,
      unitPrice: new Decimal("120.00"),
      lastPurchasePrice: new Decimal("115.00"),
      categoryId: l4MedSupply.id,
      createdById: userOperator.id,
      updatedById: userOperator.id,
    },
  });

  const itemTestTube = await prisma.procurementItem.create({
    data: {
      itemName: "Test Tube ขนาด 5ml",
      unitName: "ชิ้น",
      inventory: 2000,
      procurementType: ProcurementType.DIRECT_PURCHASE,
      specifications: "หลอดทดลองแก้ว 5ml พร้อมฝาปิด",
      minStockLevel: 500,
      maxStockLevel: 3000,
      unitPrice: new Decimal("8.50"),
      lastPurchasePrice: new Decimal("8.00"),
      categoryId: l4LabSupply.id,
      createdById: userOperator.id,
      updatedById: userOperator.id,
    },
  });

  const itemSyringe = await prisma.procurementItem.create({
    data: {
      itemName: "Syringe 10ml พร้อมเข็ม",
      unitName: "ชิ้น",
      inventory: 1500,
      procurementType: ProcurementType.BIDDING,
      specifications: "กระบอกฉีดยา 10ml พร้อมเข็มมาตรฐาน",
      minStockLevel: 300,
      maxStockLevel: 2000,
      unitPrice: new Decimal("15.00"),
      lastPurchasePrice: new Decimal("14.20"),
      categoryId: l4MedSupply.id,
      createdById: userOperator.id,
      updatedById: userOperator.id,
    },
  });

  const itemPaper = await prisma.procurementItem.create({
    data: {
      itemName: "กระดาษ A4 80แกรม",
      unitName: "รีม",
      inventory: 100,
      procurementType: ProcurementType.QUOTATION,
      specifications: "กระดาษ A4 80แกรม 500 แผ่น/รีม",
      minStockLevel: 20,
      maxStockLevel: 200,
      unitPrice: new Decimal("120.00"),
      lastPurchasePrice: new Decimal("118.00"),
      categoryId: l4OfficeSupply.id,
      createdById: userOperator.id,
      updatedById: userOperator.id,
    },
  });

  const itemXRayFilm = await prisma.procurementItem.create({
    data: {
      itemName: "ฟิล์มเอ็กซเรย์ขนาด 14x17 นิ้ว",
      unitName: "กล่อง",
      inventory: 50,
      procurementType: ProcurementType.BIDDING,
      specifications: "ฟิล์มเอ็กซเรย์สำหรับเครื่องดิจิตอล",
      minStockLevel: 10,
      maxStockLevel: 100,
      unitPrice: new Decimal("850.00"),
      lastPurchasePrice: new Decimal("820.00"),
      categoryId: l4MedSupply.id,
      createdById: userOperator.id,
      updatedById: userOperator.id,
    },
  });

  console.log(
    `✅ Created ${await prisma.procurementItem.count()} procurement items`
  );

  // --- 4. Create Plan Financial Data ---
  console.log("📈 Creating financial plans...");

  // Plans for FY 2567
  await prisma.planFinancialData.createMany({
    data: [
      // L1 Plans
      {
        fiscalYear: 2567,
        planAmount: new Decimal("150000000.00"),
        categoryId: l1Revenue.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
        notes: "แผนรายรับทั้งปีงบประมาณ 2567",
      },
      {
        fiscalYear: 2567,
        planAmount: new Decimal("120000000.00"),
        categoryId: l1Expense.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
        notes: "แผนรายจ่ายทั้งปีงบประมาณ 2567",
      },
      // L2 Plans
      {
        fiscalYear: 2567,
        planAmount: new Decimal("50000000.00"),
        categoryId: l2ExpHr.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
      },
      {
        fiscalYear: 2567,
        planAmount: new Decimal("40000000.00"),
        categoryId: l2ExpOp.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
      },
      // L3 Plans
      {
        fiscalYear: 2567,
        planAmount: new Decimal("40000000.00"),
        categoryId: l3ExpHrSalary.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
      },
      {
        fiscalYear: 2567,
        planAmount: new Decimal("15000000.00"),
        categoryId: l3ExpOpMed.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
      },
      {
        fiscalYear: 2567,
        planAmount: new Decimal("10000000.00"),
        categoryId: l3ExpOpSupply.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
      },
      // L4 Plans
      {
        fiscalYear: 2567,
        planAmount: new Decimal("5000000.00"),
        categoryId: l4MedSupply.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
      },
      {
        fiscalYear: 2567,
        planAmount: new Decimal("3000000.00"),
        categoryId: l4LabSupply.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
      },
      // Item Plans
      {
        fiscalYear: 2567,
        planAmount: new Decimal("50000.00"),
        categoryId: l4MedSupply.id,
        procurementItemId: itemMask.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
        notes: "แผนซื้อหน้ากากอนามัยปี 2567",
      },
      {
        fiscalYear: 2567,
        planAmount: new Decimal("120000.00"),
        categoryId: l4MedSupply.id,
        procurementItemId: itemGloves.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
        notes: "แผนซื้อถุงมือยางปี 2567",
      },
      {
        fiscalYear: 2567,
        planAmount: new Decimal("80000.00"),
        categoryId: l4LabSupply.id,
        procurementItemId: itemTestTube.id,
        planVersion: 1,
        isApproved: true,
        approvedAt: new Date("2023-09-30"),
        notes: "แผนซื้อ Test Tube ปี 2567",
      },
    ],
  });

  // Plans for FY 2568
  await prisma.planFinancialData.createMany({
    data: [
      {
        fiscalYear: 2568,
        planAmount: new Decimal("160000000.00"),
        categoryId: l1Revenue.id,
        planVersion: 1,
        isApproved: false,
        notes: "แผนรายรับปี 2568 (รออนุมัติ)",
      },
      {
        fiscalYear: 2568,
        planAmount: new Decimal("130000000.00"),
        categoryId: l1Expense.id,
        planVersion: 1,
        isApproved: false,
        notes: "แผนรายจ่ายปี 2568 (รออนุมัติ)",
      },
    ],
  });

  console.log(
    `✅ Created ${await prisma.planFinancialData.count()} financial plans`
  );

  // --- 5. Create Monthly Actual Entries ---
  console.log("💰 Creating actual entries...");

  // FY 2567 Actual Entries
  await prisma.monthlyActualEntry.createMany({
    data: [
      // October 2566 (FY 2567)
      {
        fiscalYear: 2567,
        month: 10,
        entryDate: new Date("2023-10-05"),
        amount: new Decimal("3500000.00"),
        notes: "เงินเดือนบุคลากรตุลาคม 2566",
        categoryId: l3ExpHrSalary.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      {
        fiscalYear: 2567,
        month: 10,
        entryDate: new Date("2023-10-12"),
        amount: new Decimal("5000.00"),
        quantity: 100,
        notes: "ซื้อหน้ากากอนามัยล็อต 1",
        categoryId: l4MedSupply.id,
        procurementItemId: itemMask.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      {
        fiscalYear: 2567,
        month: 10,
        entryDate: new Date("2023-10-15"),
        amount: new Decimal("12000000.00"),
        notes: "รายรับค่ารักษา UC ตุลาคม",
        categoryId: l3RevUc.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      // November 2566
      {
        fiscalYear: 2567,
        month: 11,
        entryDate: new Date("2023-11-05"),
        amount: new Decimal("3600000.00"),
        notes: "เงินเดือนบุคลากรพฤศจิกายน 2566",
        categoryId: l3ExpHrSalary.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      {
        fiscalYear: 2567,
        month: 11,
        entryDate: new Date("2023-11-15"),
        amount: new Decimal("12000.00"),
        quantity: 100,
        notes: "ซื้อถุงมือยาง",
        categoryId: l4MedSupply.id,
        procurementItemId: itemGloves.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      {
        fiscalYear: 2567,
        month: 11,
        entryDate: new Date("2023-11-20"),
        amount: new Decimal("1500000.00"),
        notes: "ค่าน้ำ ค่าไฟ พฤศจิกายน",
        categoryId: l3ExpOpUtility.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      // December 2566
      {
        fiscalYear: 2567,
        month: 12,
        entryDate: new Date("2023-12-05"),
        amount: new Decimal("3700000.00"),
        notes: "เงินเดือนบุคลากรธันวาคม 2566",
        categoryId: l3ExpHrSalary.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      {
        fiscalYear: 2567,
        month: 12,
        entryDate: new Date("2023-12-10"),
        amount: new Decimal("8000.00"),
        quantity: 1000,
        notes: "ซื้อ Test Tube สำหรับห้อง lab",
        categoryId: l4LabSupply.id,
        procurementItemId: itemTestTube.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      // January 2567
      {
        fiscalYear: 2567,
        month: 1,
        entryDate: new Date("2024-01-05"),
        amount: new Decimal("3800000.00"),
        notes: "เงินเดือนบุคลากรมกราคม 2567",
        categoryId: l3ExpHrSalary.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
      {
        fiscalYear: 2567,
        month: 1,
        entryDate: new Date("2024-01-15"),
        amount: new Decimal("15000.00"),
        quantity: 1000,
        notes: "ซื้อ Syringe 10ml",
        categoryId: l4MedSupply.id,
        procurementItemId: itemSyringe.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
    ],
  });

  // FY 2568 Actual Entries (บางส่วน)
  await prisma.monthlyActualEntry.createMany({
    data: [
      {
        fiscalYear: 2568,
        month: 10,
        entryDate: new Date("2024-10-05"),
        amount: new Decimal("4000000.00"),
        notes: "เงินเดือนบุคลากรตุลาคม 2567",
        categoryId: l3ExpHrSalary.id,
        recordedById: userOperator.id,
        createdById: userOperator.id,
      },
    ],
  });

  console.log(
    `✅ Created ${await prisma.monthlyActualEntry.count()} actual entries`
  );

  // --- 6. Create Documents ---
  console.log("📎 Creating documents...");

  await prisma.document.createMany({
    data: [
      {
        fileName: "specification_mask.pdf",
        filePath: "/documents/specs/mask_spec.pdf",
        fileSize: 2048576,
        mimeType: "application/pdf",
        procurementItemId: itemMask.id,
        uploadedById: userOperator.id,
        description: "รายละเอียดคุณสมบัติหน้ากากอนามัย",
      },
      {
        fileName: "quotation_gloves.pdf",
        filePath: "/documents/quotations/gloves_quote.pdf",
        fileSize: 1536890,
        mimeType: "application/pdf",
        procurementItemId: itemGloves.id,
        uploadedById: userOperator.id,
        description: "ใบเสนอราคาถุงมือยาง",
      },
      {
        fileName: "purchase_order_october.pdf",
        filePath: "/documents/orders/po_october.pdf",
        fileSize: 3087564,
        mimeType: "application/pdf",
        monthlyEntryId: (await prisma.monthlyActualEntry.findFirst({
          where: { month: 10, fiscalYear: 2567 },
        }))!.id,
        uploadedById: userOperator.id,
        description: "ใบสั่งซื้อประจำเดือนตุลาคม 2566",
      },
    ],
  });

  console.log(`✅ Created ${await prisma.document.count()} documents`);

  // --- 7. Create Audit Logs ---
  console.log("📝 Creating audit logs...");

  await prisma.auditLog.createMany({
    data: [
      {
        action: "CREATE",
        entityType: "User",
        entityId: userExec.id,
        newValues: JSON.stringify({ name: userExec.name, role: userExec.role }),
        description: "สร้างผู้ใช้งานใหม่: ผู้บริหาร",
        performedById: userExec.id,
      },
      {
        action: "CREATE",
        entityType: "BudgetCategory",
        entityId: l1Revenue.id,
        newValues: JSON.stringify({
          categoryName: l1Revenue.categoryName,
          level: l1Revenue.level,
        }),
        description: "สร้างหมวดหมู่รายรับหลัก",
        performedById: userDeptHead.id,
      },
      {
        action: "UPDATE",
        entityType: "ProcurementItem",
        entityId: itemMask.id,
        oldValues: JSON.stringify({ inventory: 450 }),
        newValues: JSON.stringify({ inventory: 500 }),
        description: "อัพเดทสต็อกหน้ากากอนามัย",
        performedById: userOperator.id,
      },
      {
        action: "APPROVE",
        entityType: "PlanFinancialData",
        entityId: (await prisma.planFinancialData.findFirst({
          where: { fiscalYear: 2567, categoryId: l1Revenue.id },
        }))!.id,
        newValues: JSON.stringify({
          isApproved: true,
          approvedAt: new Date().toISOString(),
        }),
        description: "อนุมัติแผนรายรับปี 2567",
        performedById: userExec.id,
      },
    ],
  });

  console.log(`✅ Created ${await prisma.auditLog.count()} audit logs`);

  console.log("🎉 Database seeding completed successfully!");
  console.log("📊 Summary:");
  console.log(`   👥 Users: ${await prisma.user.count()}`);
  console.log(`   📂 Categories: ${await prisma.budgetCategory.count()}`);
  console.log(
    `   📦 Procurement Items: ${await prisma.procurementItem.count()}`
  );
  console.log(
    `   📈 Financial Plans: ${await prisma.planFinancialData.count()}`
  );
  console.log(
    `   💰 Actual Entries: ${await prisma.monthlyActualEntry.count()}`
  );
  console.log(`   📎 Documents: ${await prisma.document.count()}`);
  console.log(`   📝 Audit Logs: ${await prisma.auditLog.count()}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
