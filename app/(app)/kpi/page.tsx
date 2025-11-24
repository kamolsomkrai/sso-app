"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { KpiCard } from '@/components/kpi/kpi-card';
import { StrategySummaryCard } from '@/components/kpi/strategy-summary-card';
import { KpiAnnualChart } from '@/components/kpi/kpi-annual-chart';
import { SummaryCards } from '@/components/kpi/summary-cards';
import { KpiCreateDialog } from '@/components/kpi/kpi-create-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  KpiData, 
  StrategySummary, 
  FiveYearStrategy,
  KpiOptions 
} from '@/lib/types/kpi';
import { 
  BarChart3, 
  Calendar, 
  Flag,
  TrendingUp,
  AlertCircle,
  Hospital,
  Plus,
  Download,
  Target
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportKpiToExcel, exportFiveYearToExcel } from '@/lib/utils/export-kpi';

type ViewMode = 'dashboard' | 'strategy' | '5year';

export default function KpiDashboardPage() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number>(2569);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('IN01');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [selectedPlanPeriod, setSelectedPlanPeriod] = useState<string>('2569-2573');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch options
  const { data: options } = useQuery<KpiOptions>({
    queryKey: ['kpi-options'],
    queryFn: async () => {
      const { data } = await axios.get('/api/kpi/options');
      return data;
    },
  });

  // Fetch KPI data
  const { data: kpiData, isLoading: isLoadingKpi } = useQuery<KpiData[]>({
    queryKey: ['kpi-data', selectedYear, selectedIndicator, selectedStrategy],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        indicatorId: selectedIndicator,
        ...(selectedStrategy && { strategyId: selectedStrategy }),
      });
      const { data } = await axios.get(`/api/kpi/data?${params}`);
      return data;
    },
    enabled: viewMode !== '5year',
  });

  // Fetch strategy summary
  const { data: strategySummary, isLoading: isLoadingSummary } = useQuery<StrategySummary[]>({
    queryKey: ['strategy-summary', selectedYear, selectedIndicator],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        indicatorId: selectedIndicator,
      });
      const { data } = await axios.get(`/api/kpi/strategy-summary?${params}`);
      return data;
    },
    enabled: viewMode === 'dashboard',
  });

  // Fetch 5-year plan data
  const { data: fiveYearData, isLoading: isLoading5Year } = useQuery<FiveYearStrategy[]>({
    queryKey: ['five-year', selectedPlanPeriod, selectedIndicator],
    queryFn: async () => {
      const params = new URLSearchParams({
        planPeriod: selectedPlanPeriod,
        indicatorId: selectedIndicator,
      });
      const { data } = await axios.get(`/api/kpi/five-year?${params}`);
      return data;
    },
    enabled: viewMode === '5year',
  });

  const years = [2569, 2570, 2571, 2572, 2573];
  const indicatorName = options?.indicators.find(i => i.code === selectedIndicator)?.name || 'โรงพยาบาล';

  // Group KPI data by objective
  const groupedByObjective = kpiData?.reduce((acc, kpi) => {
    const key = kpi.objectiveName;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(kpi);
    return acc;
  }, {} as Record<string, KpiData[]>);

  // Get unique strategies for strategy view filter
  const strategies = strategySummary?.map(s => ({
    id: s.strategyId,
    name: s.strategyName
  })) || [];

  const handleExport = () => {
    if (viewMode === '5year' && fiveYearData) {
      exportFiveYearToExcel(fiveYearData, selectedPlanPeriod, indicatorName);
    } else if (kpiData && strategySummary) {
      exportKpiToExcel(kpiData, strategySummary, selectedYear, indicatorName);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hospital Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <Hospital className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">KPI Dashboard โรงพยาบาลลอง</h1>
              <p className="text-blue-100 mt-1">จังหวัดแพร่ | Long Hospital, Phrae Province</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode Tabs */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('dashboard')}
                variant={viewMode === 'dashboard' ? 'default' : 'outline'}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                ภาพรวม
              </Button>
              <Button
                onClick={() => setViewMode('strategy')}
                variant={viewMode === 'strategy' ? 'default' : 'outline'}
                className="gap-2"
              >
                <Flag className="w-4 h-4" />
                รายยุทธศาสตร์
              </Button>
              <Button
                onClick={() => setViewMode('5year')}
                variant={viewMode === '5year' ? 'default' : 'outline'}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                เป้าหมาย 5 ปี
              </Button>
            </div>

            <div className="h-6 w-px bg-slate-300" />

            {/* Indicator Filter */}
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-600" />
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options?.indicators.map((indicator) => (
                    <SelectItem key={indicator.id} value={indicator.code}>
                      {indicator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year/Plan Period Filter */}
            {viewMode === '5year' ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <Select value={selectedPlanPeriod} onValueChange={setSelectedPlanPeriod}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.planPeriods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Strategy Filter (for strategy view) */}
            {viewMode === 'strategy' && strategies.length > 0 && (
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-slate-600" />
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ทั้งหมด</SelectItem>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex-1" />

            {/* Action Buttons */}
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              สร้าง KPI
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2"
              disabled={!kpiData && !fiveYearData}
            >
              <Download className="w-4 h-4" />
              ส่งออก Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <div className="space-y-8">
            {isLoadingSummary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : strategySummary ? (
              <>
                <SummaryCards strategySummary={strategySummary} />
                
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    สรุปตามยุทธศาสตร์
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {strategySummary.map((strategy) => (
                      <StrategySummaryCard key={strategy.strategyId} strategy={strategy} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>ไม่พบข้อมูล</p>
              </div>
            )}
          </div>
        )}

        {/* Strategy View */}
        {viewMode === 'strategy' && (
          <div>
            {isLoadingKpi ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : groupedByObjective && Object.keys(groupedByObjective).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedByObjective).map(([objectiveName, kpis]) => (
                  <div key={objectiveName} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-slate-900">{objectiveName}</h3>
                      <span className="ml-auto text-sm text-slate-500">{kpis.length} KPIs</span>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kpis.map((kpi) => (
                          <KpiCard key={kpi.kpiId} kpi={kpi} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>ไม่พบ KPI สำหรับปีที่เลือก</p>
              </div>
            )}
          </div>
        )}

        {/* 5-Year View */}
        {viewMode === '5year' && (
          <div>
            {isLoading5Year ? (
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-96 rounded-xl" />
                ))}
              </div>
            ) : fiveYearData && fiveYearData.length > 0 ? (
              <div className="space-y-8">
                {fiveYearData.map((strategy) => (
                  <div key={strategy.strategyId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 flex items-center gap-3">
                      <Flag className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-blue-900">{strategy.strategyName}</h3>
                      <span className="ml-auto text-sm text-blue-700">{strategy.kpis.length} KPIs</span>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strategy.kpis.map((kpi) => (
                          <KpiAnnualChart
                            key={kpi.kpiId}
                            data={kpi.annualData}
                            kpiName={kpi.kpiName}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>ไม่พบข้อมูลสำหรับช่วงแผนที่เลือก</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <KpiCreateDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
}
