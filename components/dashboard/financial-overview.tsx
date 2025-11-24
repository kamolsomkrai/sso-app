"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSummary, KpiMetric } from '@/lib/types/dashboard';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, DollarSign, Activity, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiMetricCardProps {
  title: string;
  data?: KpiMetric;
  isProfit?: boolean;
  icon?: React.ElementType;
}

function KpiCard({
  title,
  data,
  icon: Icon = Activity
}: KpiMetricCardProps) {
  if (!data) {
    return (
      <Card className="border-l-4 border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const { actual, target, variancePercent, status } = data;

  let TrendIcon = MinusIcon;
  let colorClass = 'text-slate-500';
  let bgClass = 'bg-slate-50';

  if (status === 'success') {
    colorClass = 'text-emerald-600';
    bgClass = 'bg-emerald-50';
    TrendIcon = ArrowUpIcon;
  } else if (status === 'danger') {
    colorClass = 'text-rose-600';
    bgClass = 'bg-rose-50';
    TrendIcon = ArrowDownIcon;
  } else if (status === 'warning') {
    colorClass = 'text-amber-500';
    bgClass = 'bg-amber-50';
    TrendIcon = ArrowDownIcon;
  }

  return (
    <Card className={`border-l-4 shadow-sm transition-all duration-200 hover:shadow-md`} style={{ borderLeftColor: `var(--color-${status}-600)` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${bgClass}`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {formatCurrency(actual)}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-500">
            Target: {formatCurrency(target)}
          </p>
          <div className={`flex items-center text-xs font-bold ${colorClass}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {Math.abs(variancePercent).toFixed(1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialOverview({ summary }: { summary?: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* แก้ไขจุดที่ 1: เข้าถึงผ่าน summary?.kpis?.xxx */}
      <KpiCard
        title="Total Revenue"
        data={summary?.kpis?.totalRevenue}
        icon={DollarSign}
      />
      <KpiCard
        title="Total Expense"
        data={summary?.kpis?.totalExpense}
        icon={Wallet}
      />
      <KpiCard
        title="Net Result"
        data={summary?.kpis?.netResult}
        icon={Activity}
      />

      {/* Placeholder Card */}
      <Card className="bg-slate-50/50 border-dashed border-2 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Running Balance</CardTitle>
          <Activity className="h-4 w-4 text-slate-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-300">--</div>
          <p className="text-xs text-slate-400">Calculated via Projection</p>
        </CardContent>
      </Card>
    </div>
  );
}