/*
  Warnings:

  - You are about to drop the `budget_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `monthly_actual_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan_financial_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procurement_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."budget_categories" DROP CONSTRAINT "budget_categories_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."monthly_actual_entries" DROP CONSTRAINT "monthly_actual_entries_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."monthly_actual_entries" DROP CONSTRAINT "monthly_actual_entries_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."monthly_actual_entries" DROP CONSTRAINT "monthly_actual_entries_procurementItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_financial_data" DROP CONSTRAINT "plan_financial_data_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_financial_data" DROP CONSTRAINT "plan_financial_data_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_financial_data" DROP CONSTRAINT "plan_financial_data_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."procurement_items" DROP CONSTRAINT "procurement_items_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."procurement_items" DROP CONSTRAINT "procurement_items_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."procurement_items" DROP CONSTRAINT "procurement_items_updatedById_fkey";

-- DropTable
DROP TABLE "public"."budget_categories";

-- DropTable
DROP TABLE "public"."monthly_actual_entries";

-- DropTable
DROP TABLE "public"."plan_financial_data";

-- DropTable
DROP TABLE "public"."procurement_items";

-- DropTable
DROP TABLE "public"."users";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "categoryType" TEXT NOT NULL,
    "icon" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementItem" (
    "id" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "procurementType" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFinancialData" (
    "id" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "planAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "procurementItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanFinancialData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyActualEntry" (
    "id" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER,
    "notes" TEXT,
    "categoryId" TEXT NOT NULL,
    "procurementItemId" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyActualEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_categoryCode_key" ON "BudgetCategory"("categoryCode");

-- CreateIndex
CREATE INDEX "BudgetCategory_parentId_idx" ON "BudgetCategory"("parentId");

-- CreateIndex
CREATE INDEX "ProcurementItem_categoryId_idx" ON "ProcurementItem"("categoryId");

-- CreateIndex
CREATE INDEX "ProcurementItem_createdById_idx" ON "ProcurementItem"("createdById");

-- CreateIndex
CREATE INDEX "ProcurementItem_updatedById_idx" ON "ProcurementItem"("updatedById");

-- CreateIndex
CREATE INDEX "PlanFinancialData_categoryId_idx" ON "PlanFinancialData"("categoryId");

-- CreateIndex
CREATE INDEX "PlanFinancialData_procurementItemId_idx" ON "PlanFinancialData"("procurementItemId");

-- CreateIndex
CREATE INDEX "MonthlyActualEntry_categoryId_idx" ON "MonthlyActualEntry"("categoryId");

-- CreateIndex
CREATE INDEX "MonthlyActualEntry_procurementItemId_idx" ON "MonthlyActualEntry"("procurementItemId");

-- CreateIndex
CREATE INDEX "MonthlyActualEntry_recordedById_idx" ON "MonthlyActualEntry"("recordedById");

-- CreateIndex
CREATE INDEX "MonthlyActualEntry_fiscalYear_month_idx" ON "MonthlyActualEntry"("fiscalYear", "month");

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BudgetCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProcurementItem" ADD CONSTRAINT "ProcurementItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BudgetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementItem" ADD CONSTRAINT "ProcurementItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementItem" ADD CONSTRAINT "ProcurementItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFinancialData" ADD CONSTRAINT "PlanFinancialData_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BudgetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFinancialData" ADD CONSTRAINT "PlanFinancialData_procurementItemId_fkey" FOREIGN KEY ("procurementItemId") REFERENCES "ProcurementItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyActualEntry" ADD CONSTRAINT "MonthlyActualEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BudgetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyActualEntry" ADD CONSTRAINT "MonthlyActualEntry_procurementItemId_fkey" FOREIGN KEY ("procurementItemId") REFERENCES "ProcurementItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyActualEntry" ADD CONSTRAINT "MonthlyActualEntry_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
