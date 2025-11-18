// lib/types.ts

// Type สำหรับข้อมูลใน Combobox
export type ComboboxData = {
  value: string; // ID
  label: string; // Name
};

// Types สำหรับ API: /api/dashboard/overview
export type L1KpiData = {
  plan: number;
  actual: number;
  variance: number; // actual - plan
  variancePercent: number; // (variance / plan) * 100
};

export type FinancialSummary = {
  totalRevenue: L1KpiData;
  totalExpense: L1KpiData;
  netProfitLoss: L1KpiData;
  // ... (เพิ่ม KPI อื่นๆ ตามสูตร)
};

export type RevenueData = {
  monthly: { month: number; revenue: number; expense: number }[];
  quarterly: { quarter: number; revenue: number; expense: number }[];
};

export type OverviewApiResponse = {
  summary: FinancialSummary;
  revenueData: RevenueData;
};

// Types สำหรับ API: /api/dashboard/expense-drilldown (L2)
export type L2CategoryData = {
  id: string;
  name: string;
  icon: string | null;
  plan: number;
  actual: number;
  itemCount: number; // จำนวน L3-L4-Items ภายใต้ L2 นี้
  history: { year: number; actual: number }[];
};

// Types สำหรับ API: /api/dashboard/l3-drilldown (L3)
export type L3CategoryData = {
  id: string;
  name: string;
  plan: number;
  actual: number;
  itemCount: number; // จำนวน L4-Items ภายใต้ L3 นี้
  history: { year: number; actual: number }[];
};

// Types สำหรับ API: /api/dashboard/l4-items (L4)
export type L4ItemData = {
  id: string;
  name: string;
  unit: string;
  inventory: number; // ยอดคงคลัง
  planCurrentYear: number; // แผนปีปัจจุบัน
  actualCurrentYear: number; // ใช้จริงปีปัจจุบัน
  actualLastYear: number; // ใช้จริงปีก่อน
  actual2YearsAgo: number; // ใช้จริง 2 ปีก่อน
};
