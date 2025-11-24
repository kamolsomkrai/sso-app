-- CreateEnum
CREATE TYPE "KpiCalcLogic" AS ENUM ('GTE', 'LTE', 'EQ0', 'EQT');

-- CreateEnum
CREATE TYPE "KpiStatus" AS ENUM ('PASSED', 'FAILED', 'PENDING', 'ERROR');

-- CreateTable
CREATE TABLE "kpi_indicators" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_strategies" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_plans" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_objectives" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "strategy_id" TEXT,
    "plan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_master" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" TEXT NOT NULL,
    "target_text" TEXT,
    "five_year_target_text" TEXT,
    "five_year_target_value" DECIMAL(10,2),
    "five_year_plan_period" VARCHAR(20),
    "calc_logic" "KpiCalcLogic" NOT NULL DEFAULT 'GTE',
    "owner" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "cumulative_value" DECIMAL(10,2),
    "objective_id" TEXT NOT NULL,
    "indicator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_quarterly_data" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" SMALLINT NOT NULL,
    "quarterly_target" TEXT,
    "result" TEXT,
    "status" "KpiStatus" NOT NULL DEFAULT 'PENDING',
    "kpi_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_quarterly_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_annual_data" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "year_target" DECIMAL(10,2),
    "year_result" DECIMAL(10,2),
    "kpi_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_annual_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kpi_indicators_code_key" ON "kpi_indicators"("code");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_strategies_code_key" ON "kpi_strategies"("code");

-- CreateIndex
CREATE INDEX "kpi_strategies_code_idx" ON "kpi_strategies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_plans_code_key" ON "kpi_plans"("code");

-- CreateIndex
CREATE INDEX "kpi_plans_strategy_id_idx" ON "kpi_plans"("strategy_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_objectives_code_key" ON "kpi_objectives"("code");

-- CreateIndex
CREATE INDEX "kpi_objectives_strategy_id_idx" ON "kpi_objectives"("strategy_id");

-- CreateIndex
CREATE INDEX "kpi_objectives_plan_id_idx" ON "kpi_objectives"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_master_code_key" ON "kpi_master"("code");

-- CreateIndex
CREATE INDEX "kpi_master_code_idx" ON "kpi_master"("code");

-- CreateIndex
CREATE INDEX "kpi_master_objective_id_idx" ON "kpi_master"("objective_id");

-- CreateIndex
CREATE INDEX "kpi_master_indicator_id_idx" ON "kpi_master"("indicator_id");

-- CreateIndex
CREATE INDEX "kpi_master_is_active_idx" ON "kpi_master"("is_active");

-- CreateIndex
CREATE INDEX "kpi_quarterly_data_kpi_id_idx" ON "kpi_quarterly_data"("kpi_id");

-- CreateIndex
CREATE INDEX "kpi_quarterly_data_year_idx" ON "kpi_quarterly_data"("year");

-- CreateIndex
CREATE INDEX "kpi_quarterly_data_status_idx" ON "kpi_quarterly_data"("status");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_quarterly_data_kpi_id_year_quarter_key" ON "kpi_quarterly_data"("kpi_id", "year", "quarter");

-- CreateIndex
CREATE INDEX "kpi_annual_data_kpi_id_idx" ON "kpi_annual_data"("kpi_id");

-- CreateIndex
CREATE INDEX "kpi_annual_data_year_idx" ON "kpi_annual_data"("year");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_annual_data_kpi_id_year_key" ON "kpi_annual_data"("kpi_id", "year");

-- AddForeignKey
ALTER TABLE "kpi_plans" ADD CONSTRAINT "kpi_plans_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "kpi_strategies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_objectives" ADD CONSTRAINT "kpi_objectives_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "kpi_strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_objectives" ADD CONSTRAINT "kpi_objectives_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "kpi_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_master" ADD CONSTRAINT "kpi_master_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "kpi_objectives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_master" ADD CONSTRAINT "kpi_master_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "kpi_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_quarterly_data" ADD CONSTRAINT "kpi_quarterly_data_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_annual_data" ADD CONSTRAINT "kpi_annual_data_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;
