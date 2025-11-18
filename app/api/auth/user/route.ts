// app/api/auth/user/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

const prisma = new PrismaClient();

// Mock user data สำหรับกรณีที่ใช้ mock login
const mockUsers = {
  mock_exec_001: {
    id: "mock_exec_001",
    providerId: "mock_exec_001",
    name: "นพ.พร้อม ใจบริการ (Mock)",
    email: "exec@example.com",
    role: "EXECUTIVE",
    firstNameTh: "พร้อม",
    lastNameTh: "ใจบริการ",
    organizationHnameTh: "โรงพยาบาลตัวอย่าง",
    organizationPosition: "ผู้อำนวยการโรงพยาบาล",
    ialLevel: 3.0,
    isDirector: true,
    isHrAdmin: false,
  },
  mock_dept_001: {
    id: "mock_dept_001",
    providerId: "mock_dept_001",
    name: "พญ.สมใจ ดูแลดี (Mock)",
    email: "dept@example.com",
    role: "DEPT_HEAD",
    firstNameTh: "สมใจ",
    lastNameTh: "ดูแลดี",
    organizationHnameTh: "โรงพยาบาลตัวอย่าง",
    organizationPosition: "หัวหน้าแผนกเวชปฏิบัติ",
    ialLevel: 2.8,
    isDirector: false,
    isHrAdmin: true,
  },
  mock_group_001: {
    id: "mock_group_001",
    providerId: "mock_group_001",
    name: "นายกลุ่ม งานนำ (Mock)",
    email: "group@example.com",
    role: "GROUP_HEAD",
    firstNameTh: "กลุ่ม",
    lastNameTh: "งานนำ",
    organizationHnameTh: "โรงพยาบาลตัวอย่าง",
    organizationPosition: "หัวหน้ากลุ่มงานพัสดุ",
    ialLevel: 2.7,
    isDirector: false,
    isHrAdmin: false,
  },
  mock_op_001: {
    id: "mock_op_001",
    providerId: "mock_op_001",
    name: "นางสาวปฏิบัติ งานดี (Mock)",
    email: "operator@example.com",
    role: "OPERATOR",
    firstNameTh: "ปฏิบัติ",
    lastNameTh: "งานดี",
    organizationHnameTh: "โรงพยาบาลตัวอย่าง",
    organizationPosition: "เจ้าหน้าที่พัสดุ",
    ialLevel: 2.5,
    isDirector: false,
    isHrAdmin: false,
  },
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("API /auth/user: Session", session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ตรวจสอบว่าเป็น mock user หรือไม่
    const isMockUser = session.user.id.startsWith("mock_");

    let userData;

    if (isMockUser) {
      // ใช้ mock data
      userData = mockUsers[session.user.id as keyof typeof mockUsers];
      if (!userData) {
        return NextResponse.json(
          { error: "Mock user not found" },
          { status: 404 }
        );
      }
    } else {
      // ค้นหาจาก database
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

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      userData = user;
    }

    console.log("API /auth/user: Found user", userData);

    return NextResponse.json({
      user: userData,
      isMockUser,
    });
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
