import { Decimal } from "@prisma/client/runtime/library";

// Unified Timeframe Enum
export type TimeFrame = "monthly" | "quarterly" | "annual";

// KPIData Interface
export interface KpiMetric {
  label: string;
  amount: number;
  target: number;
  variance: number;
  variancePercent: number;
  trend: "up" | "down" | "neutral";
  status: "success" | "warning" | "danger"; // Semantic colors
}

// L1 Executive Summary
export interface DashboardSummary {
  fiscalYear: number;
  totalRevenue: KpiMetric;
  totalExpense: KpiMetric;
  netResult: KpiMetric;
  lastUpdated: Date;
}

// Chart Data Structure
export interface ChartDataPoint {
  name: string; // Month or Quarter name
  revenue: number;
  expense: number;
  target?: number;
}
