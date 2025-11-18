// app/api/dashboard/l3-drilldown/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "0");
    const l2CategoryId = searchParams.get("l2CategoryId");

    if (!fiscalYear || !l2CategoryId) {
      return NextResponse.json(
        { error: "fiscalYear and l2CategoryId are required" },
        { status: 400 }
      );
    }

    const years = [fiscalYear, fiscalYear - 1, fiscalYear - 2];

    // 1. Get all L3 categories under the L2
    const l3Categories = await prisma.budgetCategory.findMany({
      where: {
        parentId: l2CategoryId,
        level: 3,
      },
      select: {
        id: true,
        categoryName: true,
      },
    });

    // 2. Get Plans for all L3 categories for the current year
    const plans = await prisma.planFinancialData.findMany({
      where: {
        fiscalYear: fiscalYear,
        categoryId: { in: l3Categories.map((c) => c.id) },
      },
      select: {
        categoryId: true,
        planAmount: true,
      },
    });

    // 3. Get Actuals for all L3 categories for the past 3 years
    // Sum actuals from L3 itself, L4 children, and Items under L4 children
    const allChildCategories = await prisma.budgetCategory.findMany({
      where: {
        parentId: { in: l3Categories.map((c) => c.id) },
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    // Map: L3_ID -> [L3_ID, ...L4_IDs]
    const l3ToChildrenMap = new Map<string, string[]>();
    for (const l3 of l3Categories) {
      l3ToChildrenMap.set(l3.id, [l3.id]); // Include L3 itself
    }
    for (const l4 of allChildCategories) {
      if (l4.parentId) {
        l3ToChildrenMap.get(l4.parentId)?.push(l4.id);
      }
    }

    // Get actuals for all children categories (L3+L4)
    const allChildIds = Array.from(l3ToChildrenMap.values()).flat();
    const actuals = await prisma.monthlyActualEntry.groupBy({
      by: ["categoryId", "fiscalYear"],
      _sum: {
        amount: true,
      },
      where: {
        fiscalYear: { in: years },
        categoryId: { in: allChildIds },
      },
    });

    // 4. Get Item count for each L3
    const l4CategoryIds = allChildCategories.map((l4) => l4.id);
    const itemCounts = await prisma.procurementItem.groupBy({
      by: ["categoryId"],
      _count: {
        id: true,
      },
      where: {
        categoryId: { in: l4CategoryIds },
      },
    });

    // Map L4 item counts back to L3
    const l3ItemCounts = new Map<string, number>();
    for (const l4 of allChildCategories) {
      const counts = itemCounts.filter((ic) => ic.categoryId === l4.id);
      const total = counts.reduce((sum, c) => sum + c._count.id, 0);
      if (l4.parentId) {
        const currentTotal = l3ItemCounts.get(l4.parentId) ?? 0;
        l3ItemCounts.set(l4.parentId, currentTotal + total);
      }
    }

    // 5. Build Response
    const responseData = l3Categories.map((l3) => {
      // Find plan
      const plan = Number(
        plans.find((p) => p.categoryId === l3.id)?.planAmount ?? 0
      );

      // Find children IDs
      const childIds = l3ToChildrenMap.get(l3.id) ?? [];

      // Calculate actuals
      const history = years.map((year) => {
        const yearActual = actuals
          .filter(
            (a) => childIds.includes(a.categoryId) && a.fiscalYear === year
          )
          .reduce((sum, a) => sum + Number(a._sum.amount ?? 0), 0);
        return {
          year: year,
          actual: yearActual,
        };
      });

      const actual = history.find((h) => h.year === fiscalYear)?.actual ?? 0;
      const itemCount = l3ItemCounts.get(l3.id) ?? 0;

      return {
        id: l3.id,
        name: l3.categoryName,
        plan,
        actual,
        itemCount,
        history,
      };
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error: /api/dashboard/l3-drilldown", error);
    return NextResponse.json(
      { error: "Failed to fetch L3 drilldown data" },
      { status: 500 }
    );
  }
}
