"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface PeriodToggleProps {
  value: 'month' | 'quarter';
  onChange: (value: 'month' | 'quarter') => void;
  className?: string;
}

export function PeriodToggle({ value, onChange, className }: PeriodToggleProps) {
  return (
    <div className={cn("inline-flex rounded-lg bg-slate-100 p-1 shadow-sm", className)}>
      <button
        onClick={() => onChange('month')}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
          value === 'month'
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('quarter')}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
          value === 'quarter'
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        )}
      >
        Quarterly
      </button>
    </div>
  );
}
