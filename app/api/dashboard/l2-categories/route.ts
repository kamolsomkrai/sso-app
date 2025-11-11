// app/api/dashboard/l2-categories/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("year") || "2569");
    const deptId = searchParams.get("dept_id"); // (นี่คือ String UUID)

    if (!deptId) {
      return new NextResponse("Department ID is required", { status: 400 });
    }

    // 1. หา L3 Categories ทั้งหมดภายใต้ L2 Dept นี้
    const l3Categories = await db.budgetCategory.findMany({
      where: { parent_id: deptId }, //
      orderBy: { display_order: "asc" },
    });

    const l3CategoryIds = l3Categories.map((c) => c.category_id);

    // 2. หา L4 Categories ภายใต้ L3 เหล่านี้
    const l4Categories = await db.budgetCategory.findMany({
      where: { parent_id: { in: l3CategoryIds } },
      select: { category_id: true, parent_id: true },
    });
    const l4CategoryIds = l4Categories.map((c) => c.category_id);

    // 3. หา "ยอดแผน" (Plan) ของ L3 categories (Sum L4 plans if needed)
    const l3PlanData = await db.planFinancialData.findMany({
      where: {
        fiscal_year: fiscalYear,
        category_id: { in: l3CategoryIds },
      },
    });

    // 4. หา "ยอดใช้จริง" (Actual) ของ L3 categories (Sum L4 entries)
    const l3ActualData = await db.monthlyActualEntry.groupBy({
      by: ["category_id"],
      where: {
        fiscalYear: fiscalYear,
        category_id: { in: [...l3CategoryIds, ...l4CategoryIds] }, //
      },
      _sum: { amount: true },
    });

    // Map L4 actuals back to L3
    const l3ActualMap = new Map<string, number>();
    l3Categories.forEach((l3) => l3ActualMap.set(l3.category_id, 0));

    l3ActualData.forEach((actual) => {
      let l3ParentId: string | null = null;
      if (l3CategoryIds.includes(actual.category_id)) {
        l3ParentId = actual.category_id;
      } else {
        const l4Cat = l4Categories.find(
          (l4) => l4.category_id === actual.category_id
        );
        if (l4Cat) l3ParentId = l4Cat.parent_id;
      }

      if (l3ParentId) {
        const currentSum = l3ActualMap.get(l3ParentId) || 0;
        l3ActualMap.set(
          l3ParentId,
          currentSum + parseFloat(actual._sum.amount?.toString() || "0")
        );
      }
    });

    // 5. ประกอบข้อมูล
    const responseData = l3Categories.map((cat) => {
      const plan =
        l3PlanData.find((p) => p.category_id === cat.category_id)
          ?.plan_amount || 0;
      const actual = l3ActualMap.get(cat.category_id) || 0;

      return {
        id: cat.category_id,
        name: cat.category_name,
        totalPlan: parseFloat(plan.toString()),
        totalActual: actual,
      };
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[API_L2_CATEGORIES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
