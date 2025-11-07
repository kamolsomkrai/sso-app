// app/(app)/dashboard/cross-filter/page.tsx

'use client';

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // [cite: 162]
import { MetricCard } from "@/components/metric-card";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { DepartmentDonutChart } from "@/components/charts/department-donut-chart";
import { CategoryExpenseTable } from "@/components/tables/category-expense-table";
import { allExpenses, KpiData, Expense } from "@/lib/mock-data";
import { DollarSign, PiggyBank, Users, X } from "lucide-react"; // 
import { formatCurrency } from "@/lib/utils"; // [cite: 165]

// --- Helper Functions ---
const calculateDashboardData = (
  expenses: Expense[],
): { kpis: KpiData; deptData: any[]; categoryData: any[] } => {
  let totalExpense = 0;
  const deptMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();

  expenses.forEach((item) => {
    totalExpense += item.amount;
    deptMap.set(item.department, (deptMap.get(item.department) || 0) + item.amount);
    categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + item.amount);
  });

  const topDept = [...deptMap.entries()].sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
  const deptData = [...deptMap.entries()].map(([name, value]) => ({ name, value }));
  const categoryData = [...categoryMap.entries()]
    .map(([name, value]) => ({ name, value, total: totalExpense }))
    .sort((a, b) => b.value - a.value);

  const kpis: KpiData = {
    totalExpense: totalExpense,
    budgetVariance: 5000000 - totalExpense, // สมมติ Budget 5M
    topSpendingDept: topDept[0],
  };

  return { kpis, deptData, categoryData };
};

const getMonthlyChartData = (expenses: Expense[]) => {
  const monthMap = new Map<string, number>();
  // ใช้วันที่ของ mock data (ต.ค. 2024 - มี.ค. 2025)
  const allMonths = ["2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03"];
  allMonths.forEach(month => monthMap.set(month, 0));

  expenses.forEach((item) => {
    const month = item.date.substring(0, 7); // "YYYY-MM"
    monthMap.set(month, (monthMap.get(month) || 0) + item.amount);
  });
  return [...monthMap.entries()].map(([name, value]) => ({ name, value }));
};

// --- Page Component ---
export default function CrossFilterDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((item) => {
      const monthMatch = !selectedMonth || item.date.startsWith(selectedMonth);
      const deptMatch = !selectedDept || item.department === selectedDept;
      return monthMatch && deptMatch;
    });
  }, [selectedMonth, selectedDept]);

  const { kpis, deptData, categoryData } = useMemo(
    () => calculateDashboardData(filteredExpenses),
    [filteredExpenses],
  );

  const monthlyChartData = useMemo(() => getMonthlyChartData(
    // กราฟแท่งควรแสดงข้อมูลที่กรองโดย Department แต่แสดงทุกเดือน
    allExpenses.filter(item => !selectedDept || item.department === selectedDept)
  ), [selectedDept]);

  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedDept(null);
  };

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Executive Expense Hub</h1>
          <p className="text-gray-500">
            คลิกที่ชาร์ตเพื่อกรองข้อมูล Dashboard ทั้งหมด
          </p>
        </div>
        <Button onClick={clearFilters} variant="outline" className="mt-4 md:mt-0">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Expense"
          value={formatCurrency(kpis.totalExpense)}
          change={`Budget ${formatCurrency(5000000)}`}
          icon={DollarSign}
        />
        <MetricCard
          title="Budget Variance"
          value={formatCurrency(kpis.budgetVariance)}
          changeType={kpis.budgetVariance > 0 ? "positive" : "negative"}
          change={kpis.budgetVariance > 0 ? "Under Budget" : "Over Budget"}
          icon={PiggyBank}
        />
        <MetricCard
          title="Top Spending Dept"
          value={kpis.topSpendingDept}
          change={`All selected period`}
          icon={Users}
        />
      </div>

      {/* --- Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Monthly Expense Trend (Click to filter)
          </h3>
          <MonthlyTrendChart
            data={monthlyChartData}
            selectedMonth={selectedMonth}
            onMonthSelect={setSelectedMonth}
          />
        </Card>
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Department Breakdown (Click to filter)
          </h3>
          <DepartmentDonutChart
            data={deptData}
            selectedDept={selectedDept}
            onDeptSelect={setSelectedDept}
          />
        </Card>
      </div>

      {/* --- Detail Table --- */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Expense Category Breakdown (Reacts to filters)
        </h3>
        <CategoryExpenseTable data={categoryData} />
      </Card>
    </div>
  );
}