// components/dashboard/kpi-cards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  plan: number;
  type: 'revenue' | 'expense';
  format?: 'currency' | 'number';
}

export function KPICard({ title, value, plan, type, format = 'currency' }: KPICardProps) {
  const variance = value - plan;
  const variancePercent = plan > 0 ? ((variance / plan) * 100) : 0;
  const isPositive = variance >= 0;
  const isRevenue = type === 'revenue';

  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
      }).format(val);
    }
    return new Intl.NumberFormat('th-TH').format(val);
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isRevenue ? (
          <DollarSign className="h-4 w-4 text-green-600" />
        ) : (
          <Receipt className="h-4 w-4 text-red-600" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        <div className="flex items-center text-xs">
          <span className={cn(
            "flex items-center",
            isRevenue
              ? isPositive ? "text-green-600" : "text-red-600"
              : isPositive ? "text-red-600" : "text-green-600"
          )}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {variancePercent.toFixed(1)}%
          </span>
          <span className="text-muted-foreground ml-2">
            vs แผน {formatValue(plan)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}