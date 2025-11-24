"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { VarianceHeatmap } from '@/components/dashboard/variance-heatmap';
import { SparklineTable } from '@/components/dashboard/sparkline-table';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentFiscalYear } from '@/lib/utils';
import { HeatmapDataPoint } from '@/lib/types/dashboard';
import { AlertCircle, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard3Page() {
  const [fiscalYear, setFiscalYear] = useState<number>(getCurrentFiscalYear());

  const { data: heatmapData, isLoading, error } = useQuery<HeatmapDataPoint[]>({
    queryKey: ['dashboardHeatmap', fiscalYear],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/heatmap', {
        params: { fiscalYear },
      });
      return data;
    },
  });

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Failed to load trend data</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Trends & Seasonality</h1>
            <p className="text-slate-500">Monthly variance analysis and spending trends</p>
          </div>
          <Select value={fiscalYear.toString()} onValueChange={(v) => setFiscalYear(parseInt(v))}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Fiscal Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2568">FY 2568</SelectItem>
              <SelectItem value="2567">FY 2567</SelectItem>
              <SelectItem value="2566">FY 2566</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Heatmap Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Monthly Variance Heatmap</h3>
            <p className="text-sm text-slate-500">Top 10 categories by expense. Red indicates over-budget months.</p>
          </div>
          <div className="w-full overflow-x-auto">
            {isLoading ? (
              <Skeleton className="w-full h-[400px]" />
            ) : (
              <VarianceHeatmap data={heatmapData || []} />
            )}
          </div>
        </div>

        {/* Sparkline Table Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Performance Trends</h3>
          {isLoading ? (
            <Skeleton className="w-full h-[400px]" />
          ) : (
            <SparklineTable data={heatmapData || []} />
          )}
        </div>
      </div>
    </div>
  );
}
