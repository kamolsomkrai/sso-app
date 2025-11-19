import { PrismaClient, CategoryType } from "@prisma/client";
import { DrillDownRow, DrillLevel } from "@/lib/types/drilldown";
import { StatusType } from "@/lib/types/dashboard";

const prisma = new PrismaClient();

function getFinancialStatus(variancePercent: number): StatusType {
  if (variancePercent > 5) return "danger";
  if (variancePercent > 0) return "warning";
  return "success";
}

async function getSubTreeIds(
  categoryId: string
): Promise<{ categoryIds: string[]; itemIds: string[] }> {
  const children = await prisma.budgetCategory.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  let allCategoryIds = [categoryId];
  let allItemIds: string[] = [];

  for (const child of children) {
    const subTree = await getSubTreeIds(child.id);
    allCategoryIds.push(...subTree.categoryIds);
    allItemIds.push(...subTree.itemIds);
  }

  const items = await prisma.procurementItem.findMany({
    where: { categoryId: { in: allCategoryIds } },
    select: { id: true },
  });

  allItemIds.push(...items.map((i) => i.id));

  return { categoryIds: allCategoryIds, itemIds: allItemIds };
}

export async function getDrillDownData(
  parentId: string | null,
  currentLevel: number,
  fiscalYear: number
): Promise<DrillDownRow[]> {
  const targetLevel = currentLevel + 1;

  // CASE 1: Categories (L1 -> L4)
  if (currentLevel < 4) {
    const categories = await prisma.budgetCategory.findMany({
      where: { parentId: parentId, level: targetLevel },
      include: {
        _count: { select: { children: true, procurementItems: true } },
      },
      orderBy: { categoryCode: "asc" },
    });

    return await Promise.all(
      categories.map(async (cat) => {
        const { categoryIds, itemIds } = await getSubTreeIds(cat.id);

        const [planAgg, actualAgg, lastYearActualAgg, nextYearPlanAgg] =
          await Promise.all([
            // Plan Current Year
            prisma.planFinancialData.aggregate({
              _sum: { planAmount: true },
              where: { fiscalYear, categoryId: { in: categoryIds } },
            }),
            // Actual Current Year
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
            // Actual Last Year (Y-1)
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
            // Plan Next Year (Y+1)
            prisma.planFinancialData.aggregate({
              _sum: { planAmount: true },
              where: {
                fiscalYear: fiscalYear + 1,
                categoryId: { in: categoryIds },
              },
            }),
          ]);

        const plan = Number(planAgg._sum.planAmount || 0);
        const actual = Number(actualAgg._sum.amount || 0);
        const variance = actual - plan;
        const variancePercent = plan === 0 ? 0 : (variance / plan) * 100;

        return {
          id: cat.id,
          name: cat.categoryName,
          code: cat.categoryCode,
          level: `L${targetLevel}` as DrillLevel,
          hasChildren:
            cat._count.children > 0 || cat._count.procurementItems > 0,
          financials: {
            lastYearActual: Number(lastYearActualAgg._sum.amount || 0),
            currentPlan: plan,
            currentActual: actual,
            variance: variance,
            variancePercent: variancePercent,
            status: getFinancialStatus(variancePercent),
            nextYearPlan: Number(nextYearPlanAgg._sum.planAmount || 0),
          },
        };
      })
    );
  }

  // CASE 2: Items (L5)
  if (currentLevel === 4 && parentId) {
    const items = await prisma.procurementItem.findMany({
      where: { categoryId: parentId },
      orderBy: { itemName: "asc" },
    });

    return await Promise.all(
      items.map(async (item) => {
        const [planAgg, actualAgg, lastYearAgg, nextYearAgg] =
          await Promise.all([
            prisma.planFinancialData.findFirst({
              where: { fiscalYear, procurementItemId: item.id },
            }),
            prisma.monthlyActualEntry.aggregate({
              _sum: { amount: true },
              where: { fiscalYear, procurementItemId: item.id },
            }),
            prisma.monthlyActualEntry.aggregate({
              _sum: { amount: true },
              where: { fiscalYear: fiscalYear - 1, procurementItemId: item.id },
            }),
            prisma.planFinancialData.findFirst({
              where: { fiscalYear: fiscalYear + 1, procurementItemId: item.id },
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
          hasChildren: false,
          financials: {
            lastYearActual: Number(lastYearAgg._sum.amount || 0),
            currentPlan: plan,
            currentActual: actual,
            variance: variance,
            variancePercent: variancePercent,
            status: getFinancialStatus(variancePercent),
            nextYearPlan: Number(nextYearAgg?.planAmount || 0),
          },
        };
      })
    );
  }

  return [];
}
