// app/api/auth/user/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("API /auth/user: Session", session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        providerId: true,
        name: true,
        email: true,
        role: true,
        firstNameTh: true,
        lastNameTh: true,
        organizationHnameTh: true,
        organizationPosition: true,
        ialLevel: true,
        isDirector: true,
        isHrAdmin: true,
        createdAt: true,
      },
    });

    console.log("API /auth/user: Found user", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
