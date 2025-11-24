// lib/types/dashboard.ts
export type StatusType = "success" | "warning" | "danger";
export type DrillLevel = "L1" | "L2" | "L3" | "L4" | "L5";
export interface KpiMetric {
  label: string;
  amount: number;
  target: number;
  variance: number;
  variancePercent: number;
  trend: "up" | "down" | "neutral";
  status: StatusType;
}

export interface ChartDataPoint {
  name: string; // "Jan", "Feb" etc.
  revenue: number;
  expense: number;
  planRevenue: number;
  planExpense: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface QuarterlyDataPoint {
  name: string; // "Q1", "Q2", etc.
  revenue: number;
  expense: number;
  planRevenue: number;
  planExpense: number;
}

export interface TreemapNode {
  name: string;
  size: number; // Plan Amount
  value: number; // Actual Amount
  utilization: number; // %
  children?: TreemapNode[];
}

export interface HeatmapDataPoint {
  id: string;
  category: string;
  data: {
    x: string; // Month
    y: number; // Variance %
    value: number; // Actual Amount
  }[];
}

export interface DashboardSummary {
  fiscalYear: number;
  period: 'month' | 'quarter';
  level: number;
  lastUpdated: Date;
  kpis: {
    totalRevenue: KpiMetric;
    totalExpense: KpiMetric;
    netResult: KpiMetric;
  };
  charts: {
    monthlyTrend: ChartDataPoint[] | QuarterlyDataPoint[];
    expenseBreakdown: CategoryDataPoint[];
    revenueBreakdown: CategoryDataPoint[];
  };
}

export interface DrillDownRow {
  id: string;
  name: string;
  code?: string;
  level: DrillLevel;
  hasChildren: boolean;

  // Financials
  financials: {
    // อดีต
    lastYearActual: number;

    // ปัจจุบัน
    currentPlan: number;
    currentActual: number;
    variance: number;
    variancePercent: number;
    status: StatusType;

    // อนาคต
    nextYearPlan: number;
  };
}
