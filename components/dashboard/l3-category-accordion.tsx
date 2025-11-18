'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

import { L3CategoryData, L4ItemData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { HistoryBarChart } from './history-bar-chart';
import { L4ItemTable } from './l4-item-table';

// --- Helper Functions ---
async function fetchL4Data(
  fiscalYear: number,
  l3CategoryId: string,
): Promise<L4ItemData[]> {
  const { data } = await axios.get('/api/dashboard/l4-items', {
    params: { fiscalYear, l3CategoryId },
  });
  return data;
}
// ------------------------

export function L3CategoryAccordion({
  fiscalYear,
  l3Category,
}: {
  fiscalYear: number;
  l3Category: L3CategoryData;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  // L4 Data Query (lazy loaded)
  const {
    data: l4Data,
    isLoading: isLoadingL4,
    error: errorL4,
  } = useQuery<L4ItemData[]>({
    queryKey: ['expenseDrilldownL4', fiscalYear, l3Category.id],
    queryFn: () => fetchL4Data(fiscalYear, l3Category.id),
    enabled: isOpen, // Only fetch when the accordion is opened
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { plan, actual, history } = l3Category;

  return (
    <AccordionItem
      value={l3Category.id}
      className="border rounded-lg bg-white shadow-sm"
    >
      <AccordionTrigger
        className="p-3 hover:no-underline"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between w-full gap-4">
          {/* Left Side: Name */}
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-left">
              {l3Category.name}
            </h5>
            <p className="text-xs text-gray-500 text-left">
              {l3Category.itemCount} รายการ
            </p>
          </div>

          {/* Middle: History Chart */}
          <div className="w-1/3 hidden md:block">
            <HistoryBarChart data={history} />
          </div>

          {/* Right Side: Financials */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatCurrency(actual)}
              </p>
              <p className="text-xs text-gray-500">
                แผน: {formatCurrency(plan)}
              </p>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-3 pt-0">
        <div className="p-3 bg-gray-50 rounded-md">
          <h6 className="text-sm font-semibold mb-3">
            รายการ (L4)
          </h6>
          {isLoadingL4 && <Skeleton className="h-20 w-full" />}
          {errorL4 && (
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-xs">
                ไม่สามารถโหลดข้อมูล L4: {errorL4.message}
              </p>
            </div>
          )}
          {l4Data && <L4ItemTable data={l4Data} />}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}