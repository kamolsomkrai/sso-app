-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DEPARTMENT_HEAD', 'WORKGROUP_HEAD', 'OPERATOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "departmentId" TEXT,
    "workgroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workgroups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workgroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_items" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "workgroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_plan_entries" (
    "id" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "q1Quantity" INTEGER NOT NULL DEFAULT 0,
    "q2Quantity" INTEGER NOT NULL DEFAULT 0,
    "q3Quantity" INTEGER NOT NULL DEFAULT 0,
    "q4Quantity" INTEGER NOT NULL DEFAULT 0,
    "q1Target" INTEGER NOT NULL DEFAULT 0,
    "q2Target" INTEGER NOT NULL DEFAULT 0,
    "q3Target" INTEGER NOT NULL DEFAULT 0,
    "q4Target" INTEGER NOT NULL DEFAULT 0,
    "janTarget" INTEGER NOT NULL DEFAULT 0,
    "febTarget" INTEGER NOT NULL DEFAULT 0,
    "marTarget" INTEGER NOT NULL DEFAULT 0,
    "aprTarget" INTEGER NOT NULL DEFAULT 0,
    "mayTarget" INTEGER NOT NULL DEFAULT 0,
    "junTarget" INTEGER NOT NULL DEFAULT 0,
    "julTarget" INTEGER NOT NULL DEFAULT 0,
    "augTarget" INTEGER NOT NULL DEFAULT 0,
    "sepTarget" INTEGER NOT NULL DEFAULT 0,
    "octTarget" INTEGER NOT NULL DEFAULT 0,
    "novTarget" INTEGER NOT NULL DEFAULT 0,
    "decTarget" INTEGER NOT NULL DEFAULT 0,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "totalTarget" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "achievementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "itemId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_plan_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_years" (
    "id" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "yearName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "totalBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "allocatedBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remainingBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "janBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "febBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "marBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "aprBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "mayBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "junBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "julBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "augBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sepBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "octBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "novBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "decBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "budgetYearId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemCode" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    "previousYearActual" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currentYearBudget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currentYearEstimate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "q1BudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "q2BudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "q3BudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "q4BudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "janBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "febBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "marBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "aprBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "mayBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "junBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "julBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "augBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sepBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "octBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "novBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "decBudgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_progress" (
    "id" TEXT NOT NULL,
    "planEntryId" TEXT,
    "budgetItemId" TEXT,
    "fiscalYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "monthName" TEXT NOT NULL,
    "targetAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "actualAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quarterly_summaries" (
    "id" TEXT NOT NULL,
    "budgetYearId" TEXT NOT NULL,
    "departmentId" TEXT,
    "workgroupId" TEXT,
    "fiscalYear" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "procurementTarget" INTEGER NOT NULL DEFAULT 0,
    "procurementActual" INTEGER NOT NULL DEFAULT 0,
    "budgetTarget" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "budgetActual" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "achievementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetUtilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quarterly_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_allocations" (
    "id" TEXT NOT NULL,
    "budgetItemId" TEXT NOT NULL,
    "departmentId" TEXT,
    "workgroupId" TEXT,
    "allocatedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "usedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "q1Target" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "q2Target" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "q3Target" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "q4Target" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "allocationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fiscalYear" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- CreateIndex
CREATE INDEX "users_workgroupId_idx" ON "users"("workgroupId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE INDEX "workgroups_departmentId_idx" ON "workgroups"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "workgroups_departmentId_name_key" ON "workgroups"("departmentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_items_itemCode_key" ON "procurement_items"("itemCode");

-- CreateIndex
CREATE INDEX "procurement_items_workgroupId_idx" ON "procurement_items"("workgroupId");

-- CreateIndex
CREATE INDEX "procurement_items_itemCode_idx" ON "procurement_items"("itemCode");

-- CreateIndex
CREATE INDEX "procurement_items_isActive_idx" ON "procurement_items"("isActive");

-- CreateIndex
CREATE INDEX "procurement_plan_entries_fiscalYear_idx" ON "procurement_plan_entries"("fiscalYear");

-- CreateIndex
CREATE INDEX "procurement_plan_entries_itemId_idx" ON "procurement_plan_entries"("itemId");

-- CreateIndex
CREATE INDEX "procurement_plan_entries_createdById_idx" ON "procurement_plan_entries"("createdById");

-- CreateIndex
CREATE INDEX "procurement_plan_entries_createdAt_idx" ON "procurement_plan_entries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_plan_entries_fiscalYear_itemId_createdById_key" ON "procurement_plan_entries"("fiscalYear", "itemId", "createdById");

-- CreateIndex
CREATE UNIQUE INDEX "budget_years_fiscalYear_key" ON "budget_years"("fiscalYear");

-- CreateIndex
CREATE INDEX "budget_years_fiscalYear_idx" ON "budget_years"("fiscalYear");

-- CreateIndex
CREATE INDEX "budget_years_isActive_idx" ON "budget_years"("isActive");

-- CreateIndex
CREATE INDEX "budget_items_budgetYearId_idx" ON "budget_items"("budgetYearId");

-- CreateIndex
CREATE INDEX "budget_items_parentId_idx" ON "budget_items"("parentId");

-- CreateIndex
CREATE INDEX "budget_items_level_idx" ON "budget_items"("level");

-- CreateIndex
CREATE INDEX "budget_items_order_idx" ON "budget_items"("order");

-- CreateIndex
CREATE UNIQUE INDEX "budget_items_budgetYearId_itemName_parentId_key" ON "budget_items"("budgetYearId", "itemName", "parentId");

-- CreateIndex
CREATE INDEX "monthly_progress_fiscalYear_idx" ON "monthly_progress"("fiscalYear");

-- CreateIndex
CREATE INDEX "monthly_progress_month_idx" ON "monthly_progress"("month");

-- CreateIndex
CREATE INDEX "monthly_progress_status_idx" ON "monthly_progress"("status");

-- CreateIndex
CREATE INDEX "monthly_progress_createdAt_idx" ON "monthly_progress"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_progress_planEntryId_fiscalYear_month_key" ON "monthly_progress"("planEntryId", "fiscalYear", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_progress_budgetItemId_fiscalYear_month_key" ON "monthly_progress"("budgetItemId", "fiscalYear", "month");

-- CreateIndex
CREATE INDEX "quarterly_summaries_fiscalYear_idx" ON "quarterly_summaries"("fiscalYear");

-- CreateIndex
CREATE INDEX "quarterly_summaries_quarter_idx" ON "quarterly_summaries"("quarter");

-- CreateIndex
CREATE INDEX "quarterly_summaries_departmentId_idx" ON "quarterly_summaries"("departmentId");

-- CreateIndex
CREATE INDEX "quarterly_summaries_workgroupId_idx" ON "quarterly_summaries"("workgroupId");

-- CreateIndex
CREATE UNIQUE INDEX "quarterly_summaries_fiscalYear_quarter_departmentId_workgro_key" ON "quarterly_summaries"("fiscalYear", "quarter", "departmentId", "workgroupId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_idx" ON "audit_logs"("tableName");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "budget_allocations_budgetItemId_idx" ON "budget_allocations"("budgetItemId");

-- CreateIndex
CREATE INDEX "budget_allocations_departmentId_idx" ON "budget_allocations"("departmentId");

-- CreateIndex
CREATE INDEX "budget_allocations_workgroupId_idx" ON "budget_allocations"("workgroupId");

-- CreateIndex
CREATE INDEX "budget_allocations_fiscalYear_idx" ON "budget_allocations"("fiscalYear");

-- CreateIndex
CREATE INDEX "budget_allocations_allocationDate_idx" ON "budget_allocations"("allocationDate");

-- CreateIndex
CREATE UNIQUE INDEX "budget_allocations_budgetItemId_departmentId_workgroupId_fi_key" ON "budget_allocations"("budgetItemId", "departmentId", "workgroupId", "fiscalYear");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "workgroups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workgroups" ADD CONSTRAINT "workgroups_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "workgroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_plan_entries" ADD CONSTRAINT "procurement_plan_entries_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "procurement_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_plan_entries" ADD CONSTRAINT "procurement_plan_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_plan_entries" ADD CONSTRAINT "procurement_plan_entries_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "budget_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "budget_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_progress" ADD CONSTRAINT "monthly_progress_planEntryId_fkey" FOREIGN KEY ("planEntryId") REFERENCES "procurement_plan_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_progress" ADD CONSTRAINT "monthly_progress_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "budget_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_progress" ADD CONSTRAINT "monthly_progress_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarterly_summaries" ADD CONSTRAINT "quarterly_summaries_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "budget_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarterly_summaries" ADD CONSTRAINT "quarterly_summaries_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarterly_summaries" ADD CONSTRAINT "quarterly_summaries_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "workgroups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarterly_summaries" ADD CONSTRAINT "quarterly_summaries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "budget_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "workgroups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
