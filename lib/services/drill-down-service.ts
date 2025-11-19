import { PrismaClient, CategoryType } from "@prisma/client";
import { DrillDownRow, DrillLevel } from "@/lib/types/drilldown";
import { StatusType } from "@/lib/types/dashboard";

const prisma = new PrismaClient();

/**
 * Helper to determine status color based on budget variance
 */
function getFinancialStatus(
  variancePercent: number,
  type: CategoryType
): StatusType {
  if (type === CategoryType.EXPENSE) {
    if (variancePercent > 10) return "danger"; // > 10% over budget
    if (variancePercent > 0) return "warning"; // 0-10% over budget
    return "success"; // Under budget
  } else {
    if (variancePercent < -10) return "danger"; // > 10% under target
    if (variancePercent < 0) return "warning"; // 0-10% under target
    return "success"; // Over target
  }
}

/**
 * Recursively finds all child Category IDs and Item IDs for a given category.
 * This is crucial for L1/L2 views where "Actual" must sum up all deep nested items.
 */
async function getSubTreeIds(
  categoryId: string
): Promise<{ categoryIds: string[]; itemIds: string[] }> {
  // 1. Find immediate children
  const children = await prisma.budgetCategory.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  let allCategoryIds = [categoryId];
  let allItemIds: string[] = [];

  // 2. Recursively get children's sub-trees
  for (const child of children) {
    const subTree = await getSubTreeIds(child.id);
    allCategoryIds.push(...subTree.categoryIds);
    allItemIds.push(...subTree.itemIds);
  }

  // 3. Find items directly attached to these categories
  const items = await prisma.procurementItem.findMany({
    where: { categoryId: { in: allCategoryIds } },
    select: { id: true },
  });

  allItemIds.push(...items.map((i) => i.id));

  return { categoryIds: allCategoryIds, itemIds: allItemIds };
}

export async function getDrillDownData(
  parentId: string | null,
  currentLevel: number, // 0=Root, 1=L1, 2=L2...
  fiscalYear: number
): Promise<DrillDownRow[]> {
  // --- CASE 1: Fetching Categories (L1 -> L4) ---
  if (currentLevel < 4) {
    const targetLevel = currentLevel + 1;

    const categories = await prisma.budgetCategory.findMany({
      where: {
        parentId: parentId,
        level: targetLevel,
      },
      include: {
        _count: { select: { children: true, procurementItems: true } },
      },
      orderBy: { categoryCode: "asc" },
    });

    // Calculate financials for each category
    const rows = await Promise.all(
      categories.map(async (cat) => {
        // Get all IDs in the subtree for accurate aggregation
        const { categoryIds, itemIds } = await getSubTreeIds(cat.id);

        const [planAgg, actualAgg, lastYearAgg] = await Promise.all([
          // Plan (Current Year)
          prisma.planFinancialData.aggregate({
            _sum: { planAmount: true },
            where: { fiscalYear, categoryId: { in: categoryIds } },
          }),
          // Actual (Current Year) - Check both Category and Item entries
          prisma.monthlyActualEntry.aggregate({
            _sum: { amount: true },
            where: {
              fiscalYear,
              OR: [
                { categoryId: { in: categoryIds } },
                { procurementItemId: { in: itemIds } },
              ],
            },
          }),
          // Actual (Last Year)
          prisma.monthlyActualEntry.aggregate({
            _sum: { amount: true },
            where: {
              fiscalYear: fiscalYear - 1,
              OR: [
                { categoryId: { in: categoryIds } },
                { procurementItemId: { in: itemIds } },
              ],
            },
          }),
        ]);

        const plan = Number(planAgg._sum.planAmount || 0);
        const actual = Number(actualAgg._sum.amount || 0);
        const lastYearActual = Number(lastYearAgg._sum.amount || 0);
        const variance = actual - plan;
        const variancePercent = plan === 0 ? 0 : (variance / plan) * 100;

        return {
          id: cat.id,
          name: cat.categoryName,
          code: cat.categoryCode,
          level: `L${targetLevel}` as DrillLevel,
          hasChildren:
            cat._count.children > 0 || cat._count.procurementItems > 0,
          currentYear: {
            plan,
            actual,
            variance,
            variancePercent,
            status: getFinancialStatus(variancePercent, cat.categoryType),
          },
          history: {
            lastYearActual,
            trend: [], // Placeholder for monthly trend array
          },
        };
      })
    );

    return rows;
  }

  // --- CASE 2: Fetching Items (L4 -> L5) ---
  // When we drill into an L4, we show the Procurement Items
  if (currentLevel === 4 && parentId) {
    const items = await prisma.procurementItem.findMany({
      where: { categoryId: parentId },
      orderBy: { itemName: "asc" },
    });

    const rows = await Promise.all(
      items.map(async (item) => {
        const [planAgg, actualAgg] = await Promise.all([
          prisma.planFinancialData.findFirst({
            where: { fiscalYear, procurementItemId: item.id },
          }),
          prisma.monthlyActualEntry.aggregate({
            _sum: { amount: true },
            where: { fiscalYear, procurementItemId: item.id },
          }),
        ]);

        const plan = Number(planAgg?.planAmount || 0);
        const actual = Number(actualAgg._sum.amount || 0);
        const variance = actual - plan;
        const variancePercent = plan === 0 ? 0 : (variance / plan) * 100;

        return {
          id: item.id,
          name: item.itemName,
          code: undefined,
          level: "L5",
          hasChildren: false, // Items are leaves
          currentYear: {
            plan,
            actual,
            variance,
            variancePercent,
            status: getFinancialStatus(variancePercent, CategoryType.EXPENSE),
          },
          history: {
            lastYearActual: 0,
            trend: [],
          },
        };
      })
    );

    return rows;
  }

  return [];
}
