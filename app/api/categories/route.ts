// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = parseInt(searchParams.get("level") || "0");
    const parentId = searchParams.get("parentId");

    if (!level) {
      return NextResponse.json(
        { error: "Level parameter is required" },
        { status: 400 }
      );
    }

    if (level > 1 && !parentId) {
      // Levels 2, 3, 4 require a parentId
      return NextResponse.json([]); // Return empty array, not an error
    }

    const whereClause: { level: number; parentId?: string } = {
      level: level,
    };

    if (parentId) {
      whereClause.parentId = parentId;
    }

    const categories = await prisma.budgetCategory.findMany({
      where: whereClause,
      select: {
        id: true,
        categoryName: true,
      },
      orderBy: {
        categoryName: "asc",
      },
    });

    // Format for Combobox
    const responseData = categories.map((cat) => ({
      value: cat.id.toString(), // Ensure value is string
      label: cat.categoryName,
    }));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error: /api/categories", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
