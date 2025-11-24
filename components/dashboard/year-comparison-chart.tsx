"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

interface YearComparisonChartProps {
  data: any[];
  title?: string;
}

export function YearComparisonChart({ data, title = "Historical Comparison" }: YearComparisonChartProps) {
  const [visibleYears, setVisibleYears] = useState<string[]>(["2567", "2566", "2565"]);

  const toggleYear = (year: string) => {
    setVisibleYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
          <CardDescription>Compare actual performance across years</CardDescription>
        </div>
        <div className="flex gap-2">
          {["2567", "2566", "2565"].map(year => (
            <Button
              key={year}
              variant={visibleYears.includes(year) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleYear(year)}
              className={visibleYears.includes(year) ? 
                (year === "2567" ? "bg-indigo-600 hover:bg-indigo-700" : 
                 year === "2566" ? "bg-slate-400 hover:bg-slate-500" : 
                 "bg-slate-300 hover:bg-slate-400") 
                : "text-slate-500"}
            >
              {year}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrev1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend iconType="circle" />
              
              {visibleYears.includes("2567") && (
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  name="2567 (Current)" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCurrent)" 
                />
              )}
              
              {visibleYears.includes("2566") && (
                <Area 
                  type="monotone" 
                  dataKey="prev1" 
                  name="2566" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorPrev1)" 
                />
              )}

              {visibleYears.includes("2565") && (
                <Area 
                  type="monotone" 
                  dataKey="prev2" 
                  name="2565" 
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  fill="none" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
