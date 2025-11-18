// app/api/dashboard/expense-drilldown/route.ts
import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { Decimal } from "@prisma/client/runtime/library";
import { PrismaClient, CategoryType } from "@prisma/client";
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
        categoryType: CategoryType.EXPENSE,
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

    // 3. Get L3 categories under each L2
    const l3Categories = await prisma.budgetCategory.findMany({
      where: {
        parentId: { in: l2Categories.map((c) => c.id) },
        level: 3,
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    // 4. Get L4 categories under each L3
    const l4Categories = await prisma.budgetCategory.findMany({
      where: {
        parentId: { in: l3Categories.map((c) => c.id) },
        level: 4,
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    // Create a map: L2_ID -> [List of L3/L4 IDs under it]
    const l2ToChildrenMap = new Map<string, string[]>();
    for (const l2 of l2Categories) {
      l2ToChildrenMap.set(l2.id, []);
    }

    // Add L3 categories to their parent L2
    for (const l3 of l3Categories) {
      if (l3.parentId) {
        const children = l2ToChildrenMap.get(l3.parentId);
        if (children) {
          children.push(l3.id);
        }
      }
    }

    // Add L4 categories to their grandparent L2
    for (const l4 of l4Categories) {
      const l3Parent = l3Categories.find((l3) => l3.id === l4.parentId);
      if (l3Parent?.parentId) {
        const children = l2ToChildrenMap.get(l3Parent.parentId);
        if (children) {
          children.push(l4.id);
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

    // FIXED: Get item count for each L2 - ใช้ findMany + manual counting
    const allL4Ids = l4Categories.map((c) => c.id);
    const itemsByCategory = await prisma.procurementItem.findMany({
      where: {
        categoryId: { in: allL4Ids },
      },
      select: {
        categoryId: true,
      },
    });

    // Map item counts back to L2 categories
    const l2ItemCounts = new Map<string, number>();
    for (const l2 of l2Categories) {
      l2ItemCounts.set(l2.id, 0);
    }

    for (const item of itemsByCategory) {
      const l4Category = l4Categories.find((l4) => l4.id === item.categoryId);
      if (l4Category) {
        const l3Parent = l3Categories.find(
          (l3) => l3.id === l4Category.parentId
        );
        if (l3Parent?.parentId) {
          const currentCount = l2ItemCounts.get(l3Parent.parentId) || 0;
          l2ItemCounts.set(l3Parent.parentId, currentCount + 1);
        }
      }
    }

    // Build Response
    const responseData = l2Categories.map((l2) => {
      // Find plan
      const plan = Number(
        plans.find((p) => p.categoryId === l2.id)?.planAmount ?? 0
      );

      // Find children IDs
      const childIds = l2ToChildrenMap.get(l2.id) ?? [];

      // Calculate actuals for each year
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
      const itemCount = l2ItemCounts.get(l2.id) ?? 0;

      return {
        id: l2.id,
        name: l2.categoryName,
        icon: l2.icon,
        plan,
        actual,
        itemCount,
        history,
      };
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error: /api/dashboard/expense-drilldown", error);
    return NextResponse.json(
      { error: "Failed to fetch L2 drilldown data", details: String(error) },
      { status: 500 }
    );
  }
}
