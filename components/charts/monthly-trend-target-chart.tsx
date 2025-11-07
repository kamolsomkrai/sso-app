// components/charts/monthly-trend-target-chart.tsx

'use client';

import {
  ComposedChart, // <-- ใช้ ComposedChart เพื่อผสม Bar และ Line
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface ChartProps {
  data: { name: string; actual: number; target: number }[];
  selectedMonth: string | null;
  onMonthSelect: (month: string | null) => void;
}

export const MonthlyTrendTargetChart = ({ data, selectedMonth, onMonthSelect }: ChartProps) => {
  const handleClick = (payload: any) => {
    if (payload && payload.name) {
      onMonthSelect(payload.name === selectedMonth ? null : payload.name);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--color-muted-foreground))"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => format(new Date(value), "MMM")}
        />
        <YAxis
          stroke="hsl(var(--color-muted-foreground))"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} //
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--color-card))",
            border: "1px solid hsl(var(--color-border))",
            borderRadius: "0.625rem",
          }}
          formatter={(value: number, name: string) => [formatCurrency(value), name === 'actual' ? 'Actual' : 'Target']} //
        />
        <Legend />

        {/* 1. กราฟแท่งสำหรับ Actual (รายจ่ายจริง) */}
        <Bar dataKey="actual" name="Actual" onClick={handleClick} className="cursor-pointer">
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

        {/* 2. กราฟเส้นสำหรับ Target (เป้าหมาย) */}
        <Line
          type="monotone"
          dataKey="target"
          name="Target"
          stroke="hsl(var(--color-destructive))" //
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5" //
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};