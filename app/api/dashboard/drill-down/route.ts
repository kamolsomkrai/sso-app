import { NextResponse } from "next/server";
import { getDrillDownData } from "@/lib/services/drill-down-service";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // 1. Security Check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Parameters
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "2567");
    const parentId = searchParams.get("parentId");
    const level = parseInt(searchParams.get("level") || "0"); // Current view level (0 = Overview)

    // 3. Get Breadcrumb Context (For UI Navigation)
    // If we are drilling down, fetch the parent's name to display in the header
    let parentName = "Overview";
    if (parentId) {
      const parentCat = await prisma.budgetCategory.findUnique({
        where: { id: parentId },
        select: { categoryName: true },
      });
      if (parentCat) parentName = parentCat.categoryName;
    }

    // 4. Call Service
    // Pass `parentId` (can be null for root) and `level`
    const items = await getDrillDownData(parentId || null, level, fiscalYear);

    return NextResponse.json({
      parent: parentId ? { id: parentId, name: parentName, level } : null,
      items,
    });
  } catch (error) {
    console.error("[API] Drill-Down Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch drill-down data", details: String(error) },
      { status: 500 }
    );
  }
}
