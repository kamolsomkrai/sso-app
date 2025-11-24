"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TreemapChart } from '@/components/dashboard/treemap-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentFiscalYear } from '@/lib/utils';
import { TreemapNode } from '@/lib/types/dashboard';
import { AlertCircle, Calendar, BarChart3 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PeriodType = 'monthly' | 'quarterly' | 'yearly';

export default function AnalysisPage() {
  const [fiscalYear, setFiscalYear] = useState<number>(getCurrentFiscalYear());
  const [level, setLevel] = useState<number>(2);
  const [period, setPeriod] = useState<PeriodType>('yearly');
  const [month, setMonth] = useState<number | null>(null);
  const [quarter, setQuarter] = useState<number | null>(null);

  const { data: analysisData, isLoading, error } = useQuery<TreemapNode[]>({
    queryKey: ['analysis', fiscalYear, level, period, month, quarter],
    queryFn: async () => {
      const { data } = await axios.get('/api/analysis', {
        params: { fiscalYear, level, period, month, quarter },
      });
      return data;
    },
  });

  const fiscalYearOptions = Array.from({ length: 5 }, (_, i) => getCurrentFiscalYear() - i);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-emerald-600" />
            Budget Analysis Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive hierarchical analysis covering all budget levels (L1-L5) with temporal views
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Fiscal Year */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Fiscal Year
            </label>
            <Select value={fiscalYear.toString()} onValueChange={(v) => setFiscalYear(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fiscalYearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Budget Level
            </label>
            <Select value={level.toString()} onValueChange={(v) => setLevel(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">L1 - Strategic</SelectItem>
                <SelectItem value="2">L2 - Departmental</SelectItem>
                <SelectItem value="3">L3 - Functional</SelectItem>
                <SelectItem value="4">L4 - Operational</SelectItem>
                <SelectItem value="5">L5 - Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Period Type */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Period Type
            </label>
            <Select value={period} onValueChange={(v) => {
              setPeriod(v as PeriodType);
              setMonth(null);
              setQuarter(null);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quarter Selector (conditional) */}
          {period === 'quarterly' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Quarter
              </label>
              <Select value={quarter?.toString() || ''} onValueChange={(v) => setQuarter(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1 (Oct-Dec)</SelectItem>
                  <SelectItem value="2">Q2 (Jan-Mar)</SelectItem>
                  <SelectItem value="3">Q3 (Apr-Jun)</SelectItem>
                  <SelectItem value="4">Q4 (Jul-Sep)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Month Selector (conditional) */}
          {period === 'monthly' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Month
              </label>
              <Select value={month?.toString() || ''} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-900">Error Loading Analysis Data</h4>
            <p className="text-sm text-rose-700 mt-1">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <Skeleton className="h-[500px] w-full" />
        </div>
      )}

      {/* Main Chart */}
      {!isLoading && !error && analysisData && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Budget Utilization Treemap - Level {level}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Size represents plan amount, color represents utilization percentage
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span className="text-slate-600">≤ 80%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span className="text-slate-600">80-100%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500 rounded"></div>
                <span className="text-slate-600">&gt; 100%</span>
              </div>
            </div>
          </div>
          
          {analysisData.length > 0 ? (
            <TreemapChart data={analysisData} />
          ) : (
            <div className="h-[500px] flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm mt-1">Try selecting a different level or period</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {!isLoading && !error && analysisData && analysisData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Categories</p>
            <p className="text-2xl font-bold text-slate-900">{analysisData.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Plan Amount</p>
            <p className="text-2xl font-bold text-emerald-600">
              ฿{analysisData.reduce((sum, node) => sum + node.size, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Actual Amount</p>
            <p className="text-2xl font-bold text-blue-600">
              ฿{analysisData.reduce((sum, node) => sum + node.value, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Average Utilization</p>
            <p className="text-2xl font-bold text-slate-900">
              {(analysisData.reduce((sum, node) => sum + node.utilization, 0) / analysisData.length).toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
