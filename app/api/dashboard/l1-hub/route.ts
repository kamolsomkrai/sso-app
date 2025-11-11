// app/api/dashboard/l1-hub/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("year") || "2569");
    const selectedMonth = searchParams.get("month"); // e.g., "10"
    const selectedDeptId = searchParams.get("dept_id"); // e.g., "uuid-of-dept" (String)

    // --- 1. สร้าง WHERE clause แบบไดนามิก ---
    const whereClause: Prisma.MonthlyActualEntryWhereInput = {
      fiscalYear: fiscalYear,
    };

    if (selectedMonth) {
      whereClause.month = parseInt(selectedMonth);
    }

    // (ค้นหา L3/L4 categories ภายใต้ L2 Dept ที่เลือก)
    let l2CategoryIds: string[] | null = null;
    if (selectedDeptId) {
      // (เราต้องหากลูก L3 และ L4 ทั้งหมด)
      const l3Categories = await db.budgetCategory.findMany({
        where: { parent_id: selectedDeptId },
        select: {
          category_id: true,
          children: { select: { category_id: true } },
        },
      });

      const allChildIds: string[] = [];
      l3Categories.forEach((l3) => {
        allChildIds.push(l3.category_id);
        l3.children.forEach((l4) => allChildIds.push(l4.category_id));
      });

      l2CategoryIds = allChildIds;
      whereClause.category_id = { in: l2CategoryIds };
    }

    // --- 2. Query ข้อมูล Actual (ที่กรองแล้ว) ---
    const actualEntries = await db.monthlyActualEntry.findMany({
      where: whereClause,
    });
    const kpiTotalExpense = actualEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.amount.toString()),
      0
    );

    // --- 3. Query ข้อมูล Plan (Target) ---
    const totalPlanData = await db.planFinancialData.findFirst({
      where: { category: { category_code: "EXP" }, fiscal_year: fiscalYear },
    });
    const totalTarget = (
      totalPlanData?.plan_amount || new Prisma.Decimal(89500000)
    ).toNumber();
    const kpiBudgetVariance = totalTarget - kpiTotalExpense;

    // --- 4. Query ข้อมูลกราฟแท่ง (Monthly) ---
    const monthlyActuals = await db.monthlyActualEntry.groupBy({
      by: ["month"],
      where: {
        fiscalYear: fiscalYear,
        ...(selectedDeptId ? { category_id: { in: l2CategoryIds } } : {}),
      },
      _sum: { amount: true },
      orderBy: { month: "asc" },
    });

    const targetPerMonth = totalTarget / 12;

    const monthlyChartData = Array.from({ length: 12 }, (_, i) => {
      const month = ((i + 9) % 12) + 1; // 10, 11, 12, 1, 2, ...
      const actual =
        monthlyActuals.find((m) => m.month === month)?._sum.amount || 0;
      const year = month >= 10 ? fiscalYear - 1 : fiscalYear;
      const monthDateStr = `${year}-${month.toString().padStart(2, "0")}`; // "2024-10" ... "2025-09"

      return {
        name: monthDateStr,
        actual: parseFloat(actual.toString()),
        target: targetPerMonth,
      };
    });

    // --- 5. Query ข้อมูล List/Chart แผนก (L2) ---
    const l2Departments = await db.budgetCategory.findMany({
      where: { level: 2, category_type: "expense" },
    });

    // (ดึง L3 และ L4 เพื่อ map กลับไป L2)
    const l3AndL4Categories = await db.budgetCategory.findMany({
      where: {
        OR: [{ level: 3 }, { level: 4 }],
        category_type: "expense",
      },
      select: { category_id: true, parent_id: true },
    });

    // Map L4 -> L3, และ L3 -> L2
    const l3ToL2Map = new Map<string, string>(); // <l3_id, l2_id>
    l3AndL4Categories.forEach((l3) => {
      if (
        l3.parent_id &&
        l2Departments.some((l2) => l2.category_id === l3.parent_id)
      ) {
        l3ToL2Map.set(l3.category_id, l3.parent_id);
      }
    });
    const l4ToL2Map = new Map<string, string>(); // <l4_id, l2_id>
    l3AndL4Categories.forEach((l4) => {
      if (l4.parent_id && l3ToL2Map.has(l4.parent_id)) {
        l4ToL2Map.set(l4.category_id, l3ToL2Map.get(l4.parent_id)!);
      }
    });

    // (หา Actuals ทั้งหมดที่กรองตามเดือน)
    const deptActualEntries = await db.monthlyActualEntry.findMany({
      where: {
        fiscalYear: fiscalYear,
        ...(selectedMonth ? whereClause : {}),
      },
      select: { amount: true, category_id: true },
    });

    const l2Map = new Map<string, number>();
    l2Departments.forEach((d) => l2Map.set(d.category_id, 0));

    deptActualEntries.forEach((entry) => {
      const l2ParentId =
        l4ToL2Map.get(entry.category_id) || l3ToL2Map.get(entry.category_id);
      if (l2ParentId) {
        const currentSum = l2Map.get(l2ParentId) || 0;
        l2Map.set(l2ParentId, currentSum + parseFloat(entry.amount.toString()));
      }
    });

    const deptChartData = Array.from(l2Map.entries())
      .map(([id, value]) => {
        const dept = l2Departments.find((d) => d.category_id === id);
        return {
          id: id,
          name: dept?.category_name || "Unknown",
          value: value,
        };
      })
      .filter((d) => d.value > 0);

    const topDept =
      deptChartData.sort((a, b) => b.value - a.value)[0]?.name || "N/A";

    return NextResponse.json({
      kpis: {
        totalExpense: kpiTotalExpense,
        budgetVariance: kpiBudgetVariance,
        topSpendingDept: topDept,
      },
      monthlyChartData,
      deptChartData,
    });
  } catch (error) {
    console.error("[API_L1_HUB_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
