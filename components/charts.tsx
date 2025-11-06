// components/charts.tsx

'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from 'recharts';
import { cn, formatCurrency, THAI_FY_MONTHS } from '../lib/utils';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const target = payload.find((p) => p.dataKey === 'target');
    const actual = payload.find((p) => p.dataKey === 'actual');
    const variance = (actual?.value as number) - (target?.value as number);

    return (
      <div className="p-3 bg-white shadow-lg rounded-md border">
        <p className="font-bold text-sm mb-2">{label}</p>
        <p className="text-xs text-blue-600">
          เป้าหมาย: {formatCurrency(target?.value as number)}
        </p>
        <p className="text-xs text-indigo-600">
          ผลลัพธ์: {formatCurrency(actual?.value as number)}
        </p>
        <p
          className={cn(
            'text-xs font-medium mt-1',
            variance > 0 ? 'text-red-600' : 'text-green-600',
          )}
        >
          ผลต่าง: {formatCurrency(variance)}
        </p>
      </div>
    );
  }
  return null;
};

// L1: Monthly Target vs Actual Chart
interface TargetActualChartProps {
  data: { name: string; target: number; actual: number }[];
}

export function TargetActualChart({ data }: TargetActualChartProps) {
  // Map data to Thai FY months
  const chartData = THAI_FY_MONTHS.map((monthName) => {
    const monthData = data.find((d) => d.name === monthName);
    return {
      name: monthName,
      target: monthData?.target ?? 0,
      actual: monthData?.actual ?? 0,
    };
  });

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <XAxis dataKey="name" stroke="#555" fontSize={12} />
          <YAxis
            stroke="#555"
            fontSize={12}
            tickFormatter={(value) =>
              value >= 1000
                ? `${value / 1000}k`
                : value.toString()
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar
            dataKey="actual"
            name="ผลลัพธ์ (Actual)"
            fill="#4f46e5" // Indigo
          />
          <Line
            type="monotone"
            dataKey="target"
            name="เป้าหมาย (Target)"
            stroke="#0b6bcb" // Blue
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// L1/L2: Breakdown Pie Chart
interface BreakdownPieChartProps {
  data: { name: string; value: number; id: string }[];
  onDataClick: (data: any) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function BreakdownPieChart({
  data,
  onDataClick,
}: BreakdownPieChartProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            onClick={onDataClick}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}