import { PrismaClient, CategoryType } from "@prisma/client";
import { DashboardSummary, KpiMetric, StatusType, ChartDataPoint, QuarterlyDataPoint, TreemapNode, HeatmapDataPoint } from "@/lib/types/dashboard";
import { getQuarterLabel, getMonthLabel } from "@/lib/utils/quarter";

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
  const trend: "up" | "down" | "neutral" = variance >= 0 ? "up" : "down";

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
  fiscalYear: number,
  period: 'month' | 'quarter' = 'month',
  level: number = 1
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

  // 2. Fetch Monthly/Quarterly Trend Data
  const monthlyEntries = await prisma.monthlyActualEntry.groupBy({
    by: ["month", "categoryId"],
    _sum: { amount: true },
    where: { fiscalYear },
  });

  // Get Category Types map for fast lookup
  const categories = await prisma.budgetCategory.findMany({
    select: { id: true, categoryType: true, categoryName: true, level: true },
    where: level > 0 ? { level } : {},
  });
  const catTypeMap = new Map(categories.map((c) => [c.id, c.categoryType]));
  const catNameMap = new Map(categories.map((c) => [c.id, c.categoryName]));

  // Filter entries by level if specified
  const relevantCategoryIds = level > 0 ? new Set(categories.map(c => c.id)) : null;
  const filteredEntries = relevantCategoryIds 
    ? monthlyEntries.filter(e => relevantCategoryIds.has(e.categoryId))
    : monthlyEntries;

  // Process Monthly Data
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12

  const monthlyTrend: ChartDataPoint[] = months.map((month) => {
    const entries = filteredEntries.filter((e) => e.month === month);
    let revenue = 0;
    let expense = 0;

    entries.forEach((e) => {
      const type = catTypeMap.get(e.categoryId);
      const amt = Number(e._sum.amount || 0);
      if (type === CategoryType.REVENUE) revenue += amt;
      else if (type === CategoryType.EXPENSE) expense += amt;
    });

    return {
      name: getMonthLabel(month),
      revenue,
      expense,
      planRevenue: Number(planRev._sum.planAmount || 0) / 12, // Simple average for plan
      planExpense: Number(planExp._sum.planAmount || 0) / 12,
    };
  });

  // Aggregate to quarterly if needed
  let trendData: ChartDataPoint[] | QuarterlyDataPoint[];
  
  if (period === 'quarter') {
    const quarters = [1, 2, 3, 4];
    trendData = quarters.map(quarter => {
      const monthsInQuarter = [
        quarter === 1 ? [10, 11, 12] : [],
        quarter === 2 ? [1, 2, 3] : [],
        quarter === 3 ? [4, 5, 6] : [],
        quarter === 4 ? [7, 8, 9] : [],
      ].flat();

      const quarterMonthlyData = monthlyTrend.filter((_, idx) => 
        monthsInQuarter.includes(idx + 1)
      );

      const revenue = quarterMonthlyData.reduce((sum, m) => sum + m.revenue, 0);
      const expense = quarterMonthlyData.reduce((sum, m) => sum + m.expense, 0);
      const planRevenue = quarterMonthlyData.reduce((sum, m) => sum + m.planRevenue, 0);
      const planExpense = quarterMonthlyData.reduce((sum, m) => sum + m.planExpense, 0);

      return {
        name: getQuarterLabel(quarter),
        revenue,
        expense,
        planRevenue,
        planExpense,
      };
    });
  } else {
    trendData = monthlyTrend;
  }

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
    period,
    level,
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
      monthlyTrend: trendData,
      expenseBreakdown,
      revenueBreakdown: [], // Implement similarly if needed
    },
  };
};

export const getHierarchyData = async (fiscalYear: number): Promise<TreemapNode[]> => {
  // 1. Fetch all expense categories
  const categories = await prisma.budgetCategory.findMany({
    where: { categoryType: CategoryType.EXPENSE },
    select: { id: true, categoryName: true, parentId: true },
  });

  // 2. Fetch Plans (Grouped by Category)
  const plans = await prisma.planFinancialData.groupBy({
    by: ["categoryId"],
    _sum: { planAmount: true },
    where: { fiscalYear },
  });

  // 3. Fetch Actuals (Grouped by Category)
  const actuals = await prisma.monthlyActualEntry.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: { fiscalYear },
  });

  // Create Maps for fast lookup
  const planMap = new Map(plans.map((p) => [p.categoryId, Number(p._sum.planAmount || 0)]));
  const actualMap = new Map(actuals.map((a) => [a.categoryId, Number(a._sum.amount || 0)]));

  // Build hierarchy tree
  const buildNode = (parentId: string | null): TreemapNode[] => {
    return categories
      .filter((c) => c.parentId === parentId)
      .map((c) => {
        const children = buildNode(c.id);
        
        // Calculate self values
        const planAmount = planMap.get(c.id) || 0;
        const actualAmount = actualMap.get(c.id) || 0;
        
        // If leaf node, use self values. If parent, sum children (or use self if data exists at parent level)
        // For this visual, we prefer aggregating children for parents if children exist
        const size = children.length > 0 ? children.reduce((sum, child) => sum + child.size, 0) : planAmount;
        const value = children.length > 0 ? children.reduce((sum, child) => sum + child.value, 0) : actualAmount;
        const utilization = size === 0 ? 0 : (value / size) * 100;

        return {
          name: c.categoryName,
          size,
          value,
          utilization,
          children: children.length > 0 ? children : undefined,
        };
      })
      .filter(node => node.size > 0); // Filter out empty categories
  };

  return buildNode(null);
};

export const getHeatmapData = async (fiscalYear: number): Promise<HeatmapDataPoint[]> => {
  // 1. Fetch Top L2 Categories by Expense
  const topCategories = await prisma.monthlyActualEntry.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: {
      fiscalYear,
      category: { level: 2, categoryType: CategoryType.EXPENSE },
    },
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });

  const categoryIds = topCategories.map((c) => c.categoryId);

  // 2. Fetch Monthly Data for these categories
  const monthlyData = await prisma.monthlyActualEntry.groupBy({
    by: ["categoryId", "month"],
    _sum: { amount: true },
    where: {
      fiscalYear,
      categoryId: { in: categoryIds },
    },
  });

  // 3. Fetch Plans (assuming annual plan spread evenly for simplicity, or fetch monthly plans if available)
  // In this seed data, plans are annual. We'll divide by 12 for monthly target.
  const plans = await prisma.planFinancialData.findMany({
    where: {
      fiscalYear,
      categoryId: { in: categoryIds },
    },
  });

  const planMap = new Map(plans.map(p => [p.categoryId, Number(p.planAmount) / 12]));
  
  // Get category names
  const categoryDetails = await prisma.budgetCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, categoryName: true },
  });
  const nameMap = new Map(categoryDetails.map(c => [c.id, c.categoryName]));

  // 4. Transform to Heatmap format
  return categoryIds.map(catId => {
    const catName = nameMap.get(catId) || "Unknown";
    const monthlyTarget = planMap.get(catId) || 0;
    
    const data = Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
      const entry = monthlyData.find(d => d.categoryId === catId && d.month === month);
      const actual = Number(entry?._sum.amount || 0);
      const variance = monthlyTarget === 0 ? 0 : ((actual - monthlyTarget) / monthlyTarget) * 100;
      
      return {
        x: getMonthLabel(month),
        y: variance,
        value: actual,
      };
    });

    return {
      id: catId,
      category: catName,
      data,
    };
  });
};
