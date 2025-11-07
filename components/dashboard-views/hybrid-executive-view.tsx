// components/dashboard-views/hybrid-executive-view.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/metric-card';
import { allExpenses, KpiData, Expense } from '@/lib/mock-data'; // ใช้ข้อมูลจาก รพ.ลอง
import { formatCurrency } from '@/lib/utils';
import { DollarSign, PiggyBank, Users, X, ArrowRight } from 'lucide-react';

// (นำ Chart เข้ามาจาก Path ใหม่)
import { MonthlyTrendTargetChart } from '@/components/charts/monthly-trend-target-chart';
import { DepartmentDonutChart } from '@/components/charts/department-donut-chart';

// --- Helper Functions (จากข้อมูล รพ.ลอง) ---
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

  const totalBudget = 89500000; // งบปี 69
  const kpis: KpiData = {
    totalExpense: totalExpense,
    budgetVariance: totalBudget - totalExpense,
    topSpendingDept: topDept[0],
  };
  return { kpis, deptData, categoryData };
};

const getMonthlyChartData = (expenses: Expense[]) => {
  const monthMap = new Map<string, number>();
  const allMonths = [
    "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03",
    "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09"
  ];
  allMonths.forEach(month => monthMap.set(month, 0));

  expenses.forEach((item) => {
    const month = item.date.substring(0, 7);
    if (monthMap.has(month)) {
      monthMap.set(month, (monthMap.get(month) || 0) + item.amount);
    }
  });

  // สร้างข้อมูล Target (สมมติว่าเป้าหมายคือ 7.45M ต่อเดือน)
  return [...monthMap.entries()].map(([name, value]) => ({
    name,
    actual: value,
    target: 7458333, // (89.5M / 12)
  }));
};

// --- L1 Hybrid View Component ---
export function HybridExecutiveView({ user }: { user: any }) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  // 1. กรองข้อมูลหลักตาม State
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((item) => {
      const monthMatch = !selectedMonth || item.date.startsWith(selectedMonth);
      const deptMatch = !selectedDept || item.department === selectedDept;
      return monthMatch && deptMatch;
    });
  }, [selectedMonth, selectedDept]);

  // 2. คำนวณข้อมูลสำหรับแสดงผล
  const { kpis, deptData, categoryData } = useMemo(
    () => calculateDashboardData(filteredExpenses),
    [filteredExpenses],
  );

  // 3. ข้อมูลกราฟแท่ง (กรองตามแผนก แต่แสดงทุกเดือน)
  const monthlyChartData = useMemo(() => getMonthlyChartData(
    allExpenses.filter(item => !selectedDept || item.department === selectedDept)
  ), [selectedDept]);

  const totalBudget = 89500000;

  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedDept(null);
  };

  // 4. ฟังก์ชัน Drill-Down (ไปหน้า L2)
  const handleDrillDown = (deptId: string) => {
    // เราจะใช้ deptId ที่ "mock" ขึ้นมาเพื่อไปยัง L2
    // ในระบบจริง deptId นี้ควรจะตรงกับ ID ใน Database
    const mockDeptIdMap: { [key: string]: string } = {
      "งาน IT": "it",
      "งานบริหาร": "admin",
      "Medical": "medical",
      "OPD": "opd",
      "IPD": "ipd",
      "Lab": "lab",
      "งานช่าง": "engineering",
      "งานพัสดุ": "procurement",
    };
    const id = mockDeptIdMap[deptId] || "unknown";
    router.push(`/dashboard?deptId=${id}`); //
  };

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">L1 Executive Hub (ปีงบ 2569)</h1>
          <p className="text-gray-500">
            คลิกที่ชาร์ตเพื่อกรองข้อมูล / คลิกที่รายการเพื่อเจาะลึก
          </p>
        </div>
        <Button onClick={clearFilters} variant="outline" className="mt-4 md:mt-0">
          <X className="h-4 w-4 mr-2" />
          ล้างตัวกรอง
        </Button>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* (KPIs จะอัปเดตตาม Filter ที่เลือก) */}
        <MetricCard title="ยอดใช้จ่าย (Filtered)" value={formatCurrency(kpis.totalExpense)} icon={DollarSign} />
        <MetricCard title="งบประมาณคงเหลือ (Filtered)" value={formatCurrency(kpis.budgetVariance)} icon={PiggyBank} />
        <MetricCard title="หน่วยงานที่ใช้สูงสุด (Filtered)" value={kpis.topSpendingDept} icon={Users} />
      </div>

      {/* --- Cross-Filter Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            รายจ่าย (Actual) vs เป้าหมาย (Target)
          </h3>
          <MonthlyTrendTargetChart
            data={monthlyChartData}
            selectedMonth={selectedMonth}
            onMonthSelect={setSelectedMonth}
          />
        </Card>
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            สัดส่วนตามหน่วยงาน (คลิกเพื่อกรอง)
          </h3>
          <DepartmentDonutChart
            data={deptData}
            selectedDept={selectedDept}
            onDeptSelect={setSelectedDept}
          />
        </Card>
      </div>

      {/* --- Drill-Down List (L2 Gateway) --- */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          เจาะลึกรายหน่วยงาน (คลิกเพื่อไป L2)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          (รายการนี้จะถูกกรองตาม Filter ที่คุณเลือกด้านบน)
        </p>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {deptData.length > 0 ? deptData.map((item) => (
            <button
              key={item.name}
              onClick={() => handleDrillDown(item.name)}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary transition-all group"
            >
              <span className="font-medium text-gray-800">{item.name}</span>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-gray-800">
                  {formatCurrency(item.value)}
                </span>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
              </div>
            </button>
          )) : <p className="text-center text-gray-500">ไม่พบข้อมูล</p>}
        </div>
      </Card>
    </div>
  );
}