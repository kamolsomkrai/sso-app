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

ChartJS.register(ArcElement, Tooltip, Legend);

interface KpiGaugeProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const COLORS = {
  green: '#34D399',
  yellow: '#FBBF24',
  red: '#F87171',
  grey: '#E5E7EB',
};

export function KpiGauge({ value, label, size = 'md' }: KpiGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Color logic
  const color =
    clampedValue >= 100
      ? COLORS.green
      : clampedValue >= 70
      ? COLORS.yellow
      : COLORS.red;

  // Size config
  const sizeConfig = {
    sm: { container: 80, fontSize: '1.25rem' },
    md: { container: 120, fontSize: '1.75rem' },
    lg: { container: 160, fontSize: '2.25rem' },
  };

  const config = sizeConfig[size];

  const data = {
    datasets: [
      {
        data: [clampedValue, 100 - clampedValue],
        backgroundColor: [color, COLORS.grey],
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
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
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: config.container, height: config.container / 2 }}
      >
        <Doughnut data={data} options={options} />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 font-bold"
          style={{ color, fontSize: config.fontSize }}
        >
          {Math.round(clampedValue)}%
        </div>
      </div>
      {label && (
        <p className="text-sm text-slate-600 mt-2 font-medium">{label}</p>
      )}
    </div>
  );
}
