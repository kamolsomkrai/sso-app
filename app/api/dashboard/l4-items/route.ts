// app/api/dashboard/l4-items/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "2569");
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    // ดึง procurement items
    const procurementItems = await db.procurementItem.findMany({
      where: { category_id: categoryId },
      include: {
        monthlyEntries: {
          where: {
            fiscalYear: {
              in: [fiscalYear, fiscalYear - 1, fiscalYear - 2],
            },
          },
          orderBy: { fiscalYear: "desc" },
        },
        createdBy: {
          select: { firstName: true, lastName: true },
        },
        updatedBy: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { item_name: "asc" },
    });

    const itemsData = procurementItems.map((item) => {
      // ข้อมูลปีปัจจุบัน
      const currentYearEntries = item.monthlyEntries.filter(
        (entry) => entry.fiscalYear === fiscalYear
      );
      const currentYearActual = currentYearEntries.reduce(
        (sum, entry) => sum + Number(entry.amount),
        0
      );

      // ข้อมูลปีก่อนหน้า
      const lastYearEntries = item.monthlyEntries.filter(
        (entry) => entry.fiscalYear === fiscalYear - 1
      );
      const lastYearActual = lastYearEntries.reduce(
        (sum, entry) => sum + Number(entry.amount),
        0
      );

      // ข้อมูล 2 ปีก่อน
      const twoYearsAgoEntries = item.monthlyEntries.filter(
        (entry) => entry.fiscalYear === fiscalYear - 2
      );
      const twoYearsAgoActual = twoYearsAgoEntries.reduce(
        (sum, entry) => sum + Number(entry.amount),
        0
      );

      return {
        id: item.item_id,
        name: item.item_name,
        procurementCode: item.procurement_code,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        plan: Number(item.plan_amount),
        currentYearActual,
        lastYearActual,
        twoYearsAgoActual,
        variance: currentYearActual - Number(item.plan_amount),
        createdBy: `${item.createdBy?.firstName} ${item.createdBy?.lastName}`,
        updatedAt: item.updatedAt,
      };
    });

    return NextResponse.json(itemsData);
  } catch (error) {
    console.error("[L4_ITEMS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
