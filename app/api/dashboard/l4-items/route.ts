// app/api/dashboard/l4-items/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "0");
    const l3CategoryId = searchParams.get("l3CategoryId");

    if (!fiscalYear || !l3CategoryId) {
      return NextResponse.json(
        { error: "fiscalYear and l3CategoryId are required" },
        { status: 400 }
      );
    }

    const years = [fiscalYear, fiscalYear - 1, fiscalYear - 2];

    // 1. Get all L4 categories under the L3
    const l4Categories = await prisma.budgetCategory.findMany({
      where: {
        parentId: l3CategoryId,
        level: 4,
      },
      select: {
        id: true,
      },
    });
    const l4CategoryIds = l4Categories.map((c) => c.id);

    // 2. Get all Items under these L4 categories
    const items = await prisma.procurementItem.findMany({
      where: {
        categoryId: { in: l4CategoryIds },
      },
      select: {
        id: true,
        itemName: true,
        unitName: true,
        inventory: true,
      },
    });
    const itemIds = items.map((item) => item.id);

    // 3. Get Plans for all Items for the current year
    const plans = await prisma.planFinancialData.findMany({
      where: {
        fiscalYear: fiscalYear,
        procurementItemId: { in: itemIds },
      },
      select: {
        procurementItemId: true,
        planAmount: true,
      },
    });

    // 4. Get Actuals for all Items for the past 3 years
    const actuals = await prisma.monthlyActualEntry.groupBy({
      by: ["procurementItemId", "fiscalYear"],
      _sum: {
        amount: true,
      },
      where: {
        fiscalYear: { in: years },
        procurementItemId: { in: itemIds },
      },
    });

    // 5. Build Response
    const responseData = items.map((item) => {
      const plan = Number(
        plans.find((p) => p.procurementItemId === item.id)?.planAmount ?? 0
      );

      const getActualForYear = (year: number) => {
        return Number(
          actuals.find(
            (a) => a.procurementItemId === item.id && a.fiscalYear === year
          )?._sum.amount ?? 0
        );
      };

      return {
        id: item.id,
        name: item.itemName,
        unit: item.unitName,
        inventory: item.inventory,
        planCurrentYear: plan,
        actualCurrentYear: getActualForYear(fiscalYear),
        actualLastYear: getActualForYear(fiscalYear - 1),
        actual2YearsAgo: getActualForYear(fiscalYear - 2),
      };
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error: /api/dashboard/l4-items", error);
    return NextResponse.json(
      { error: "Failed to fetch L4 items data" },
      { status: 500 }
    );
  }
}
