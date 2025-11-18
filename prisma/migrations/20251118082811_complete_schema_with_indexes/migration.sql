/*
  Warnings:

  - You are about to drop the `BudgetCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MonthlyActualEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanFinancialData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcurementItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "ProcurementType" AS ENUM ('BIDDING', 'QUOTATION', 'DIRECT_PURCHASE', 'EMERGENCY');

-- DropForeignKey
ALTER TABLE "public"."BudgetCategory" DROP CONSTRAINT "BudgetCategory_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyActualEntry" DROP CONSTRAINT "MonthlyActualEntry_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyActualEntry" DROP CONSTRAINT "MonthlyActualEntry_procurementItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MonthlyActualEntry" DROP CONSTRAINT "MonthlyActualEntry_recordedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanFinancialData" DROP CONSTRAINT "PlanFinancialData_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanFinancialData" DROP CONSTRAINT "PlanFinancialData_procurementItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcurementItem" DROP CONSTRAINT "ProcurementItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcurementItem" DROP CONSTRAINT "ProcurementItem_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProcurementItem" DROP CONSTRAINT "ProcurementItem_updatedById_fkey";

-- DropTable
DROP TABLE "public"."BudgetCategory";

-- DropTable
DROP TABLE "public"."MonthlyActualEntry";

-- DropTable
DROP TABLE "public"."PlanFinancialData";

-- DropTable
DROP TABLE "public"."ProcurementItem";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT,
    "cid" VARCHAR(13),
    "email" TEXT,
    "name" TEXT,
    "first_name_th" TEXT,
    "last_name_th" TEXT,
    "first_name_en" TEXT,
    "last_name_en" TEXT,
    "title_th" TEXT,
    "title_en" TEXT,
    "mobile_number" VARCHAR(10),
    "org_business_id" TEXT,
    "org_hcode" VARCHAR(9),
    "org_hname_th" TEXT,
    "org_position" TEXT,
    "org_position_type" TEXT,
    "ial_level" DOUBLE PRECISION,
    "is_hr_admin" BOOLEAN DEFAULT false,
    "is_director" BOOLEAN DEFAULT false,
    "role" "UserRole" NOT NULL,
    "clerk_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" TEXT NOT NULL,
    "category_code" VARCHAR(20) NOT NULL,
    "category_name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "category_type" "CategoryType" NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_items" (
    "id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "unit_name" VARCHAR(20) NOT NULL,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "procurement_type" "ProcurementType" NOT NULL,
    "specifications" TEXT,
    "min_stock_level" INTEGER DEFAULT 0,
    "max_stock_level" INTEGER,
    "unit_price" DECIMAL(10,2),
    "last_purchase_price" DECIMAL(10,2),
    "category_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_financial_data" (
    "id" TEXT NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "plan_amount" DECIMAL(15,2) NOT NULL,
    "category_id" TEXT,
    "procurement_item_id" TEXT,
    "plan_version" INTEGER DEFAULT 1,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_financial_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_actual_entries" (
    "id" TEXT NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "quantity" INTEGER,
    "notes" TEXT,
    "category_id" TEXT NOT NULL,
    "procurement_item_id" TEXT,
    "recorded_by_id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_actual_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "description" TEXT,
    "performed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "procurement_item_id" TEXT,
    "monthly_entry_id" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_id_key" ON "users"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_provider_id_idx" ON "users"("provider_id");

-- CreateIndex
CREATE INDEX "users_cid_idx" ON "users"("cid");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_org_hcode_idx" ON "users"("org_hcode");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "users"("last_login_at");

-- CreateIndex
CREATE UNIQUE INDEX "budget_categories_category_code_key" ON "budget_categories"("category_code");

-- CreateIndex
CREATE INDEX "budget_categories_category_code_idx" ON "budget_categories"("category_code");

-- CreateIndex
CREATE INDEX "budget_categories_category_type_idx" ON "budget_categories"("category_type");

-- CreateIndex
CREATE INDEX "budget_categories_level_idx" ON "budget_categories"("level");

-- CreateIndex
CREATE INDEX "budget_categories_parent_id_idx" ON "budget_categories"("parent_id");

-- CreateIndex
CREATE INDEX "budget_categories_category_code_level_idx" ON "budget_categories"("category_code", "level");

-- CreateIndex
CREATE INDEX "budget_categories_category_type_level_idx" ON "budget_categories"("category_type", "level");

-- CreateIndex
CREATE INDEX "procurement_items_item_name_idx" ON "procurement_items"("item_name");

-- CreateIndex
CREATE INDEX "procurement_items_category_id_idx" ON "procurement_items"("category_id");

-- CreateIndex
CREATE INDEX "procurement_items_procurement_type_idx" ON "procurement_items"("procurement_type");

-- CreateIndex
CREATE INDEX "procurement_items_inventory_idx" ON "procurement_items"("inventory");

-- CreateIndex
CREATE INDEX "procurement_items_created_by_id_idx" ON "procurement_items"("created_by_id");

-- CreateIndex
CREATE INDEX "procurement_items_updated_at_idx" ON "procurement_items"("updated_at");

-- CreateIndex
CREATE INDEX "plan_financial_data_fiscal_year_idx" ON "plan_financial_data"("fiscal_year");

-- CreateIndex
CREATE INDEX "plan_financial_data_category_id_idx" ON "plan_financial_data"("category_id");

-- CreateIndex
CREATE INDEX "plan_financial_data_procurement_item_id_idx" ON "plan_financial_data"("procurement_item_id");

-- CreateIndex
CREATE INDEX "plan_financial_data_fiscal_year_category_id_idx" ON "plan_financial_data"("fiscal_year", "category_id");

-- CreateIndex
CREATE INDEX "plan_financial_data_fiscal_year_procurement_item_id_idx" ON "plan_financial_data"("fiscal_year", "procurement_item_id");

-- CreateIndex
CREATE INDEX "plan_financial_data_is_approved_idx" ON "plan_financial_data"("is_approved");

-- CreateIndex
CREATE INDEX "plan_financial_data_created_at_idx" ON "plan_financial_data"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "plan_financial_data_fiscal_year_category_id_procurement_ite_key" ON "plan_financial_data"("fiscal_year", "category_id", "procurement_item_id", "plan_version");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_fiscal_year_idx" ON "monthly_actual_entries"("fiscal_year");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_month_idx" ON "monthly_actual_entries"("month");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_fiscal_year_month_idx" ON "monthly_actual_entries"("fiscal_year", "month");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_category_id_idx" ON "monthly_actual_entries"("category_id");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_procurement_item_id_idx" ON "monthly_actual_entries"("procurement_item_id");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_recorded_by_id_idx" ON "monthly_actual_entries"("recorded_by_id");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_created_by_id_idx" ON "monthly_actual_entries"("created_by_id");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_entry_date_idx" ON "monthly_actual_entries"("entry_date");

-- CreateIndex
CREATE INDEX "monthly_actual_entries_created_at_idx" ON "monthly_actual_entries"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_actual_entries_fiscal_year_month_category_id_procur_key" ON "monthly_actual_entries"("fiscal_year", "month", "category_id", "procurement_item_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs"("entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_performed_by_id_idx" ON "audit_logs"("performed_by_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "documents_procurement_item_id_idx" ON "documents"("procurement_item_id");

-- CreateIndex
CREATE INDEX "documents_monthly_entry_id_idx" ON "documents"("monthly_entry_id");

-- CreateIndex
CREATE INDEX "documents_uploaded_by_id_idx" ON "documents"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "documents_created_at_idx" ON "documents"("created_at");

-- AddForeignKey
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "budget_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_financial_data" ADD CONSTRAINT "plan_financial_data_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_financial_data" ADD CONSTRAINT "plan_financial_data_procurement_item_id_fkey" FOREIGN KEY ("procurement_item_id") REFERENCES "procurement_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_actual_entries" ADD CONSTRAINT "monthly_actual_entries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_actual_entries" ADD CONSTRAINT "monthly_actual_entries_procurement_item_id_fkey" FOREIGN KEY ("procurement_item_id") REFERENCES "procurement_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_actual_entries" ADD CONSTRAINT "monthly_actual_entries_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_actual_entries" ADD CONSTRAINT "monthly_actual_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_procurement_item_id_fkey" FOREIGN KEY ("procurement_item_id") REFERENCES "procurement_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_monthly_entry_id_fkey" FOREIGN KEY ("monthly_entry_id") REFERENCES "monthly_actual_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
