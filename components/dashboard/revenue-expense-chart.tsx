'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, THAI_FY_MONTHS } from '@/lib/utils';
import { RevenueData as RevenueDataType } from '@/lib/types'; // Renamed import

type Timeframe = 'monthly' | 'quarterly';

// Helper for custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border rounded-lg shadow-lg">
        <p className="label font-semibold">{label}</p>
        <p className="text-sm text-blue-600">{`รายรับ: ${formatCurrency(
          payload[0].value,
        )}`}</p>
        <p className="text-sm text-red-600">{`รายจ่าย: ${formatCurrency(
          payload[1].value,
        )}`}</p>
      </div>
    );
  }
  return null;
};

// Helper to format Y-axis ticks
const yAxisFormatter = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} ล.`; // ล้าน
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)} K`; // พัน
  }
  return formatCurrency(value);
};

// Helper to format X-axis ticks
const getMonthName = (month: number) => {
  const fiscalMonthOrder = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const index = fiscalMonthOrder.indexOf(month);
  return THAI_FY_MONTHS[index] || String(month);
};

const getQuarterName = (quarter: number) => {
  return `Q${quarter}`;
};


export function RevenueExpenseChart({
  data,
  timeframe,
}: {
  data: RevenueDataType;
  timeframe: Timeframe;
}) {
  const chartData =
    timeframe === 'monthly'
      ? data.monthly.map((d) => ({ ...d, name: getMonthName(d.month) }))
      : data.quarterly.map((d) => ({ ...d, name: getQuarterName(d.quarter) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายรับ เทียบกับ รายจ่าย ({timeframe === 'monthly' ? 'รายเดือน' : 'รายไตรมาส'})</CardTitle>
      </CardHeader>
      <CardContent className="pl-0 pr-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#555"
              fontSize={12}
            />
            <YAxis
              stroke="#555"
              fontSize={12}
              tickFormatter={yAxisFormatter}
              axisLine={false}
              tickLine={false}
              allowDataOverflow={true}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="รายรับ"
              stroke="#2563eb" // blue-600
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="รายจ่าย"
              stroke="#dc2626" // red-600
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}