import { PrismaClient } from "@prisma/client";

// 'declare' ใช้เพื่อบอก TypeScript ว่าตัวแปรนี้มีอยู่
// แม้ว่าจะไม่ได้ khởi tạo (initialize) ในไฟล์นี้
// เราจะผูก 'prisma' ไว้กับ 'globalThis'
declare global {
  var prisma: PrismaClient | undefined;
}

// Khởi tạo (initialize) 'db'
// 1. ตรวจสอบว่า 'globalThis.prisma' มีอยู่แล้วหรือไม่ ถ้ามี ให้ใช้ตัวนั้น
// 2. ถ้าไม่มี ให้สร้าง 'PrismaClient' ใหม่
// นี่คือการป้องกันการสร้าง 'PrismaClient' หลาย instance
// ระหว่างการ hot reloading ในโหมด development
export const db = globalThis.prisma || new PrismaClient();

// ใน production, 'globalThis.prisma' จะเป็น undefined เสมอ
// 'db' จึงเป็น client ที่สร้างใหม่เสมอ
// ใน development, 'globalThis.prisma' จะถูกนำกลับมาใช้ใหม่
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
