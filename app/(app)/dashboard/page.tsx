'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseDrilldown } from '@/components/dashboard/expense-drilldown';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { FinancialOverview } from '@/components/dashboard/financial-overview';
import { RevenueExpenseChart } from '@/components/dashboard/revenue-expense-chart';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown-chart';
// import DrillDownView from './components/drill-down-view';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentFiscalYear } from '@/lib/utils';
import { DashboardSummary } from '@/lib/types/dashboard';

export default function DashboardPage() {
  const [fiscalYear, setFiscalYear] = useState<number>(getCurrentFiscalYear());

  const {
    data: summaryData,
    isLoading,
    error,
    refetch
  } = useQuery<DashboardSummary>({
    queryKey: ['dashboardOverview', fiscalYear],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/overview', {
        params: { fiscalYear },
      });
      return data;
    },
    refetchInterval: 300000, // 5 mins
  });

  const handleExport = () => toast.success("Exporting report for FY" + fiscalYear);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Failed to load dashboard</h2>
        <p className="text-slate-500 mb-6">We encountered an issue connecting to the financial service.</p>
        <Button onClick={() => refetch()}><RefreshCw className="mr-2 w-4 h-4" /> Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-fade-in">

      <DashboardHeader
        fiscalYear={fiscalYear}
        onFiscalYearChange={setFiscalYear}
        onExport={handleExport}
      />

      {/* L1: High-Level KPI Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
      ) : (
        <FinancialOverview summary={summaryData!} />
      )}

      {/* L2: Trend & Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {isLoading ? (
          <Skeleton className="h-[350px] col-span-3" />
        ) : (
          <RevenueExpenseChart data={summaryData?.charts?.monthlyTrend || []} />
        )}

        {isLoading ? (
          <Skeleton className="h-[350px] col-span-2" />
        ) : (
          <CategoryBreakdownChart data={summaryData?.charts?.expenseBreakdown || []} />
        )}
      </div>

      {/* L3-L5: Detailed Drill Down */}
      <div className="pt-6 border-t border-slate-200">
        <ExpenseDrilldown fiscalYear={fiscalYear} />
      </div>

    </div>
  );
}