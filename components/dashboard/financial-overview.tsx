'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { FinancialSummary, L1KpiData } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Helper Component for a single KPI Card
function KpiCard({
  title,
  data,
  isProfit = false,
}: {
  title: string;
  data: L1KpiData;
  isProfit?: boolean;
}) {
  const { actual, variancePercent } = data;

  let Icon;
  let colorClass;

  if (variancePercent > 1) { // เกินเป้า/สูงกว่าแผน
    Icon = TrendingUp;
    colorClass = isProfit ? 'text-green-600' : 'text-red-600'; // กำไร = ดี, รายจ่าย = แย่
  } else if (variancePercent < -1) { // ต่ำกว่าแผน
    Icon = TrendingDown;
    colorClass = isProfit ? 'text-red-600' : 'text-green-600'; // กำไร = แย่, รายจ่าย = ดี
  } else { // ใกล้เคียงแผน
    Icon = Minus;
    colorClass = 'text-gray-500';
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(actual)}
        </div>
        <p className={`text-xs ${colorClass}`}>
          {variancePercent > 0 ? '+' : ''}
          {variancePercent.toFixed(1)}% จากแผน
        </p>
      </CardContent>
    </Card>
  );
}

// Main Component
export function FinancialOverview({
  summary,
}: {
  summary: FinancialSummary;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="รายรับรวม" data={summary.totalRevenue} isProfit={true} />
      <KpiCard title="รายจ่ายรวม" data={summary.totalExpense} isProfit={false} />
      <KpiCard
        title="กำไร (ขาดทุน) สุทธิ"
        data={summary.netProfitLoss}
        isProfit={true}
      />
      {/* Placeholder for 4th card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            เงินคงเหลือ (คำนวณ)
          </CardTitle>
          <span className="text-gray-500">...</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-400">
            (Coming Soon)
          </div>
          <p className="text-xs text-gray-500">
            รอดำเนินการ
          </p>
        </CardContent>
      </Card>
    </div>
  );
}