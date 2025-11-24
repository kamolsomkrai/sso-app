"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TreemapChart } from '@/components/dashboard/treemap-chart';
import { UtilizationGauge } from '@/components/dashboard/utilization-gauge';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentFiscalYear } from '@/lib/utils';
import { TreemapNode } from '@/lib/types/dashboard';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export default function Dashboard2Page() {
  const [fiscalYear, setFiscalYear] = useState<number>(getCurrentFiscalYear());

  const { data: hierarchyData, isLoading, error } = useQuery<TreemapNode[]>({
    queryKey: ['dashboardHierarchy', fiscalYear],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/hierarchy', {
        params: { fiscalYear },
      });
      return data;
    },
  });

  // Calculate overall utilization for gauges
  const totalPlan = hierarchyData?.reduce((sum, node) => sum + node.size, 0) || 0;
  const totalActual = hierarchyData?.reduce((sum, node) => sum + node.value, 0) || 0;
  const overallUtilization = totalPlan > 0 ? (totalActual / totalPlan) * 100 : 0;

  // Find "At Risk" categories (Utilization > 90%)
  const atRiskCategories = hierarchyData
    ?.flatMap(node => node.children || [])
    .filter(node => node.utilization > 90)
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 5) || [];

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Failed to load hierarchy data</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Budget Utilization & Hierarchy</h1>
            <p className="text-slate-500">Visualizing expense distribution and budget health</p>
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

        {/* Top Section: Gauges & At Risk List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauges Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Overall Budget Health</h3>
            {isLoading ? (
              <Skeleton className="w-40 h-20 rounded-full" />
            ) : (
              <UtilizationGauge value={overallUtilization} label="Total Expense Utilization" size={200} />
            )}
          </div>

          {/* At Risk List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories At Risk (&gt;90% Utilization)</h3>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : atRiskCategories.length > 0 ? (
                atRiskCategories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-10 rounded-full bg-rose-500" />
                      <div>
                        <p className="font-medium text-slate-900">{cat.name}</p>
                        <p className="text-xs text-slate-500">Plan: {cat.size.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-rose-600">{cat.utilization.toFixed(1)}%</span>
                      <p className="text-xs text-slate-500">Actual: {cat.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No categories currently at risk. Great job!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Chart: Treemap */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Expense Hierarchy Map</h3>
          <p className="text-sm text-slate-500 mb-6">Size represents budget amount, color represents utilization %</p>
          <div className="h-[600px] w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <TreemapChart data={hierarchyData || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
