// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/users - ดึงข้อมูลผู้ใช้
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        providerId: true,
        firstName: true,
        lastName: true,
        position: true,
        role: true,
        _count: {
          select: {
            createdItems: true,
            createdEntries: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
