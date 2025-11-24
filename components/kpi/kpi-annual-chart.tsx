"use client";

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { KpiAnnualData } from '@/lib/types/kpi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface KpiAnnualChartProps {
  data: KpiAnnualData[];
  kpiName: string;
}

export function KpiAnnualChart({ data, kpiName }: KpiAnnualChartProps) {
  const chartData = {
    labels: data.map((d) => `${d.year}`),
    datasets: [
      {
        label: 'ผลลัพธ์',
        data: data.map((d) => d.result || 0),
        backgroundColor: '#4A90E2',
        borderRadius: 4,
      },
      {
        label: 'เป้าหมาย',
        data: data.map((d) => d.target || 0),
        backgroundColor: '#A0AEC0',
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          font: {
            family: 'Sarabun, sans-serif',
          },
          usePointStyle: true,
          pointStyle: 'rectRounded',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          family: 'Sarabun, sans-serif',
          size: 14,
        },
        bodyFont: {
          family: 'Sarabun, sans-serif',
          size: 13,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Sarabun, sans-serif',
          },
        },
        grid: {
          color: '#E2E8F0',
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Sarabun, sans-serif',
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h4 className="font-semibold text-slate-900 mb-4 line-clamp-2">
        {kpiName}
      </h4>
      <div className="h-[250px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
