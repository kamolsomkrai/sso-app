// KPI System Types

export type KpiCalcLogic = 'GTE' | 'LTE' | 'EQ0' | 'EQT';
export type KpiStatusType = 'PASSED' | 'FAILED' | 'PENDING' | 'ERROR';

export interface KpiQuarterlyData {
  id: string;
  year: number;
  quarter: number;
  quarterlyTarget: string | null;
  result: string | null;
  status: KpiStatusType;
}

export interface KpiAnnualData {
  year: number;
  target: number | null;
  result: number | null;
}

export interface KpiData {
  kpiId: string;
  kpiCode: string;
  kpiName: string;
  targetText: string | null;
  owner: string | null;
  calcLogic: KpiCalcLogic;
  isActive: boolean;
  fiveYearPlanPeriod: string | null;
  fiveYearTargetText: string | null;
  fiveYearTargetValue: number | null;
  
  // Hierarchy
  indicatorId: string;
  indicatorName: string;
  strategyId?: string;
  strategyName?: string;
  planName?: string;
  objectiveName: string;
  
  // Data
  year: number;
  quarterlyData: KpiQuarterlyData[];
  annualData: KpiAnnualData[];
}

export interface StrategySummary {
  strategyId: string;
  strategyCode: string;
  strategyName: string;
  totalKpis: number;
  passedKpis: number;
  failedKpis: number;
  pendingKpis: number;
  completionRate: number;
}

export interface FiveYearKpi {
  kpiId: string;
  kpiCode: string;
  kpiName: string;
  objectiveName: string;
  planName?: string;
  fiveYearTargetText: string | null;
  fiveYearTargetValue: number | null;
  calcLogic: KpiCalcLogic;
  isActive: boolean;
  annualData: KpiAnnualData[];
}

export interface FiveYearStrategy {
  strategyId: string;
  strategyCode: string;
  strategyName: string;
  kpis: FiveYearKpi[];
}

export interface KpiOptions {
  planPeriods: string[];
  indicators: {
    id: string;
    code: string;
    name: string;
  }[];
}
