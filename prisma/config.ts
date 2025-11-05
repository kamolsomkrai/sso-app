// prisma/config.ts
import { defineConfig } from "prisma/client";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: "./prisma/migrations",
  },
});
