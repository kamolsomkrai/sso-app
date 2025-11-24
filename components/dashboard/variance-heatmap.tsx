"use client";

import React from 'react';
import { HeatmapDataPoint } from '@/lib/types/dashboard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VarianceHeatmapProps {
  data: HeatmapDataPoint[];
}

export function VarianceHeatmap({ data }: VarianceHeatmapProps) {
  // Get all months from the first data point
  const months = data[0]?.data.map(d => d.x) || [];

  // Helper to get color based on variance
  const getColor = (variance: number) => {
    // Variance > 0 means Over Budget (Bad for Expense) -> Red
    // Variance < 0 means Under Budget (Good for Expense) -> Green
    if (variance > 20) return "bg-rose-600";
    if (variance > 10) return "bg-rose-500";
    if (variance > 0) return "bg-rose-400";
    if (variance > -10) return "bg-emerald-400";
    if (variance > -20) return "bg-emerald-500";
    return "bg-emerald-600";
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header Row (Months) */}
        <div className="flex mb-2">
          <div className="w-48 flex-shrink-0 font-bold text-slate-700 p-2">Category</div>
          {months.map((month) => (
            <div key={month} className="flex-1 text-center text-xs font-semibold text-slate-500 p-2">
              {month}
            </div>
          ))}
        </div>

        {/* Data Rows */}
        <div className="space-y-1">
          {data.map((row) => (
            <div key={row.id} className="flex items-center">
              <div className="w-48 flex-shrink-0 text-sm font-medium text-slate-900 truncate pr-4" title={row.category}>
                {row.category}
              </div>
              <div className="flex-1 flex gap-1">
                {row.data.map((cell, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-10 flex-1 rounded-sm cursor-pointer transition-opacity hover:opacity-80 ${getColor(cell.y)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-bold">{row.category} - {cell.x}</p>
                          <p>Actual: {cell.value.toLocaleString()}</p>
                          <p className={cell.y > 0 ? "text-rose-500" : "text-emerald-500"}>
                            Variance: {cell.y > 0 ? "+" : ""}{cell.y.toFixed(1)}%
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-600 rounded-sm"></div>
            <span>Under Budget (&lt;-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-400 rounded-sm"></div>
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-400 rounded-sm"></div>
            <span>Over Budget (&gt;0%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-600 rounded-sm"></div>
            <span>Critical (&gt;20%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
