// app/api/dashboard/expense-drilldown/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "0");

    if (!fiscalYear) {
      return NextResponse.json(
        { error: "fiscalYear is required" },
        { status: 400 }
      );
    }

    const years = [fiscalYear, fiscalYear - 1, fiscalYear - 2];

    // 1. Get all L2 expense categories
    const l2Categories = await prisma.budgetCategory.findMany({
      where: {
        level: 2,
        categoryType: "expense",
      },
      select: {
        id: true,
        categoryName: true,
        icon: true,
      },
    });

    // 2. Get Plans for all L2 categories for the current year
    const plans = await prisma.planFinancialData.findMany({
      where: {
        fiscalYear: fiscalYear,
        categoryId: { in: l2Categories.map((c) => c.id) },
      },
      select: {
        categoryId: true,
        planAmount: true,
      },
    });

    // 3. Get Actuals for all L2 categories for the past 3 years
    // This is complex. We need to sum actuals from all children (L3, L4, Items)
    const allChildCategories = await prisma.budgetCategory.findMany({
      where: {
        parent: {
          id: { in: l2Categories.map((c) => c.id) },
        },
      },
      select: {
        id: true,
        parentId: true,
        children: {
          select: {
            id: true,
            parentId: true,
          },
        },
      },
    });

    // Create a map: L2_ID -> [List of L3/L4 IDs under it]
    const l2ToChildrenMap = new Map<string, string[]>();
    for (const l2 of l2Categories) {
      l2ToChildrenMap.set(l2.id, []);
    }
    for (const l3 of allChildCategories) {
      if (l3.parentId) {
        const children = l2ToChildrenMap.get(l3.parentId);
        children?.push(l3.id);
        for (const l4 of l3.children) {
          children?.push(l4.id);
        }
      }
    }

    // Get actuals for all children categories for 3 years
    const allChildIds = Array.from(l2ToChildrenMap.values()).flat();
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

    // Get item count for each L2
    const itemCounts = await prisma.procurementItem.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      where: {
        category: {
          parent: {
            parent: {
              id: { in: l2Categories.map((c) => c.id) },
            },
          },
        },
      },
    });

    // This is a simplified item count. A proper one needs to traverse L3/L4
    // For now, let's build the response

    const responseData = l2Categories.map((l2) => {
      // Find plan
      const plan = Number(
        plans.find((p) => p.categoryId === l2.id)?.planAmount ?? 0
      );

      // Find children IDs
      const childIds = l2ToChildrenMap.get(l2.id) ?? [];

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

      // (Simplified) Item count
      const itemCount = l3Categories.filter(
        (l3) => l3.parentId === l2.id
      ).length; // Count L3s

      return {
        id: l2.id,
        name: l2.categoryName,
        icon: l2.icon,
        plan,
        actual,
        itemCount, // Placeholder
        history,
      };
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error: /api/dashboard/expense-drilldown", error);
    return NextResponse.json(
      { error: "Failed to fetch L2 drilldown data" },
      { status: 500 }
    );
  }
}
