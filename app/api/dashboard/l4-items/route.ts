// app/api/dashboard/l4-items/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("year") || "2569");
    const catId = searchParams.get("cat_id"); // (นี่คือ L3 String UUID)

    if (!catId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    // 1. หา L4 Categories ทั้งหมดภายใต้ L3 catId นี้
    const l4Categories = await db.budgetCategory.findMany({
      where: { parent_id: catId },
      select: { category_id: true },
    });
    const l4CategoryIds = l4Categories.map((c) => c.category_id);

    // 2. ดึง "ราย list" (L4 Items)
    const procurementItems = await db.procurementItem.findMany({
      where: {
        category_id: { in: l4CategoryIds },
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        updatedBy: { select: { firstName: true, lastName: true } },
      },
    });

    // 3. ดึง "ยอดใช้จริงย้อนหลัง" ทั้งหมดของ Items เหล่านี้
    const itemIds = procurementItems.map((item) => item.item_id);
    const historicalActuals = await db.monthlyActualEntry.groupBy({
      by: ["procurement_item_id", "fiscalYear"],
      where: {
        procurement_item_id: { in: itemIds },
        fiscalYear: {
          in: [
            fiscalYear,
            fiscalYear - 1,
            fiscalYear - 2,
            fiscalYear - 3,
            fiscalYear - 4,
          ],
        },
      },
      _sum: { amount: true },
    });

    // 4. ประกอบข้อมูล
    const responseData = procurementItems.map((item) => {
      const getActualForYear = (year: number) => {
        const entry = historicalActuals.find(
          (a) => a.procurement_item_id === item.item_id && a.fiscalYear === year
        );
        return parseFloat(entry?._sum.amount?.toString() || "0");
      };

      return {
        id: item.item_id,
        name: item.item_name,
        updatedBy: `${item.updatedBy.firstName} ${item.updatedBy.lastName}`,
        updatedAt: item.updatedAt,

        // ข้อมูล 5 ปี (Dynamic)
        [`plan_${fiscalYear}`]: parseFloat(item.plan_amount.toString()),
        [`actual_${fiscalYear}`]: getActualForYear(fiscalYear), //
        [`actual_${fiscalYear - 1}`]: getActualForYear(fiscalYear - 1),
        [`actual_${fiscalYear - 2}`]: getActualForYear(fiscalYear - 2),
        [`actual_${fiscalYear - 3}`]: getActualForYear(fiscalYear - 3),
        [`actual_${fiscalYear - 4}`]: getActualForYear(fiscalYear - 4),
      };
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[API_L4_ITEMS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
