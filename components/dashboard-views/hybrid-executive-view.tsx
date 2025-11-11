// components/dashboard-views/hybrid-executive-view.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/metric-card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, PiggyBank, Users, X, ArrowRight } from 'lucide-react';

import { MonthlyTrendTargetChart } from '@/components/charts/monthly-trend-target-chart';
import { DepartmentListChart } from '@/components/charts/department-list-chart';

// --- L1 Hybrid View Component ---
export function HybridExecutiveView({ user }: { user: any }) {
  const router = useRouter();

  // 1. เปลี่ยน State เป็น String (UUID)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // "10", "11"
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null); // "uuid-string"

  const fiscalYear = 2569;

  // 2. อัปเดต useQuery ให้เรียก API จริง
  const { data, isLoading } = useQuery<any>({
    queryKey: ['l1Hub', fiscalYear, selectedMonth, selectedDeptId],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/l1-hub', {
        params: {
          year: fiscalYear,
          month: selectedMonth,
          dept_id: selectedDeptId,
        },
      });
      return data;
    },
  });

  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedDeptId(null);
  };

  // 3. ฟังก์ชัน Drill-Down (L2)
  const handleDrillDown = (deptId: string) => { //
    router.push(`/dashboard?deptId=${deptId}`);
  };

  const kpis = data?.kpis;
  const monthlyChartData = data?.monthlyChartData || [];
  const deptChartData = data?.deptChartData || [];

  if (isLoading && !data) {
    return <div>Loading Dashboard Hub...</div>;
  }

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
        <MetricCard title="ยอดใช้จ่าย (Filtered)" value={formatCurrency(kpis?.totalExpense || 0)} icon={DollarSign} />
        <MetricCard
          title="งบประมาณคงเหลือ (Filtered)"
          value={formatCurrency(kpis?.budgetVariance || 0)}
          changeType={(kpis?.budgetVariance || 0) > 0 ? "positive" : "negative"}
          icon={PiggyBank}
        />
        <MetricCard title="หน่วยงานที่ใช้สูงสุด (Filtered)" value={kpis?.topSpendingDept || 'N/A'} icon={Users} />
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
            onMonthSelect={(monthName) => {
              const month = monthName ? monthName.split('-')[1] : null;
              setSelectedMonth(month);
            }}
          />
        </Card>
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            สัดส่วนตามหน่วยงาน (คลิกเพื่อกรอง)
          </h3>
          <DepartmentListChart
            data={deptChartData}
            selectedDept={selectedDeptId ? deptChartData.find(d => d.id === selectedDeptId)?.name : null}
            onDeptSelect={(deptName) => {
              const dept = deptChartData.find(d => d.name === deptName);
              setSelectedDeptId(dept ? dept.id : null);
            }}
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
          {deptChartData.length > 0 ? deptChartData.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleDrillDown(item.id)}
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