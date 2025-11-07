// components/charts/department-donut-chart.tsx

'use client';

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartProps {
  data: { name: string; value: number }[];
  selectedDept: string | null;
  onDeptSelect: (dept: string | null) => void;
}


const COLORS = [
  "hsl(var(--color-chart-1))",
  "hsl(var(--color-chart-2))",
  "hsl(var(--color-chart-3))",
  "hsl(var(--color-chart-4))",
  "hsl(var(--color-chart-5))",
];

export const DepartmentDonutChart = ({ data, selectedDept, onDeptSelect }: ChartProps) => {
  const handleClick = (payload: any) => {
    if (payload && payload.name) {
      onDeptSelect(payload.name === selectedDept ? null : payload.name);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--color-card))",
            border: "1px solid hsl(var(--color-border))",
            borderRadius: "0.625rem",
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={5}
          onClick={handleClick}
          className="cursor-pointer"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={
                !selectedDept || entry.name === selectedDept ? 1 : 0.3
              }
              stroke={
                !selectedDept || entry.name === selectedDept
                  ? COLORS[index % COLORS.length]
                  : "none"
              }
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};