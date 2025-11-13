// app/api/dashboard/l2-drilldown/route.ts
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

    // ดึง L2 categories
    const l2Categories = await db.budgetCategory.findMany({
      where: {
        parent_id: parentId,
        level: 2,
      },
      include: {
        planData: {
          where: { fiscal_year: fiscalYear },
        },
        children: {
          include: {
            monthlyEntries: {
              where: { fiscalYear: fiscalYear },
            },
          },
        },
        monthlyEntries: {
          where: { fiscalYear: fiscalYear },
        },
      },
    });

    const drilldownData = l2Categories.map((category) => {
      const plan = Number(category.planData[0]?.plan_amount || 0);

      // รวม actual จาก category เองและ children (L3)
      const ownActual = category.monthlyEntries.reduce(
        (sum, entry) => sum + Number(entry.amount),
        0
      );
      const childrenActual = category.children
        .flatMap((child) =>
          child.monthlyEntries.map((entry) => Number(entry.amount))
        )
        .reduce((sum, amount) => sum + amount, 0);

      const actual = ownActual + childrenActual;

      return {
        id: category.category_id,
        name: category.category_name,
        code: category.category_code,
        plan,
        actual,
        variance: actual - plan,
        childrenCount: category.children.length,
      };
    });

    return NextResponse.json(drilldownData);
  } catch (error) {
    console.error("[L2_DRILLDOWN_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
