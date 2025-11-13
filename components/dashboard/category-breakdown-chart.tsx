// components/dashboard/category-breakdown-chart.tsx
'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownChartProps {
  data: Array<{
    category: string;
    amount: number;
    type: 'revenue' | 'expense';
  }>;
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const revenueData = data.filter(d => d.type === 'revenue');
  const expenseData = data.filter(d => d.type === 'expense');

  const revenueChartData = {
    labels: revenueData.map(d => d.category),
    datasets: [
      {
        data: revenueData.map(d => d.amount),
        backgroundColor: [
          '#10b981',
          '#34d399',
          '#6ee7b7',
          '#a7f3d0',
          '#d1fae5',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const expenseChartData = {
    labels: expenseData.map(d => d.category),
    datasets: [
      {
        data: expenseData.map(d => d.amount),
        backgroundColor: [
          '#ef4444',
          '#f87171',
          '#fca5a5',
          '#fecaca',
          '#fee2e2',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '60%',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">รายได้แบ่งตามหมวดหมู่</h3>
        <div className="h-64">
          <Doughnut data={revenueChartData} options={chartOptions} />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">รายจ่ายแบ่งตามหมวดหมู่</h3>
        <div className="h-64">
          <Doughnut data={expenseChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}