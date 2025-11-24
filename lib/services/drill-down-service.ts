import { PrismaClient, CategoryType } from "@prisma/client";
import { DrillDownRow, DrillLevel } from "@/lib/types/drilldown";
import { StatusType } from "@/lib/types/dashboard";

const prisma = new PrismaClient();

function getFinancialStatus(variancePercent: number): StatusType {
  if (variancePercent > 5) return "danger";
  if (variancePercent > 0) return "warning";
  return "success";
}

// Helper: หา ID ลูกหลานทั้งหมดเพื่อรวมยอดเงิน (Aggregation)
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

// ฟังก์ชันคำนวณการเงินสำหรับ Item เดี่ยวๆ
async function getItemFinancials(item: any, fiscalYear: number) {
  const [planAgg, actualAgg, lastYearAgg, nextYearAgg] = await Promise.all([
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
    lastYearActual: Number(lastYearAgg._sum.amount || 0),
    currentPlan: plan,
    currentActual: actual,
    variance: variance,
    variancePercent: variancePercent,
    status: getFinancialStatus(variancePercent),
    nextYearPlan: Number(nextYearAgg?.planAmount || 0),
  };
}

export async function getDrillDownData(
  parentId: string | null,
  currentLevel: number,
  fiscalYear: number
): Promise<DrillDownRow[]> {
  const targetCategoryLevel = currentLevel + 1;

  // 1. Fetch Categories (Sub-categories)
  // ถ้าปัจจุบันเป็น L4 (level=4), target จะเป็น L5 ซึ่ง Category ไม่มี L5 -> จะได้ array ว่าง (ถูกต้อง)
  const categories = await prisma.budgetCategory.findMany({
    where: { parentId: parentId, level: targetCategoryLevel },
    include: { _count: { select: { children: true, procurementItems: true } } },
    orderBy: { categoryCode: "asc" },
  });

  // 2. Fetch Direct Items (Items ที่อยู่ภายใต้ Parent นี้โดยตรง)
  // เราจะหา Item ก็ต่อเมื่อมี ParentId ส่งมา (ไม่ใช่ Root L0)
  let directItems: any[] = [];
  if (parentId) {
    directItems = await prisma.procurementItem.findMany({
      where: { categoryId: parentId },
      orderBy: { itemName: "asc" },
    });
  }

  // 3. Process Categories Data
  const categoryRows = await Promise.all(
    categories.map(async (cat) => {
      const { categoryIds, itemIds } = await getSubTreeIds(cat.id);

      const [planAgg, actualAgg, lastYearActualAgg, nextYearPlanAgg] =
        await Promise.all([
          prisma.planFinancialData.aggregate({
            _sum: { planAmount: true },
            where: { fiscalYear, categoryId: { in: categoryIds } },
          }),
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
        level: `L${targetCategoryLevel}` as DrillLevel,
        hasChildren: cat._count.children > 0 || cat._count.procurementItems > 0,
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

  // 4. Process Items Data
  const itemRows = await Promise.all(
    directItems.map(async (item) => {
      const financials = await getItemFinancials(item, fiscalYear);
      return {
        id: item.id,
        name: item.itemName,
        code: undefined,
        level: "L5" as DrillLevel, // Force Items to be L5 visuals
        hasChildren: false,
        financials,
      };
    })
  );

  // 5. Merge & Return
  // เอา Category ขึ้นก่อน แล้วตามด้วย Item
  return [...categoryRows, ...itemRows];
}
