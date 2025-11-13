// app/api/dashboard/l4-items/route.ts  (replace existing GET)
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("year") || "2569");
    const catId = searchParams.get("cat_id");
    if (!catId)
      return new NextResponse("Category ID is required", { status: 400 });

    // 1. L4 categories under this L3
    const l4Categories = await db.budgetCategory.findMany({
      where: { parent_id: catId },
      select: { category_id: true },
    });
    const l4CategoryIds = l4Categories.map((c) => c.category_id);

    // 2. Items under L4
    const items = await db.procurementItem.findMany({
      where: { category_id: { in: l4CategoryIds } },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        updatedBy: { select: { firstName: true, lastName: true } },
      },
    });

    const itemIds = items.map((i) => i.item_id);

    // 3. Historical actuals: last 12 months (Thai FY months: Oct..Sep of current fiscalYear)
    // We will query fiscalYear and fiscalYear-1 because Oct-Dec belong to previous calendar year in FY system
    const months = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const fiscalYearsToQuery = [fiscalYear, fiscalYear - 1];
    const actualsMonthly = await db.monthlyActualEntry.groupBy({
      by: ["procurement_item_id", "fiscalYear", "month"],
      where: {
        procurement_item_id: { in: itemIds },
        fiscalYear: { in: fiscalYearsToQuery },
        month: { in: months },
      },
      _sum: { amount: true },
    });

    // 4. Build per-item monthly series (last 12 months in order Oct..Sep)
    const buildSeries = (itemId: number) => {
      return months.map((m) => {
        const fy = m >= 10 ? fiscalYear - 1 : fiscalYear; // month 10-12 -> previous fiscal year of the calendar
        const rec = actualsMonthly.find(
          (a) =>
            a.procurement_item_id === itemId &&
            a.fiscalYear === fy &&
            a.month === m
        );
        return {
          month: `${fy}-${m.toString().padStart(2, "0")}`,
          actual: parseFloat((rec?._sum.amount || 0).toString()),
        };
      });
    };

    // 5. For each item return plan (current FY) and monthly series (last 12 months)
    const response = items.map((item) => {
      const series = buildSeries(item.item_id);
      return {
        id: item.item_id,
        name: item.item_name,
        updatedBy: `${item.updatedBy.firstName} ${item.updatedBy.lastName}`,
        updatedAt: item.updatedAt,
        plan_current_fy: parseFloat(item.plan_amount.toString()),
        monthlyLast12: series, // [{month, actual}, ...] Oct..Sep
        // also provide one-line summary: total actual last 12 months
        actual_last_12_sum: series.reduce((s, v) => s + v.actual, 0),
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API_L4_ITEMS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
