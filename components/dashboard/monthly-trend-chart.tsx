// components/dashboard/monthly-trend-chart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { chartOptions, chartColors } from '@/lib/chart-config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyTrendChartProps {
  data: Array<{
    month: number;
    revenue: number;
    expense: number;
  }>;
}

const monthLabels = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'รายได้',
        data: data.map(d => d.revenue),
        borderColor: chartColors.success,
        backgroundColor: chartColors.success + '20',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'รายจ่าย',
        data: data.map(d => d.expense),
        borderColor: chartColors.destructive,
        backgroundColor: chartColors.destructive + '20',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'เทรนด์รายได้-รายจ่าย รายเดือน',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return '฿' + (value / 1000000).toFixed(0) + 'M';
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}