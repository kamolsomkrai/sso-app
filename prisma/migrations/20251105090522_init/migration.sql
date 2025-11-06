/*
  Warnings:

  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budget_allocations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budget_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budget_years` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `monthly_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procurement_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procurement_plan_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quarterly_summaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_configs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workgroups` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EXECUTIVE', 'DEPT_HEAD', 'GROUP_HEAD', 'OPERATOR');

-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('EXPENSE', 'INCOME');

-- DropForeignKey
ALTER TABLE "public"."audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."budget_allocations" DROP CONSTRAINT "budget_allocations_budgetItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."budget_allocations" DROP CONSTRAINT "budget_allocations_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."budget_allocations" DROP CONSTRAINT "budget_allocations_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."budget_allocations" DROP CONSTRAINT "budget_allocations_workgroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."budget_items" DROP CONSTRAINT "budget_items_budgetYearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."budget_items" DROP CONSTRAINT "budget_items_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."monthly_progress" DROP CONSTRAINT "monthly_progress_budgetItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."monthly_progress" DROP CONSTRAINT "monthly_progress_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."monthly_progress" DROP CONSTRAINT "monthly_progress_planEntryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."procurement_items" DROP CONSTRAINT "procurement_items_workgroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."procurement_plan_entries" DROP CONSTRAINT "procurement_plan_entries_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."procurement_plan_entries" DROP CONSTRAINT "procurement_plan_entries_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."procurement_plan_entries" DROP CONSTRAINT "procurement_plan_entries_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."quarterly_summaries" DROP CONSTRAINT "quarterly_summaries_budgetYearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quarterly_summaries" DROP CONSTRAINT "quarterly_summaries_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."quarterly_summaries" DROP CONSTRAINT "quarterly_summaries_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quarterly_summaries" DROP CONSTRAINT "quarterly_summaries_workgroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_workgroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."workgroups" DROP CONSTRAINT "workgroups_departmentId_fkey";

-- DropTable
DROP TABLE "public"."audit_logs";

-- DropTable
DROP TABLE "public"."budget_allocations";

-- DropTable
DROP TABLE "public"."budget_items";

-- DropTable
DROP TABLE "public"."budget_years";

-- DropTable
DROP TABLE "public"."departments";

-- DropTable
DROP TABLE "public"."monthly_progress";

-- DropTable
DROP TABLE "public"."procurement_items";

-- DropTable
DROP TABLE "public"."procurement_plan_entries";

-- DropTable
DROP TABLE "public"."quarterly_summaries";

-- DropTable
DROP TABLE "public"."system_configs";

-- DropTable
DROP TABLE "public"."users";

-- DropTable
DROP TABLE "public"."workgroups";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "departmentId" TEXT,
    "providerId" TEXT NOT NULL DEFAULT 'mockProviderId',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "actualCost" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ExpenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "IncomeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "BudgetType" NOT NULL,
    "departmentId" TEXT,
    "categoryId" TEXT,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarianceNote" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VarianceNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- CreateIndex
CREATE INDEX "ExpenseItem_departmentId_idx" ON "ExpenseItem"("departmentId");

-- CreateIndex
CREATE INDEX "ExpenseItem_categoryId_idx" ON "ExpenseItem"("categoryId");

-- CreateIndex
CREATE INDEX "ExpenseItem_date_idx" ON "ExpenseItem"("date");

-- CreateIndex
CREATE INDEX "IncomeItem_departmentId_idx" ON "IncomeItem"("departmentId");

-- CreateIndex
CREATE INDEX "IncomeItem_date_idx" ON "IncomeItem"("date");

-- CreateIndex
CREATE INDEX "Budget_year_month_type_idx" ON "Budget"("year", "month", "type");

-- CreateIndex
CREATE INDEX "Budget_departmentId_idx" ON "Budget"("departmentId");

-- CreateIndex
CREATE INDEX "Budget_categoryId_idx" ON "Budget"("categoryId");

-- CreateIndex
CREATE INDEX "VarianceNote_year_quarter_idx" ON "VarianceNote"("year", "quarter");

-- CreateIndex
CREATE INDEX "VarianceNote_departmentId_idx" ON "VarianceNote"("departmentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeItem" ADD CONSTRAINT "IncomeItem_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarianceNote" ADD CONSTRAINT "VarianceNote_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarianceNote" ADD CONSTRAINT "VarianceNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
