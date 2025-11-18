'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

// Import Dashboard Components
import { FinancialOverview } from '@/components/dashboard/financial-overview';
import { RevenueExpenseChart } from '@/components/dashboard/revenue-expense-chart';
import { ExpenseDrilldown } from '@/components/dashboard/expense-drilldown';

// Import Types
import { OverviewApiResponse } from '@/lib/types';
import { getCurrentFiscalYear } from '@/lib/utils';

// --- Helper Functions ---
async function fetchOverviewData(
  fiscalYear: number,
): Promise<OverviewApiResponse> {
  const { data } = await axios.get('/api/dashboard/overview', {
    params: { fiscalYear },
  });
  return data;
}
// ------------------------

export default function DashboardPage() {
  const [fiscalYear, setFiscalYear] = React.useState<number>(
    getCurrentFiscalYear(),
  );
  const [timeframe, setTimeframe] = React.useState<'monthly' | 'quarterly'>(
    'monthly',
  );

  const { data, isLoading, error, isRefetching } =
    useQuery<OverviewApiResponse>({
      queryKey: ['dashboardOverview', fiscalYear],
      queryFn: () => fetchOverviewData(fiscalYear),
      // staleTime: 1000 * 60 * 5, // 5 minutes
      // refetchOnWindowFocus: false,
    });

  const handleYearChange = (yearString: string) => {
    setFiscalYear(parseInt(yearString));
  };

  // Generate year options (e.g., 2567, 2566, 2565)
  const currentYear = getCurrentFiscalYear();
  const yearOptions = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
  ];

  return (
    <div className="space-y-6">
      {/* --- Header & Filters --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          ภาพรวม Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <Select
            value={timeframe}
            onValueChange={(v) => setTimeframe(v as 'monthly' | 'quarterly')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="เลือกมุมมอง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">รายเดือน</SelectItem>
              <SelectItem value="quarterly">รายไตรมาส</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(fiscalYear)}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="เลือกปีงบประมาณ" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  ปีงบ {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Main Content Area (Tabs) --- */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม (L1)</TabsTrigger>
          <TabsTrigger value="expense_drilldown">
            เจาะลึกรายจ่าย (L2-L4)
          </TabsTrigger>
        </TabsList>

        {/* --- Loading State --- */}
        {(isLoading || isRefetching) && (
          <div className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-[120px]" />
              <Skeleton className="h-[120px]" />
              <Skeleton className="h-[120px]" />
              <Skeleton className="h-[120px]" />
            </div>
            <Skeleton className="h-[400px]" />
          </div>
        )}

        {/* --- Error State --- */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-red-50 text-red-700">
            <AlertCircle className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </h3>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* --- Success State (Data Loaded) --- */}
        {data && !isLoading && !isRefetching && (
          <>
            {/* --- Tab 1: Overview --- */}
            <TabsContent value="overview" className="space-y-4">
              <FinancialOverview summary={data.summary} />
              <RevenueExpenseChart
                data={data.revenueData}
                timeframe={timeframe}
              />
            </TabsContent>

            {/* --- Tab 2: Expense Drilldown --- */}
            <TabsContent value="expense_drilldown" className="space-y-4">
              <ExpenseDrilldown
                fiscalYear={fiscalYear}
                timeframe={timeframe}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}