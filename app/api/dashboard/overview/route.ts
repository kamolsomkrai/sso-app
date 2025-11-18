// app/api/dashboard/overview/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, CategoryType } from "@prisma/client";
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

// Helper to get plan amount - FIXED: ใช้ findMany แทน findFirst
async function getPlan(fiscalYear: number, categoryCode: string) {
  const plans = await prisma.planFinancialData.findMany({
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

  // Sum all plan amounts for this category
  const totalPlan = plans.reduce(
    (sum, plan) => sum.add(plan.planAmount),
    new Decimal(0)
  );

  return totalPlan;
}

// Helper to get actual amount - FIXED: ใช้ CategoryType enum
async function getActual(
  fiscalYear: number,
  categoryType: CategoryType // ใช้ CategoryType enum แทน string
) {
  const result = await prisma.monthlyActualEntry.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      fiscalYear: fiscalYear,
      category: {
        categoryType: categoryType, // ใช้ enum value
      },
    },
  });
  return result._sum.amount ?? new Decimal(0);
}

// Helper for monthly/quarterly data
const fiscalMonths = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// FIXED: ฟังก์ชันคำนวณ quarter ที่ถูกต้อง
const getQuarter = (month: number) => {
  if ([10, 11, 12].includes(month)) return 1; // Oct-Dec = Q1
  if ([1, 2, 3].includes(month)) return 2; // Jan-Mar = Q2
  if ([4, 5, 6].includes(month)) return 3; // Apr-Jun = Q3
  return 4; // Jul-Sep = Q4
};

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

    console.log(`Fetching overview data for fiscal year: ${fiscalYear}`);

    // --- 1. Financial Summary (KPIs) ---
    const [planRevenue, planExpense, actualRevenue, actualExpense] =
      await Promise.all([
        getPlan(fiscalYear, "REV"),
        getPlan(fiscalYear, "EXP"),
        getActual(fiscalYear, CategoryType.REVENUE), // ใช้ enum
        getActual(fiscalYear, CategoryType.EXPENSE), // ใช้ enum
      ]);

    console.log("Plan Revenue:", Number(planRevenue));
    console.log("Plan Expense:", Number(planExpense));
    console.log("Actual Revenue:", Number(actualRevenue));
    console.log("Actual Expense:", Number(actualExpense));

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
    // FIXED: ดึงข้อมูลพร้อม relation ให้ครบ
    const allEntries = await prisma.monthlyActualEntry.findMany({
      where: {
        fiscalYear: fiscalYear,
      },
      include: {
        category: {
          select: {
            categoryType: true,
          },
        },
      },
    });

    console.log(`Found ${allEntries.length} entries for FY ${fiscalYear}`);

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

    // FIXED: aggregate ข้อมูลที่ถูกต้อง
    for (const entry of allEntries) {
      const monthIndex = fiscalMonths.indexOf(entry.month);
      if (monthIndex === -1) continue;

      const amount = Number(entry.amount ?? 0);
      const quarter = getQuarter(entry.month);
      const quarterIndex = quarter - 1;

      if (entry.category?.categoryType === CategoryType.REVENUE) {
        monthlyData[monthIndex].revenue += amount;
        if (quarterIndex >= 0 && quarterIndex < 4) {
          quarterlyData[quarterIndex].revenue += amount;
        }
      } else if (entry.category?.categoryType === CategoryType.EXPENSE) {
        monthlyData[monthIndex].expense += amount;
        if (quarterIndex >= 0 && quarterIndex < 4) {
          quarterlyData[quarterIndex].expense += amount;
        }
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
      debug: {
        fiscalYear,
        entryCount: allEntries.length,
        planRevenue: Number(planRevenue),
        planExpense: Number(planExpense),
        actualRevenue: Number(actualRevenue),
        actualExpense: Number(actualExpense),
      },
    });
  } catch (error) {
    console.error("API Error: /api/dashboard/overview", error);
    return NextResponse.json(
      { error: "Failed to fetch overview data", details: String(error) },
      { status: 500 }
    );
  }
}
