// app/api/items/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId"); // This is L4 Category ID

    if (!categoryId) {
      return NextResponse.json([]); // No L4 category selected
    }

    const items = await prisma.procurementItem.findMany({
      where: {
        categoryId: categoryId,
      },
      select: {
        id: true,
        itemName: true,
      },
      orderBy: {
        itemName: "asc",
      },
    });

    // Format for Combobox
    const responseData = items.map((item) => ({
      value: item.id,
      label: item.itemName,
    }));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error: /api/items", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
