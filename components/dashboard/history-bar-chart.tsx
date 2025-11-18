'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface HistoryData {
  year: number;
  actual: number;
}

export function HistoryBarChart({ data }: { data: HistoryData[] }) {
  const chartData = data.map((d) => ({
    name: String(d.year).slice(-2), // "2567" -> "67"
    actual: d.actual,
  }));

  return (
    <ResponsiveContainer width="100%" height={60}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          width={25}
        />
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            formatCurrency(value),
            `ปี ${props.payload.name}`,
          ]}
          cursor={{ fill: 'transparent' }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="actual" fill="#a1a1aa" radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}