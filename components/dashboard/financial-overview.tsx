'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSummary, KpiMetric } from '@/lib/types/dashboard';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiMetricCardProps {
  title: string;
  data?: KpiMetric; // Make data optional to handle loading/undefined states
  isProfit?: boolean;
  icon?: React.ElementType;
}

function KpiCard({
  title,
  data,
  isProfit = false,
  icon: Icon = Activity
}: KpiMetricCardProps) {
  // 1. Defensive Loading State: If data is undefined, show a Skeleton
  if (!data) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  // 2. Safe Destructuring: Now we know data exists
  const { actual, target, variancePercent, status } = data;

  // 3. Determine Icon and Color Logic
  let TrendIcon = MinusIcon;
  let colorClass = 'text-slate-500';

  // Use the 'status' directly from the API calculation (Source of Truth)
  if (status === 'success') {
    colorClass = 'text-emerald-600';
    TrendIcon = ArrowUpIcon;
  } else if (status === 'danger') {
    colorClass = 'text-rose-600';
    TrendIcon = ArrowDownIcon;
  } else if (status === 'warning') {
    colorClass = 'text-amber-500';
    TrendIcon = ArrowDownIcon;
  }

  // Special logic: If expense goes UP, it's usually bad (Red), but variancePercent logic handles this in API service
  // If we want visual arrow logic separate from color:
  const isPositiveVariance = variancePercent > 0;
  const DisplayIcon = isPositiveVariance ? ArrowUpIcon : ArrowDownIcon;

  return (
    <Card className={`border-l-4 shadow-sm`} style={{ borderLeftColor: `var(--color-${status}-600)` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full bg-slate-50`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">
          {formatCurrency(actual)}
        </div>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <span className={colorClass + " font-medium flex items-center"}>
            <DisplayIcon className="h-3 w-3 mr-1" />
            {Math.abs(variancePercent).toFixed(1)}%
          </span>
          <span className="text-slate-400">vs target {formatCurrency(target)}</span>
        </p>
      </CardContent>
    </Card>
  );
}

export function FinancialOverview({
  summary,
}: {
  summary?: DashboardSummary; // Make summary optional
}) {
  // If summary is undefined (parent is loading), KpiCard will handle the skeleton render
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Revenue"
        data={summary?.totalRevenue}
        isProfit={true}
        icon={DollarSign}
      />
      <KpiCard
        title="Total Expense"
        data={summary?.totalExpense}
        isProfit={false}
        icon={Activity}
      />
      <KpiCard
        title="Net Result"
        // Fix: Ensure this matches the API key (netResult vs netProfitLoss)
        data={summary?.netResult}
        isProfit={true}
        icon={Activity}
      />

      {/* Placeholder for Projected / Remaining Budget */}
      <Card className="bg-slate-50 border-dashed">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Remaining Budget
          </CardTitle>
          <Activity className="h-4 w-4 text-slate-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-400">
            --
          </div>
          <p className="text-xs text-slate-400">
            Calculated field (Coming Soon)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}