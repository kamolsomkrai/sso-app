import { PrismaClient, CategoryType } from "@prisma/client";
import { DashboardSummary, KpiMetric, StatusType } from "@/lib/types/dashboard";

// Use a singleton pattern in production to prevent connection exhaustion
const prisma = new PrismaClient();

function calculateMetric(
  actual: number,
  plan: number,
  label: string,
  type: "REVENUE" | "EXPENSE" | "NET"
): KpiMetric {
  const variance = actual - plan;
  const variancePercent = plan === 0 ? 0 : (variance / plan) * 100;

  let status: StatusType = "success";
  let trend: "up" | "down" | "neutral" = variance >= 0 ? "up" : "down";

  if (type === "EXPENSE") {
    // Expense: Lower than plan is Good (Green), Higher is Bad (Red)
    if (variancePercent > 5) status = "danger";
    else if (variancePercent > 0) status = "warning";
    else status = "success";
    // Trend: Up is bad for expense generally, but here we track magnitude
  } else {
    // Revenue/Net: Higher is Good
    if (variancePercent < -5) status = "danger";
    else if (variancePercent < 0) status = "warning";
    else status = "success";
  }

  return {
    label,
    amount: actual,
    target: plan,
    variance,
    variancePercent,
    trend,
    status,
  };
}

export const getExecutiveSummary = async (
  fiscalYear: number
): Promise<DashboardSummary> => {
  // Fetch all aggregates in parallel for performance
  const [planRev, planExp, actualRev, actualExp] = await Promise.all([
    // 1. Plan Revenue
    prisma.planFinancialData.aggregate({
      _sum: { planAmount: true },
      where: {
        fiscalYear,
        category: { categoryType: CategoryType.REVENUE },
      },
    }),
    // 2. Plan Expense
    prisma.planFinancialData.aggregate({
      _sum: { planAmount: true },
      where: {
        fiscalYear,
        category: { categoryType: CategoryType.EXPENSE },
      },
    }),
    // 3. Actual Revenue
    prisma.monthlyActualEntry.aggregate({
      _sum: { amount: true },
      where: {
        fiscalYear,
        category: { categoryType: CategoryType.REVENUE },
      },
    }),
    // 4. Actual Expense
    prisma.monthlyActualEntry.aggregate({
      _sum: { amount: true },
      where: {
        fiscalYear,
        category: { categoryType: CategoryType.EXPENSE },
      },
    }),
  ]);

  const planRevenue = Number(planRev._sum.planAmount || 0);
  const planExpense = Number(planExp._sum.planAmount || 0);
  const actualRevenue = Number(actualRev._sum.amount || 0);
  const actualExpense = Number(actualExp._sum.amount || 0);

  return {
    fiscalYear,
    lastUpdated: new Date(),
    totalRevenue: calculateMetric(
      actualRevenue,
      planRevenue,
      "Total Revenue",
      "REVENUE"
    ),
    totalExpense: calculateMetric(
      actualExpense,
      planExpense,
      "Total Expense",
      "EXPENSE"
    ),
    netResult: calculateMetric(
      actualRevenue - actualExpense,
      planRevenue - planExpense,
      "Net Result",
      "NET"
    ),
  };
};
