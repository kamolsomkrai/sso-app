/**
 * Quarterly utilities for Thai fiscal year (Oct-Sep)
 * Q1: Oct, Nov, Dec
 * Q2: Jan, Feb, Mar
 * Q3: Apr, May, Jun
 * Q4: Jul, Aug, Sep
 */

export function getQuarterFromMonth(month: number): number {
  if ([10, 11, 12].includes(month)) return 1;
  if ([1, 2, 3].includes(month)) return 2;
  if ([4, 5, 6].includes(month)) return 3;
  return 4; // Jul, Aug, Sep
}

export function getQuarterLabel(quarter: number): string {
  return `Q${quarter}`;
}

export function getMonthsInQuarter(quarter: number): number[] {
  const mapping: Record<number, number[]> = {
    1: [10, 11, 12],
    2: [1, 2, 3],
    3: [4, 5, 6],
    4: [7, 8, 9],
  };
  return mapping[quarter] || [];
}

/**
 * Get month name abbreviation
 */
export function getMonthLabel(month: number): string {
  return new Date(0, month - 1).toLocaleString('en-US', { month: 'short' });
}

/**
 * Aggregate monthly data into quarterly data
 */
export interface MonthlyData {
  month: number;
  value: number;
}

export interface QuarterlyData {
  quarter: number;
  value: number;
}

export function aggregateToQuarters(monthlyData: MonthlyData[]): QuarterlyData[] {
  const quarterMap = new Map<number, number>();

  monthlyData.forEach(({ month, value }) => {
    const quarter = getQuarterFromMonth(month);
    quarterMap.set(quarter, (quarterMap.get(quarter) || 0) + value);
  });

  return [1, 2, 3, 4].map(quarter => ({
    quarter,
    value: quarterMap.get(quarter) || 0,
  }));
}
