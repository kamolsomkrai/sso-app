// app/api/dashboard/l3-drilldown/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "2569");
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      return new NextResponse("Parent ID is required", { status: 400 });
    }

    // ดึง L3 categories
    const l3Categories = await db.budgetCategory.findMany({
      where: {
        parent_id: parentId,
        level: 3,
      },
      include: {
        planData: {
          where: { fiscal_year: fiscalYear },
        },
        children: {
          include: {
            procurementItems: {
              include: {
                monthlyEntries: {
                  where: { fiscalYear: fiscalYear },
                },
              },
            },
          },
        },
        monthlyEntries: {
          where: { fiscalYear: fiscalYear },
        },
        procurementItems: {
          include: {
            monthlyEntries: {
              where: { fiscalYear: fiscalYear },
            },
          },
        },
      },
    });

    const drilldownData = l3Categories.map((category) => {
      const plan = Number(category.planData[0]?.plan_amount || 0);

      // รวม actual จาก category เองและ procurement items
      const ownActual = category.monthlyEntries.reduce(
        (sum, entry) => sum + Number(entry.amount),
        0
      );
      const itemsActual = category.procurementItems
        .flatMap((item) =>
          item.monthlyEntries.map((entry) => Number(entry.amount))
        )
        .reduce((sum, amount) => sum + amount, 0);

      const actual = ownActual + itemsActual;

      return {
        id: category.category_id,
        name: category.category_name,
        code: category.category_code,
        plan,
        actual,
        variance: actual - plan,
        itemsCount: category.procurementItems.length,
      };
    });

    return NextResponse.json(drilldownData);
  } catch (error) {
    console.error("[L3_DRILLDOWN_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
