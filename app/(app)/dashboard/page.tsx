'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Loader2,
  AlertCircle,
  FileBarChart,
  RefreshCw
} from 'lucide-react';

// Components
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { FinancialOverview } from '@/components/dashboard/financial-overview';
import DrillDownView from './components/drill-down-view';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Utils & Types
import { getCurrentFiscalYear } from '@/lib/utils';
import { DashboardSummary } from '@/lib/types/dashboard';
import { toast } from 'sonner';

export default function DashboardPage() {
  // 1. State: Manage Fiscal Year Global Context
  const [fiscalYear, setFiscalYear] = useState<number>(getCurrentFiscalYear());
  const [isExporting, setIsExporting] = useState(false);

  // 2. Data Fetching: L1 Executive Summary (The "Big Picture")
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useQuery<DashboardSummary>({
    queryKey: ['dashboardOverview', fiscalYear],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/overview', {
        params: { fiscalYear },
      });
      return data;
    },
    // Refresh automatically every 5 minutes for executive dashboards
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });

  // 3. Handlers
  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info('Preparing Executive Report...');

      // Simulate API call for export
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRetry = () => {
    refetchSummary();
    toast.info('Refreshing dashboard data...');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">

        {/* --- Section 1: Global Controls --- */}
        <DashboardHeader
          fiscalYear={fiscalYear}
          onFiscalYearChange={setFiscalYear}
          onExport={handleExport}
        />

        {/* --- Section 2: L1 Strategic Overview --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-brand-600" />
              Strategic Financial Health
            </h2>
            {isSummaryLoading && (
              <span className="text-xs text-slate-400 flex items-center animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Updating...
              </span>
            )}
          </div>

          {isSummaryLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl bg-white shadow-sm" />
              ))}
            </div>
          ) : summaryError ? (
            <div className="p-6 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h3 className="text-red-900 font-semibold">Failed to load Executive Summary</h3>
              <p className="text-red-600 text-sm mb-4 max-w-md">
                We couldn't retrieve the latest financial data. This might be due to a network issue or server maintenance.
              </p>
              <Button
                variant="outline"
                onClick={handleRetry}
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          ) : (
            <FinancialOverview summary={summaryData!} />
          )}
        </section>

        {/* --- Section 3: L2-L5 Unified Drill-Down --- */}
        {/* This component handles its own internal state (history stack) */}
        <section className="space-y-4 pt-4 border-t border-slate-200/60">
          <DrillDownView fiscalYear={fiscalYear} />
        </section>

      </div>
    </div>
  );
}