"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface UtilizationGaugeProps {
  value: number;
  label: string;
  size?: number;
  className?: string;
}

export function UtilizationGauge({ value, label, size = 120, className }: UtilizationGaugeProps) {
  // Clamp value between 0 and 100 for the arc, but display real value text
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  // Calculate stroke dasharray for semi-circle
  // Circumference = 2 * pi * r. Semi-circle = pi * r.
  // r = 40 (viewBox 100x50, center 50,50)
  const radius = 40;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  // Determine color
  let colorClass = "text-emerald-500";
  if (value > 100) colorClass = "text-rose-500";
  else if (value > 80) colorClass = "text-amber-500";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size / 2 }}>
        <svg
          viewBox="0 0 100 50"
          className="w-full h-full overflow-visible transform"
        >
          {/* Background Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Foreground Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-1000 ease-out", colorClass)}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center transform translate-y-1/2">
          <span className={cn("text-2xl font-bold", colorClass)}>
            {value.toFixed(0)}%
          </span>
        </div>
      </div>
      <span className="mt-6 text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}
