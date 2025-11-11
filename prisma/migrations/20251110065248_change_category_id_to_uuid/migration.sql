/*
  Warnings:

  - The primary key for the `BudgetCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."BudgetCategory" DROP CONSTRAINT "BudgetCategory_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyActualEntry" DROP CONSTRAINT "MonthlyActualEntry_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanFinancialData" DROP CONSTRAINT "PlanFinancialData_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcurementItem" DROP CONSTRAINT "ProcurementItem_requesting_dept_id_fkey";

-- AlterTable
ALTER TABLE "BudgetCategory" DROP CONSTRAINT "BudgetCategory_pkey",
ALTER COLUMN "category_id" DROP DEFAULT,
ALTER COLUMN "category_id" SET DATA TYPE TEXT,
ALTER COLUMN "parent_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("category_id");
DROP SEQUENCE "BudgetCategory_category_id_seq";

-- AlterTable
ALTER TABLE "MonthlyActualEntry" ALTER COLUMN "category_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PlanFinancialData" ALTER COLUMN "category_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ProcurementItem" ALTER COLUMN "requesting_dept_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "BudgetCategory"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFinancialData" ADD CONSTRAINT "PlanFinancialData_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "BudgetCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementItem" ADD CONSTRAINT "ProcurementItem_requesting_dept_id_fkey" FOREIGN KEY ("requesting_dept_id") REFERENCES "BudgetCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyActualEntry" ADD CONSTRAINT "MonthlyActualEntry_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "BudgetCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
