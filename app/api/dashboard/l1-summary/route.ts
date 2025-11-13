// app/api/dashboard/l1-summary/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "2569");

    // ดึงข้อมูล L1 Categories (รายได้และรายจ่าย)
    const l1Categories = await db.budgetCategory.findMany({
      where: { level: 1 },
      include: {
        planData: {
          where: { fiscal_year: fiscalYear },
        },
        children: {
          include: {
            planData: {
              where: { fiscal_year: fiscalYear },
            },
            monthlyEntries: {
              where: { fiscalYear: fiscalYear },
            },
          },
        },
      },
    });

    // คำนวณข้อมูลสรุป
    const revenueCategory = l1Categories.find(
      (cat) => cat.category_type === "revenue"
    );
    const expenseCategory = l1Categories.find(
      (cat) => cat.category_type === "expense"
    );

    const revenuePlan = revenueCategory?.planData[0]?.plan_amount || 0;
    const expensePlan = expenseCategory?.planData[0]?.plan_amount || 0;

    const revenueActual =
      revenueCategory?.children
        .flatMap((child) =>
          child.monthlyEntries.map((entry) => Number(entry.amount))
        )
        .reduce((sum, amount) => sum + amount, 0) || 0;

    const expenseActual =
      expenseCategory?.children
        .flatMap((child) =>
          child.monthlyEntries.map((entry) => Number(entry.amount))
        )
        .reduce((sum, amount) => sum + amount, 0) || 0;

    // ข้อมูลรายเดือน
    const monthlyData = await getMonthlyData(fiscalYear);

    return NextResponse.json({
      summary: {
        revenue: {
          plan: Number(revenuePlan),
          actual: revenueActual,
          variance: revenueActual - Number(revenuePlan),
        },
        expense: {
          plan: Number(expensePlan),
          actual: expenseActual,
          variance: expenseActual - Number(expensePlan),
        },
      },
      monthlyTrend: monthlyData,
      categories: l1Categories.map((cat) => ({
        id: cat.category_id,
        name: cat.category_name,
        type: cat.category_type,
        plan: Number(cat.planData[0]?.plan_amount || 0),
        actual: cat.children
          .flatMap((child) =>
            child.monthlyEntries.map((entry) => Number(entry.amount))
          )
          .reduce((sum, amount) => sum + amount, 0),
      })),
    });
  } catch (error) {
    console.error("[L1_SUMMARY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function getMonthlyData(fiscalYear: number) {
  // ส่งคืนข้อมูลเทรนด์รายเดือน (ตัวอย่าง)
  return [
    { month: 10, revenue: 4500000, expense: 3200000 },
    { month: 11, revenue: 5200000, expense: 3800000 },
    { month: 12, revenue: 4800000, expense: 3500000 },
    { month: 1, revenue: 5100000, expense: 4000000 },
    { month: 2, revenue: 4900000, expense: 3700000 },
    { month: 3, revenue: 5300000, expense: 4200000 },
  ];
}
