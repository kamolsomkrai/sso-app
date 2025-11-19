import { KpiMetric } from "./dashboard";

export type DrillLevel = "L1" | "L2" | "L3" | "L4" | "L5";

export interface DrillDownRow {
  id: string;
  name: string;
  code?: string; // Category code or Item code
  level: DrillLevel;
  hasChildren: boolean; // To show "expand" icon

  // Financials
  currentYear: {
    plan: number;
    actual: number;
    variance: number;
    variancePercent: number;
    status: "success" | "warning" | "danger";
  };

  // Historical Context (for sparklines/trends)
  history: {
    lastYearActual: number;
    twoYearsAgoActual: number;
    trend: number[]; // Monthly data for sparkline
  };
}

export interface DrillDownResponse {
  parent: {
    id: string;
    name: string;
    level: number;
  } | null;
  items: DrillDownRow[];
  breadcrumbs: { id: string; name: string; level: number }[];
}
