"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

interface PlanVsActualChartProps {
  data: any[];
  title?: string;
}

export function PlanVsActualChart({ data, title = "Plan vs Actual Overview" }: PlanVsActualChartProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
        <CardDescription>Comparison of planned budget vs actual spending</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="plan" 
                name="Plan" 
                fill="#94a3b8" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
              <Bar 
                dataKey="actual" 
                name="Actual" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
