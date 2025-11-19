"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartDataPoint } from "@/lib/types/dashboard";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

interface RevenueExpenseChartProps {
  data: ChartDataPoint[];
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  return (
    <Card className="col-span-4 lg:col-span-3 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">
          Revenue vs Expense Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `฿${formatCompactNumber(value)}`}
              />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="var(--color-success-600)"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="var(--color-danger-600)"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}