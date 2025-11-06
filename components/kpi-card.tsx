// components/kpi-cards.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface QuarterlyKpiCardProps {
  quarter: number;
  target: number;
  actual: number;
  variance: number;
  isSelected: boolean;
  onClick: () => void;
}

export function QuarterlyKpiCard({
  quarter,
  target,
  actual,
  variance,
  isSelected,
  onClick,
}: QuarterlyKpiCardProps) {
  const isOverTarget = actual > target;
  const variancePercent = ((actual - target) / target) * 100;
  const statusColor = isOverTarget
    ? 'text-red-600' // ค่าใช้จ่ายเกินเป้า (สีแดง)
    : 'text-green-600';
  const Icon = isOverTarget ? TrendingUp : variance === 0 ? Minus : TrendingDown;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg'
          : 'hover:bg-gray-50',
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex justify-between items-center">
          <span>ไตรมาส {quarter}</span>
          <span className="text-xs font-normal text-gray-500">
            (ต.ค. - ธ.ค.)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{formatCurrency(actual)}</div>
        <p className="text-xs text-gray-500">
          เป้าหมาย: {formatCurrency(target)}
        </p>
        <div className={cn('flex items-center text-sm', statusColor)}>
          <Icon className="h-4 w-4 mr-1" />
          <span>
            {isOverTarget ? '+' : ''}
            {variancePercent.toFixed(1)}% ({formatCurrency(actual - target)})
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface RootCauseAnalysisCardProps {
  isLoading: boolean;
  data: { note: string; author: { name: string }; createdAt: string }[];
}

export function RootCauseAnalysisCard({
  isLoading,
  data,
}: RootCauseAnalysisCardProps) {
  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200">
      <h3 className="text-lg font-semibold text-yellow-900 mb-3">
        การวิเคราะห์สาเหตุ (Root Cause)
      </h3>
      {isLoading && <p>Loading notes...</p>}
      {!isLoading && data.length === 0 && (
        <p className="text-sm text-yellow-700">
          ไม่พบการวิเคราะห์สาเหตุสำหรับไตรมาสนี้
        </p>
      )}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="text-sm">
            <p className="font-medium text-gray-800">{item.note}</p>
            <p className="text-xs text-gray-600 mt-1">
              — {item.author.name} (
              {new Date(item.createdAt).toLocaleDateString('th-TH')})
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}