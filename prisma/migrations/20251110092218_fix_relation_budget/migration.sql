/*
  Warnings:

  - Added the required column `category_id` to the `ProcurementItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProcurementItem" ADD COLUMN     "category_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProcurementItem" ADD CONSTRAINT "ProcurementItem_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "BudgetCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
