// app/api/dashboard/l1-hub/route.ts  (replace existing GET)
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("year") || "2569");
    const selectedMonth = searchParams.get("month"); // optional
    const selectedDeptId = searchParams.get("dept_id");

    // years for history (current + -1, -2)
    const years = [fiscalYear, fiscalYear - 1, fiscalYear - 2];

    // --- Actuals: group by fiscalYear & month for last 3 years ---
    const actuals3y = await db.monthlyActualEntry.groupBy({
      by: ["fiscalYear", "month"],
      where: {
        fiscalYear: { in: years },
      },
      _sum: { amount: true },
      orderBy: [{ fiscalYear: "desc" }, { month: "asc" }],
    });

    // Build monthly series per year (Thai FY months: Oct..Sep). We will return arrays per year.
    const buildYearMonthly = (year: number) => {
      // months order: 10..12,1..9
      const months = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      return months.map((m) => {
        const rec = actuals3y.find(
          (a) => a.fiscalYear === year && a.month === m
        );
        return {
          month: `${year}-${m.toString().padStart(2, "0")}`,
          actual: parseFloat((rec?._sum.amount || 0).toString()),
        };
      });
    };
    const monthlyHistory = years.map((y) => ({
      year: y,
      months: buildYearMonthly(y),
    }));

    // --- Quarterly from monthly data: sum months into quarters (Q1..Q4) ---
    const toQuarter = (month: number) => {
      if ([10, 11, 12].includes(month)) return 1;
      if ([1, 2, 3].includes(month)) return 2;
      if ([4, 5, 6].includes(month)) return 3;
      return 4;
    };
    const quarterlyHistory = years.map((y) => {
      const quarters = [1, 2, 3, 4].map((q) => ({ quarter: q, actual: 0 }));
      actuals3y
        .filter((a) => a.fiscalYear === y)
        .forEach((a) => {
          const q = toQuarter(a.month);
          const idx = q - 1;
          quarters[idx].actual += parseFloat((a._sum.amount || 0).toString());
        });
      return { year: y, quarters };
    });

    // --- Plan totals per year (sum planFinancialData by category_type revenue/expense) ---
    // We'll compute total plan for expense and revenue per year
    const planRows = await db.planFinancialData.findMany({
      where: { fiscal_year: { in: years } },
      include: { category: { select: { category_type: true } } },
    });
    const planByYear = new Map<number, { revenue: number; expense: number }>();
    years.forEach((y) => planByYear.set(y, { revenue: 0, expense: 0 }));
    planRows.forEach((r) => {
      const y = r.fiscal_year;
      const key =
        r.category.category_type === "revenue" ? "revenue" : "expense";
      const cur = planByYear.get(y)!;
      cur[key] += Number(r.plan_amount);
      planByYear.set(y, cur);
    });

    // --- L2 breakdown (expense) for current fiscalYear (existing logic) ---
    // re-use existing mapping: get L2 list and map actuals -> L2
    const l2Departments = await db.budgetCategory.findMany({
      where: { level: 2 },
    });
    const l3AndL4Categories = await db.budgetCategory.findMany({
      where: { OR: [{ level: 3 }, { level: 4 }] },
      select: { category_id: true, parent_id: true },
    });
    const l3ToL2 = new Map<string, string>();
    l3AndL4Categories.forEach((c) => {
      if (
        c.parent_id &&
        l2Departments.some((l2) => l2.category_id === c.parent_id)
      ) {
        l3ToL2.set(c.category_id, c.parent_id);
      }
    });
    const l4ToL2 = new Map<string, string>();
    l3AndL4Categories.forEach((c) => {
      if (c.parent_id && l3ToL2.has(c.parent_id)) {
        l4ToL2.set(c.category_id, l3ToL2.get(c.parent_id)!);
      }
    });

    // get actuals for current fiscalYear (optionally filtered by month or dept)
    const whereClause: Prisma.MonthlyActualEntryWhereInput = { fiscalYear };
    if (selectedMonth) whereClause.month = parseInt(selectedMonth);
    if (selectedDeptId) {
      // gather L3/L4 under selectedDeptId
      const l3Cats = await db.budgetCategory.findMany({
        where: { parent_id: selectedDeptId },
        select: {
          category_id: true,
          children: { select: { category_id: true } },
        },
      });
      const allIds: string[] = [];
      l3Cats.forEach((l3) => {
        allIds.push(l3.category_id);
        l3.children.forEach((c) => allIds.push(c.category_id));
      });
      whereClause.category_id = { in: allIds };
    }
    const actualEntries = await db.monthlyActualEntry.findMany({
      where: whereClause,
    });
    const totalActualCurrent = actualEntries.reduce(
      (s, e) => s + parseFloat(e.amount.toString()),
      0
    );

    // total plan/variance for current FY (expense)
    const totalPlanRow = await db.planFinancialData.findFirst({
      where: { fiscal_year: fiscalYear, category: { category_code: "EXP" } },
    });
    const totalPlanCurrent = totalPlanRow
      ? Number(totalPlanRow.plan_amount)
      : 0;
    const budgetVariance = totalPlanCurrent - totalActualCurrent;

    return NextResponse.json({
      success: true,
      data: {
        monthlyHistory, // [{year, months:[{month, actual}]}]  for last 3 years
        quarterlyHistory, // [{year, quarters:[{quarter, actual}]}]
        planByYear: Array.from(planByYear.entries()).map(([year, v]) => ({
          year,
          ...v,
        })),
        current: {
          fiscalYear,
          totalActualCurrent,
          totalPlanCurrent,
          budgetVariance,
        },
      },
    });
  } catch (error) {
    console.error("[API_L1_HUB_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
