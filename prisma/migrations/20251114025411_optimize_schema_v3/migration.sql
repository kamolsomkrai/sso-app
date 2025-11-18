/*
  Warnings:

  - You are about to drop the `BudgetCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FiscalYear` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MonthlyActualEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanFinancialData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcurementItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BudgetCategory" DROP CONSTRAINT "BudgetCategory_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyActualEntry" DROP CONSTRAINT "MonthlyActualEntry_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyActualEntry" DROP CONSTRAINT "MonthlyActualEntry_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyActualEntry" DROP CONSTRAINT "MonthlyActualEntry_procurement_item_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyActualEntry" DROP CONSTRAINT "MonthlyActualEntry_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanFinancialData" DROP CONSTRAINT "PlanFinancialData_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanFinancialData" DROP CONSTRAINT "PlanFinancialData_fiscal_year_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcurementItem" DROP CONSTRAINT "ProcurementItem_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcurementItem" DROP CONSTRAINT "ProcurementItem_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcurementItem" DROP CONSTRAINT "ProcurementItem_requesting_dept_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcurementItem" DROP CONSTRAINT "ProcurementItem_updatedById_fkey";

-- DropTable
DROP TABLE "public"."BudgetCategory";

-- DropTable
DROP TABLE "public"."FiscalYear";

-- DropTable
DROP TABLE "public"."MonthlyActualEntry";

-- DropTable
DROP TABLE "public"."PlanFinancialData";

-- DropTable
DROP TABLE "public"."ProcurementItem";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."CategoryType";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "categoryId" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "categoryType" TEXT NOT NULL,
    "icon" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "procurement_items" (
    "itemId" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "procurementCode" TEXT,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "planAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_items_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "plan_financial_data" (
    "id" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "planAmount" DECIMAL(65,30) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_financial_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_actual_entries" (
    "id" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "procurementItemId" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_actual_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_providerId_key" ON "users"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_categories_categoryCode_key" ON "budget_categories"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_items_procurementCode_key" ON "procurement_items"("procurementCode");

-- CreateIndex
CREATE UNIQUE INDEX "plan_financial_data_fiscalYear_categoryId_key" ON "plan_financial_data"("fiscalYear", "categoryId");

-- AddForeignKey
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "budget_categories"("categoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "budget_categories"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_financial_data" ADD CONSTRAINT "plan_financial_data_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "budget_categories"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_financial_data" ADD CONSTRAINT "plan_financial_data_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_financial_data" ADD CONSTRAINT "plan_financial_data_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_actual_entries" ADD CONSTRAINT "monthly_actual_entries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "budget_categories"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_actual_entries" ADD CONSTRAINT "monthly_actual_entries_procurementItemId_fkey" FOREIGN KEY ("procurementItemId") REFERENCES "procurement_items"("itemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_actual_entries" ADD CONSTRAINT "monthly_actual_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("providerId") ON DELETE RESTRICT ON UPDATE CASCADE;
