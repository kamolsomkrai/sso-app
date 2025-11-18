'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import {
  Accordion,
} from '@/components/ui/accordion';

import { L2CategoryData } from '@/lib/types';
import { L2ExpenseAccordion } from './l2-expense-accordion';

// --- Helper Functions ---
async function fetchL2Data(fiscalYear: number): Promise<L2CategoryData[]> {
  const { data } = await axios.get('/api/dashboard/expense-drilldown', {
    params: { fiscalYear },
  });
  return data;
}
// ------------------------

export function ExpenseDrilldown({
  fiscalYear,
  timeframe,
}: {
  fiscalYear: number;
  timeframe: 'monthly' | 'quarterly';
}) {
  const { data: l2Data, isLoading, error } = useQuery<L2CategoryData[]>({
    queryKey: ['expenseDrilldownL2', fiscalYear],
    queryFn: () => fetchL2Data(fiscalYear),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-red-50 text-red-700">
        <AlertCircle className="w-10 h-10 mb-3" />
        <h3 className="text-lg font-semibold mb-1">
          เกิดข้อผิดพลาดในการโหลดข้อมูล L2
        </h3>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-semibold">
          เจาะลึกรายจ่าย (L2 - L4)
        </h3>
        <p className="text-sm text-gray-600">
          คลิกที่แต่ละหมวด (L2) เพื่อดูหมวดหมู่ย่อย (L3) และรายการ (L4)
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {l2Data &&
          l2Data.map((l2Category) => (
            <L2ExpenseAccordion
              key={l2Category.id}
              fiscalYear={fiscalYear}
              l2Category={l2Category}
            />
          ))}
      </Accordion>
    </div>
  );
}