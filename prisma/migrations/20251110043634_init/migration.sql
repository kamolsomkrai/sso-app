/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `departmentId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `providerId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncomeItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VarianceNote` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[providerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('revenue', 'expense');

-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExpenseItem" DROP CONSTRAINT "ExpenseItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExpenseItem" DROP CONSTRAINT "ExpenseItem_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IncomeItem" DROP CONSTRAINT "IncomeItem_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VarianceNote" DROP CONSTRAINT "VarianceNote_authorUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VarianceNote" DROP CONSTRAINT "VarianceNote_departmentId_fkey";

-- DropIndex
DROP INDEX "public"."User_departmentId_idx";

-- DropIndex
DROP INDEX "public"."User_email_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "departmentId",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "firstName" VARCHAR(255) NOT NULL,
ADD COLUMN     "lastName" VARCHAR(255) NOT NULL,
ADD COLUMN     "position" VARCHAR(255),
ALTER COLUMN "role" SET DEFAULT 'OPERATOR',
ALTER COLUMN "providerId" DROP DEFAULT,
ALTER COLUMN "providerId" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("providerId");

-- DropTable
DROP TABLE "public"."Budget";

-- DropTable
DROP TABLE "public"."Department";

-- DropTable
DROP TABLE "public"."ExpenseCategory";

-- DropTable
DROP TABLE "public"."ExpenseItem";

-- DropTable
DROP TABLE "public"."IncomeItem";

-- DropTable
DROP TABLE "public"."VarianceNote";

-- DropEnum
DROP TYPE "public"."BudgetType";

-- CreateTable
CREATE TABLE "FiscalYear" (
    "year_id" SERIAL NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "year_label" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_planning" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FiscalYear_pkey" PRIMARY KEY ("year_id")
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "category_id" SERIAL NOT NULL,
    "category_code" VARCHAR(50) NOT NULL,
    "category_name" VARCHAR(500) NOT NULL,
    "category_type" "CategoryType" NOT NULL,
    "level" INTEGER NOT NULL,
    "display_order" INTEGER NOT NULL,
    "parent_id" INTEGER,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "PlanFinancialData" (
    "plan_id" SERIAL NOT NULL,
    "plan_amount" DECIMAL(15,2) NOT NULL,
    "plan_q1" DECIMAL(15,2),
    "plan_q2" DECIMAL(15,2),
    "plan_q3" DECIMAL(15,2),
    "plan_q4" DECIMAL(15,2),
    "category_id" INTEGER NOT NULL,
    "fiscal_year" INTEGER NOT NULL,

    CONSTRAINT "PlanFinancialData_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "ProcurementItem" (
    "item_id" SERIAL NOT NULL,
    "item_name" VARCHAR(500) NOT NULL,
    "details" TEXT,
    "requesting_dept_id" INTEGER NOT NULL,
    "plan_amount" DECIMAL(12,2) NOT NULL,
    "procurement_code" VARCHAR(50),
    "unit" VARCHAR(50),
    "quantity" INTEGER,
    "unit_price" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "ProcurementItem_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "MonthlyActualEntry" (
    "entry_id" SERIAL NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "procurement_item_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "MonthlyActualEntry_pkey" PRIMARY KEY ("entry_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FiscalYear_fiscal_year_key" ON "FiscalYear"("fiscal_year");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_category_code_key" ON "BudgetCategory"("category_code");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFinancialData_category_id_fiscal_year_key" ON "PlanFinancialData"("category_id", "fiscal_year");

-- CreateIndex
CREATE INDEX "MonthlyActualEntry_fiscalYear_month_idx" ON "MonthlyActualEntry"("fiscalYear", "month");

-- CreateIndex
CREATE INDEX "MonthlyActualEntry_category_id_idx" ON "MonthlyActualEntry"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_providerId_key" ON "User"("providerId");

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "BudgetCategory"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFinancialData" ADD CONSTRAINT "PlanFinancialData_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "BudgetCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFinancialData" ADD CONSTRAINT "PlanFinancialData_fiscal_year_fkey" FOREIGN KEY ("fiscal_year") REFERENCES "FiscalYear"("fiscal_year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementItem" ADD CONSTRAINT "ProcurementItem_requesting_dept_id_fkey" FOREIGN KEY ("requesting_dept_id") REFERENCES "BudgetCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementItem" ADD CONSTRAINT "ProcurementItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementItem" ADD CONSTRAINT "ProcurementItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyActualEntry" ADD CONSTRAINT "MonthlyActualEntry_procurement_item_id_fkey" FOREIGN KEY ("procurement_item_id") REFERENCES "ProcurementItem"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyActualEntry" ADD CONSTRAINT "MonthlyActualEntry_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "BudgetCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyActualEntry" ADD CONSTRAINT "MonthlyActualEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyActualEntry" ADD CONSTRAINT "MonthlyActualEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;
