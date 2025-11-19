"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryDataPoint } from "@/lib/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface CategoryBreakdownChartProps {
  data: CategoryDataPoint[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  // Fallback colors if not provided
  const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444'];

  return (
    <Card className="col-span-4 lg:col-span-2 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">
          Top Expenses Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}