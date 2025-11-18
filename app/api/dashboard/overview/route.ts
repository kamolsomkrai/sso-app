// app/api/dashboard/overview/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// Helper to calculate KPI
function calculateKpi(
  actual: Decimal | number,
  plan: Decimal | number
): {
  plan: number;
  actual: number;
  variance: number;
  variancePercent: number;
} {
  const actualNum = Number(actual);
  const planNum = Number(plan);
  const variance = actualNum - planNum;
  const variancePercent =
    planNum === 0 ? (actualNum > 0 ? 100 : 0) : (variance / planNum) * 100;

  return {
    plan: planNum,
    actual: actualNum,
    variance,
    variancePercent,
  };
}

// Helper to get plan amount
async function getPlan(fiscalYear: number, categoryCode: string) {
  const plan = await prisma.planFinancialData.findFirst({
    where: {
      fiscalYear: fiscalYear,
      category: {
        categoryCode: categoryCode,
      },
    },
    select: {
      planAmount: true,
    },
  });
  return plan?.planAmount ?? new Decimal(0);
}

// Helper to get actual amount
async function getActual(
  fiscalYear: number,
  categoryType: "revenue" | "expense"
) {
  const result = await prisma.monthlyActualEntry.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      fiscalYear: fiscalYear,
      category: {
        categoryType: categoryType,
      },
    },
  });
  return result._sum.amount ?? new Decimal(0);
}

// Helper for monthly/quarterly data
const fiscalMonths = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const getQuarter = (month: number) =>
  Math.floor((fiscalMonths.indexOf(month) + 3) / 3);

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

    // --- 1. Financial Summary (KPIs) ---
    const [planRevenue, planExpense, actualRevenue, actualExpense] =
      await Promise.all([
        getPlan(fiscalYear, "REV"),
        getPlan(fiscalYear, "EXP"),
        getActual(fiscalYear, "revenue"),
        getActual(fiscalYear, "expense"),
      ]);

    const totalRevenue = calculateKpi(actualRevenue, planRevenue);
    const totalExpense = calculateKpi(actualExpense, planExpense);
    const netProfitLoss = calculateKpi(
      totalRevenue.actual - totalExpense.actual,
      totalRevenue.plan - totalExpense.plan
    );

    const summary = {
      totalRevenue,
      totalExpense,
      netProfitLoss,
    };

    // --- 2. Revenue vs Expense Chart Data ---
    // Original groupBy was incorrect as categoryType is on a related table.
    // Fetch all entries and aggregate in code instead.
    const allEntries = await prisma.monthlyActualEntry.findMany({
      where: {
        fiscalYear: fiscalYear,
      },
      select: {
        month: true,
        amount: true,
        category: {
          select: {
            categoryType: true,
          },
        },
      },
    });

    const monthlyData: {
      month: number;
      revenue: number;
      expense: number;
    }[] = fiscalMonths.map((month) => ({
      month,
      revenue: 0,
      expense: 0,
    }));

    const quarterlyData: {
      quarter: number;
      revenue: number;
      expense: number;
    }[] = [
      { quarter: 1, revenue: 0, expense: 0 },
      { quarter: 2, revenue: 0, expense: 0 },
      { quarter: 3, revenue: 0, expense: 0 },
      { quarter: 4, revenue: 0, expense: 0 },
    ];

    for (const entry of allEntries) {
      //
      const monthIndex = fiscalMonths.indexOf(entry.month);
      if (monthIndex === -1) continue;

      const amount = Number(entry.amount ?? 0); //
      const quarterIndex = getQuarter(entry.month) - 1;

      if (entry.category.categoryType === "revenue") {
        //
        monthlyData[monthIndex].revenue += amount;
        if (quarterIndex >= 0) quarterlyData[quarterIndex].revenue += amount; //
      } else if (entry.category.categoryType === "expense") {
        //
        monthlyData[monthIndex].expense += amount;
        if (quarterIndex >= 0) quarterlyData[quarterIndex].expense += amount; //
      }
    }

    const revenueData = {
      monthly: monthlyData,
      quarterly: quarterlyData,
    };

    // --- 3. Return Response ---
    return NextResponse.json({
      summary,
      revenueData,
    });
  } catch (error) {
    console.error("API Error: /api/dashboard/overview", error);
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
