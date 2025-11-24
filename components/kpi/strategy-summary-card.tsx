"use client";

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { StrategySummary } from '@/lib/types/kpi';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StrategySummaryCardProps {
  strategy: StrategySummary;
}

const COLORS = {
  green: '#34D399',
  red: '#F87171',
};

export function StrategySummaryCard({ strategy }: StrategySummaryCardProps) {
  const chartData = {
    datasets: [
      {
        data: [strategy.passedKpis, strategy.failedKpis],
        backgroundColor: [COLORS.green, COLORS.red],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 line-clamp-2">
        {strategy.strategyName}
      </h3>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative" style={{ width: 100, height: 100 }}>
          <Doughnut data={chartData} options={options} />
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
            <span className="text-slate-600">KPI ทั้งหมด</span>
            <span className="font-bold text-slate-900">{strategy.totalKpis}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
            <span className="text-slate-600">ผ่าน</span>
            <span className="font-bold text-green-600">{strategy.passedKpis}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">ไม่ผ่าน</span>
            <span className="font-bold text-red-600">{strategy.failedKpis}</span>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">อัตราความสำเร็จ</span>
          <span className="text-xl font-bold text-slate-900">
            {strategy.completionRate}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all"
            style={{ width: `${strategy.completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
