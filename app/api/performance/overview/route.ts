// app/api/performance/overview/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { THAI_FY_MONTHS } from "@/lib/utils";
import { BudgetType } from "@prisma/client";

// GET /api/performance/overview?fy=2024
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fy = parseInt(searchParams.get("fy") || "2024");

  try {
    // --- Logic for Quarterly ---
    // (นี่คือ Logic จำลองแบบง่าย)
    // ในระบบจริง คุณต้อง GROUP BY ไตรมาส
    const q1Target = 1500000;
    const q1Actual = 1550000; // สมมติเกินเป้า

    const quarterly = [
      {
        quarter: 1,
        target: q1Target,
        actual: q1Actual,
        variance: (q1Actual - q1Target) / q1Target,
      },
      { quarter: 2, target: 1500000, actual: 1400000, variance: -0.07 },
      { quarter: 3, target: 1500000, actual: 1500000, variance: 0 },
      { quarter: 4, target: 1500000, actual: 0, variance: 0 }, // ยังไม่เกิด
    ];

    // --- Logic for Monthly ---
    // ดึง Target รายเดือน (L1)
    const targets = await db.budget.findMany({
      where: {
        year: fy,
        type: BudgetType.EXPENSE,
        departmentId: null, // L1 Executive
        categoryId: null,
      },
      select: { month: true, amount: true },
    });

    // ดึง Actual รายเดือน (L1)
    // (Logic นี้ต้องซับซ้อนกว่านี้ โดยต้อง map วันที่ (date) ไปยังเดือน (month) ของปีงบ)
    const actuals = [
      { month: 10, total: 75000 },
      { month: 11, total: 270000 }, // (150k + 120k from seed)
      { month: 12, total: 120000 },
    ];

    const monthly = THAI_FY_MONTHS.map((name, index) => {
      const month = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9][index];
      const target = targets.find((t) => t.month === month)?.amount ?? 0;
      const actual = actuals.find((a) => a.month === month)?.total ?? 0;

      return {
        name: name, // 'ต.ค.', 'พ.ย.', ...
        target: Number(target),
        actual: Number(actual),
      };
    });

    return NextResponse.json({ quarterly, monthly });
  } catch (error) {
    console.error("[API_OVERVIEW_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
