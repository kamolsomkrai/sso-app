'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, AlertCircle, RefreshCw, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseDrilldown } from '@/components/dashboard/expense-drilldown';
import { ModernStatCard } from '@/components/dashboard/modern-stat-card';
import { PlanVsActualChart } from '@/components/dashboard/plan-vs-actual-chart';
import { YearComparisonChart } from '@/components/dashboard/year-comparison-chart';
import { AnalysisCard } from '@/components/dashboard/analysis-card';
import { PeriodToggle } from '@/components/dashboard/period-toggle';
import { LevelFilter } from '@/components/dashboard/level-filter';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentFiscalYear } from '@/lib/utils';
import { DashboardSummary } from '@/lib/types/dashboard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Local insight type for better typing
interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  message: string;
}

export default function DashboardPage() {
  const [fiscalYear, setFiscalYear] = useState<number>(getCurrentFiscalYear());
  const [period, setPeriod] = useState<'month' | 'quarter'>('month');
  const [level, setLevel] = useState<number>(1);

  const {
    data: summaryData,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardSummary>({
    queryKey: ['dashboardOverview', fiscalYear, period, level],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/overview', {
        params: { fiscalYear, period, level },
      });
      return data;
    },
    refetchInterval: 300000, // 5 mins
  });

  const handleExport = () => toast.success('Exporting report for FY' + fiscalYear);

  // Mock data for Year Comparison (placeholder until API provides history)
  const historicalData = [
    { name: 'Oct', current: 4500000, prev1: 4200000, prev2: 4000000 },
    { name: 'Nov', current: 4800000, prev1: 4300000, prev2: 4100000 },
    { name: 'Dec', current: 5200000, prev1: 4800000, prev2: 4500000 },
    { name: 'Jan', current: 4900000, prev1: 4600000, prev2: 4200000 },
    { name: 'Feb', current: 4700000, prev1: 4400000, prev2: 4100000 },
    { name: 'Mar', current: 0, prev1: 4500000, prev2: 4300000 },
    { name: 'Apr', current: 0, prev1: 4300000, prev2: 4000000 },
    { name: 'May', current: 0, prev1: 4400000, prev2: 4100000 },
    { name: 'Jun', current: 0, prev1: 4600000, prev2: 4200000 },
    { name: 'Jul', current: 0, prev1: 4700000, prev2: 4400000 },
    { name: 'Aug', current: 0, prev1: 4800000, prev2: 4500000 },
    { name: 'Sep', current: 0, prev1: 5000000, prev2: 4600000 },
  ];

  // Transform monthly trend for Plan vs Actual chart
  const planVsActualData = summaryData?.charts?.monthlyTrend.map(item => ({
    name: item.name,
    plan: item.planExpense,
    actual: item.expense,
  })) || [];

  // Generate typed insights
  const insights: Insight[] = [];
  if (summaryData) {
    const expenseVariance = summaryData.kpis.totalExpense.variancePercent;
    if (expenseVariance > 5) {
      insights.push({ type: 'warning', message: `Expenses are ${expenseVariance.toFixed(1)}% higher than planned. Check "Medical Supplies" category.` });
    } else if (expenseVariance < -5) {
      insights.push({ type: 'positive', message: `Great job! Expenses are ${Math.abs(expenseVariance).toFixed(1)}% below budget.` });
    }
    const revenueVariance = summaryData.kpis.totalRevenue.variancePercent;
    if (revenueVariance < -5) {
      insights.push({ type: 'negative', message: `Revenue is trailing behind target by ${Math.abs(revenueVariance).toFixed(1)}%.` });
    }
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 bg-rose-50 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Failed to load dashboard</h2>
        <p className="text-slate-500 mb-6 max-w-md">We encountered an issue connecting to the financial service. Please try again later.</p>
        <Button onClick={() => refetch()} variant="outline" className="border-slate-300 hover:bg-slate-50">
          <RefreshCw className="mr-2 w-4 h-4" /> Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 p-6 overflow-hidden relative shadow-lg">
      <div className="max-w-7xl mx-auto space-y-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h2>
            <p className="text-slate-600">
              {period === 'month' ? 'Monthly' : 'Quarterly'} view for Fiscal Year {fiscalYear} (Level {level})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PeriodToggle value={period} onChange={setPeriod} />
            <LevelFilter value={level} onChange={setLevel} className="w-[200px]" />
            <Select value={fiscalYear.toString()} onValueChange={(v) => setFiscalYear(parseInt(v))}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200 shadow-sm">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2568">FY 2568</SelectItem>
                <SelectItem value="2567">FY 2567</SelectItem>
                <SelectItem value="2566">FY 2566</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} className="bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
          ) : (
            <>
              <ModernStatCard
                title="Total Revenue"
                value={summaryData?.kpis.totalRevenue.amount || 0}
                target={summaryData?.kpis.totalRevenue.target}
                trend={summaryData?.kpis.totalRevenue.variancePercent}
                icon={Download}
                color="emerald"
              />
              <ModernStatCard
                title="Total Expense"
                value={summaryData?.kpis.totalExpense.amount || 0}
                target={summaryData?.kpis.totalExpense.target}
                trend={summaryData?.kpis.totalExpense.variancePercent}
                icon={RefreshCw}
                color="rose"
              />
              <ModernStatCard
                title="Net Result"
                value={summaryData?.kpis.netResult.amount || 0}
                target={summaryData?.kpis.netResult.target}
                trend={summaryData?.kpis.netResult.variancePercent}
                icon={Loader2}
                color="indigo"
              />
              <AnalysisCard insights={insights as any} />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {isLoading ? (
            <>
              <Skeleton className="h-[400px] rounded-xl" />
              <Skeleton className="h-[400px] rounded-xl" />
            </>
          ) : (
            <>
              <PlanVsActualChart data={planVsActualData} title={`Expense: Plan vs Actual (${period === 'month' ? 'Monthly' : 'Quarterly'})`} />
              <YearComparisonChart data={historicalData} title="Expense Trends (3 Years)" />
            </>
          )}
        </div>

        {/* Detailed Breakdown */}
        <div className="pt-6 border-t border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Detailed Breakdown</h3>
            <p className="text-slate-500 text-sm">Drill down into specific categories and items</p>
          </div>
          <ExpenseDrilldown fiscalYear={fiscalYear} />
        </div>
      </div>
    </div>
  );
}