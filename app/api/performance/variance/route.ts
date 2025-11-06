// app/api/performance/variance/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BudgetType } from "@prisma/client";

// GET /api/performance/variance?fy=2024&quarter=1
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fy = parseInt(searchParams.get("fy") || "2024");
  const quarter = parseInt(searchParams.get("quarter") || "1");

  try {
    // 1. Get Root Cause Notes
    const notes = await db.varianceNote.findMany({
      where: {
        year: fy,
        quarter: quarter,
      },
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Get Breakdown by Department
    // (Logic จำลอง: ในระบบจริง ต้องคำนวณ Variance (Actual vs Target) ของแต่ละแผนกใน Q1)
    const breakdown = [
      { name: "IT", value: 75000, id: "dept-it-id" }, // เกินเป้า 75k
      { name: "HR", value: 20000, id: "dept-hr-id" }, // เกินเป้า 20k
      { name: "Finance", value: -10000, id: "dept-finance-id" }, // ต่ำกว่าเป้า
    ].filter((v) => v.value > 0); // เอาเฉพาะที่เกินเป้า

    return NextResponse.json({ notes, breakdown });
  } catch (error) {
    console.error("[API_VARIANCE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
