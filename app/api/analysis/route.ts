import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { TreemapNode } from '@/lib/types/dashboard';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const fiscalYear = Number(searchParams.get('fiscalYear')) || new Date().getFullYear();
    const level = Number(searchParams.get('level')) || 2;
    const period = searchParams.get('period') || 'yearly';
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : null;
    const quarter = searchParams.get('quarter') ? Number(searchParams.get('quarter')) : null;

    // Build month filter based on period type
    let monthFilter: number[] | undefined;
    if (period === 'monthly' && month) {
      monthFilter = [month];
    } else if (period === 'quarterly' && quarter) {
      // Thai fiscal year: Q1=Oct-Dec, Q2=Jan-Mar, Q3=Apr-Jun, Q4=Jul-Sep
      const quarterMonths: Record<number, number[]> = {
        1: [10, 11, 12],
        2: [1, 2, 3],
        3: [4, 5, 6],
        4: [7, 8, 9],
      };
      monthFilter = quarterMonths[quarter];
    }

    let treemapData: TreemapNode[] = [];

    // Level 5 = Procurement Items
    if (level === 5) {
      // Fetch all procurement items
      const items = await db.procurementItem.findMany({
        select: {
          id: true,
          itemName: true,
          categoryId: true,
        },
      });

      // Fetch plan data for items
      const itemPlanData = await db.planFinancialData.groupBy({
        by: ['procurementItemId'],
        _sum: { planAmount: true },
        where: {
          fiscalYear,
          procurementItemId: { in: items.map((item) => item.id) },
        },
      });

      // Build item plan map
      const itemPlanMap = new Map<string, number>();
      itemPlanData.forEach((p) => {
        if (p.procurementItemId && p._sum.planAmount) {
          itemPlanMap.set(p.procurementItemId, Number(p._sum.planAmount));
        }
      });

      // Fetch actual data for items with month filter
      const itemActualData = await db.monthlyActualEntry.groupBy({
        by: ['procurementItemId'],
        _sum: { amount: true },
        where: {
          fiscalYear,
          procurementItemId: { in: items.map((item) => item.id) },
          ...(monthFilter && { month: { in: monthFilter } }),
        },
      });

      // Build item actual map
      const itemActualMap = new Map<string, number>();
      itemActualData.forEach((a) => {
        if (a.procurementItemId && a._sum.amount) {
          itemActualMap.set(a.procurementItemId, Number(a._sum.amount));
        }
      });

      // Build treemap nodes for items
      treemapData = items
        .map((item) => {
          const planAmount = itemPlanMap.get(item.id) || 0;
          const actualAmount = itemActualMap.get(item.id) || 0;
          const utilization = planAmount === 0 ? 0 : (actualAmount / planAmount) * 100;

          return {
            name: item.itemName,
            size: planAmount,
            value: actualAmount,
            utilization,
          };
        })
        .filter((node) => node.size > 0);
    } else {
      // Levels 1-4 = Budget Categories
      const categories = await db.budgetCategory.findMany({
        where: { level },
        select: {
          id: true,
          categoryName: true,
          categoryCode: true,
        },
      });

      // Fetch plan data for these categories
      const planData = await db.planFinancialData.groupBy({
        by: ['categoryId'],
        _sum: { planAmount: true },
        where: {
          fiscalYear,
          categoryId: { in: categories.map((c) => c.id) },
        },
      });

      // Build plan map
      const planMap = new Map<string, number>();
      planData.forEach((p) => {
        if (p.categoryId && p._sum.planAmount) {
          planMap.set(p.categoryId, Number(p._sum.planAmount));
        }
      });

      // Fetch actual data with month filter if applicable
      const actualData = await db.monthlyActualEntry.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        where: {
          fiscalYear,
          categoryId: { in: categories.map((c) => c.id) },
          ...(monthFilter && { month: { in: monthFilter } }),
        },
      });

      // Build actual map
      const actualMap = new Map<string, number>();
      actualData.forEach((a) => {
        if (a.categoryId && a._sum.amount) {
          actualMap.set(a.categoryId, Number(a._sum.amount));
        }
      });

      // Build treemap nodes
      treemapData = categories
        .map((category) => {
          const planAmount = planMap.get(category.id) || 0;
          const actualAmount = actualMap.get(category.id) || 0;
          const utilization = planAmount === 0 ? 0 : (actualAmount / planAmount) * 100;

          return {
            name: category.categoryName,
            size: planAmount,
            value: actualAmount,
            utilization,
          };
        })
        .filter((node) => node.size > 0);
    }

    return NextResponse.json(treemapData);
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis data' },
      { status: 500 }
    );
  }
}
