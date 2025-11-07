// components/charts/monthly-trend-chart.tsx

'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface ChartProps {
  data: { name: string; value: number }[];
  selectedMonth: string | null;
  onMonthSelect: (month: string | null) => void;
}

export const MonthlyTrendChart = ({ data, selectedMonth, onMonthSelect }: ChartProps) => {
  const handleClick = (payload: any) => {
    if (payload && payload.name) {
      onMonthSelect(payload.name === selectedMonth ? null : payload.name);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--color-muted-foreground))"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => format(new Date(value), "MMM")}
        />
        <YAxis
          stroke="hsl(var(--color-muted-foreground))"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--color-card))",
            border: "1px solid hsl(var(--color-border))",
            borderRadius: "0.625rem",
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Bar dataKey="value" name="Expense" onClick={handleClick} className="cursor-pointer">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                !selectedMonth || entry.name === selectedMonth
                  ? "hsl(var(--color-primary))"
                  : "hsl(var(--color-muted))"
              }
              fillOpacity={
                !selectedMonth || entry.name === selectedMonth ? 1 : 0.4
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};