// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/analytics - ดึงข้อมูลสำหรับ Dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get("fiscalYear") || "2569";

    // 1. ข้อมูลแผน vs ใช้จริง
    const planVsActual = await prisma.planFinancialData.findMany({
      where: {
        fiscal_year: parseInt(fiscalYear),
      },
      include: {
        category: {
          select: {
            category_name: true,
            level: true,
            parent: {
              select: {
                category_name: true,
              },
            },
          },
        },
        _count: {
          select: {
            category: {
              select: {
                monthlyEntries: {
                  where: {
                    fiscalYear: parseInt(fiscalYear),
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. ข้อมูลใช้จริงแยกตามเดือน
    const monthlyActual = await prisma.monthlyActualEntry.groupBy({
      by: ["month"],
      where: {
        fiscalYear: parseInt(fiscalYear),
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        month: "asc",
      },
    });

    // 3. ข้อมูลแยกตามหมวดหมู่
    const byCategory = await prisma.monthlyActualEntry.groupBy({
      by: ["category_id"],
      where: {
        fiscalYear: parseInt(fiscalYear),
      },
      _sum: {
        amount: true,
      },
      _count: {
        entry_id: true,
      },
    });

    // 4. ข้อมูลสถิติรวม
    const totalStats = {
      totalPlan: planVsActual.reduce(
        (sum, item) => sum + Number(item.plan_amount),
        0
      ),
      totalActual: monthlyActual.reduce(
        (sum, item) => sum + Number(item._sum.amount || 0),
        0
      ),
      totalItems: await prisma.procurementItem.count(),
      totalEntries: await prisma.monthlyActualEntry.count({
        where: { fiscalYear: parseInt(fiscalYear) },
      }),
    };

    return NextResponse.json({
      success: true,
      data: {
        planVsActual,
        monthlyActual,
        byCategory,
        totalStats,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
