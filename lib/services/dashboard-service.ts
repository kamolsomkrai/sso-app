import { PrismaClient, CategoryType } from "@prisma/client";
import { DashboardSummary, KpiMetric, StatusType } from "@/lib/types/dashboard";

const prisma = new PrismaClient();

// ... (Keep calculateMetric function from previous turn) ...
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
    if (variancePercent > 5) status = "danger";
    else if (variancePercent > 0) status = "warning";
    else status = "success";
  } else {
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
  // 1. Fetch KPIs (Aggregates)
  const [planRev, planExp, actualRev, actualExp] = await Promise.all([
    prisma.planFinancialData.aggregate({
      _sum: { planAmount: true },
      where: { fiscalYear, category: { categoryType: CategoryType.REVENUE } },
    }),
    prisma.planFinancialData.aggregate({
      _sum: { planAmount: true },
      where: { fiscalYear, category: { categoryType: CategoryType.EXPENSE } },
    }),
    prisma.monthlyActualEntry.aggregate({
      _sum: { amount: true },
      where: { fiscalYear, category: { categoryType: CategoryType.REVENUE } },
    }),
    prisma.monthlyActualEntry.aggregate({
      _sum: { amount: true },
      where: { fiscalYear, category: { categoryType: CategoryType.EXPENSE } },
    }),
  ]);

  // 2. Fetch Monthly Trend Data
  const monthlyEntries = await prisma.monthlyActualEntry.groupBy({
    by: ["month", "categoryId"],
    _sum: { amount: true },
    where: { fiscalYear },
  });

  // Get Category Types map for fast lookup
  const categories = await prisma.budgetCategory.findMany({
    select: { id: true, categoryType: true, categoryName: true },
  });
  const catTypeMap = new Map(categories.map((c) => [c.id, c.categoryType]));
  const catNameMap = new Map(categories.map((c) => [c.id, c.categoryName]));

  // Process Monthly Data
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  // Note: Fiscal Year often starts in Oct (10). Adjust logic if needed.
  // For simplicity, we sort 1-12.

  const monthlyTrend = months.map((month) => {
    const entries = monthlyEntries.filter((e) => e.month === month);
    let revenue = 0;
    let expense = 0;

    entries.forEach((e) => {
      const type = catTypeMap.get(e.categoryId);
      const amt = Number(e._sum.amount || 0);
      if (type === CategoryType.REVENUE) revenue += amt;
      else if (type === CategoryType.EXPENSE) expense += amt;
    });

    return {
      name: new Date(0, month - 1).toLocaleString("en-US", { month: "short" }),
      revenue,
      expense,
      planRevenue: Number(planRev._sum.planAmount || 0) / 12, // Simple average for plan
      planExpense: Number(planExp._sum.planAmount || 0) / 12,
    };
  });

  // 3. Fetch Category Breakdown (Top 5 Expenses)
  const expenseBreakdownRaw = await prisma.monthlyActualEntry.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: {
      fiscalYear,
      category: { categoryType: CategoryType.EXPENSE, level: 2 }, // L2 Categories
    },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });

  const expenseBreakdown = expenseBreakdownRaw.map((item, index) => ({
    name: catNameMap.get(item.categoryId) || "Unknown",
    value: Number(item._sum.amount || 0),
    color: `hsl(var(--chart-${index + 1}))`, // Use CSS variables
  }));

  return {
    fiscalYear,
    lastUpdated: new Date(),
    kpis: {
      totalRevenue: calculateMetric(
        Number(actualRev._sum.amount || 0),
        Number(planRev._sum.planAmount || 0),
        "Total Revenue",
        "REVENUE"
      ),
      totalExpense: calculateMetric(
        Number(actualExp._sum.amount || 0),
        Number(planExp._sum.planAmount || 0),
        "Total Expense",
        "EXPENSE"
      ),
      netResult: calculateMetric(
        Number(actualRev._sum.amount || 0) - Number(actualExp._sum.amount || 0),
        Number(planRev._sum.planAmount || 0) -
          Number(planExp._sum.planAmount || 0),
        "Net Result",
        "NET"
      ),
    },
    charts: {
      monthlyTrend,
      expenseBreakdown,
      revenueBreakdown: [], // Implement similarly if needed
    },
  };
};
