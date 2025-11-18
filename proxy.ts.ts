// proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // ตรวจสอบ path ที่ต้องการ protection
  const protectedPaths = [
    "/dashboard",
    "/data-entry",
    "/api/entries",
    "/api/dashboard",
  ];

  const path = request.nextUrl.pathname;

  // ตรวจสอบว่าเป็น protected path หรือไม่
  const isProtected = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath)
  );

  if (isProtected) {
    // ตรวจสอบ session จาก cookie (simplified version)
    const token =
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token");

    if (!token) {
      // Redirect ไปหน้า login ถ้าไม่มี token
      const loginUrl = new URL("/", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/data-entry/:path*",
    "/api/entries/:path*",
    "/api/dashboard/:path*",
  ],
};
