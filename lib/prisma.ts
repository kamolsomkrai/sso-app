import { PrismaClient } from "@prisma/client";

// ป้องกันการสร้าง PrismaClient ใหม่ทุกครั้งที่มี Hot Reload ใน Development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
