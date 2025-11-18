'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import * as Icons from 'lucide-react';

import { L2CategoryData, L3CategoryData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { HistoryBarChart } from './history-bar-chart';
import { L3CategoryAccordion } from './l3-category-accordion';

// --- Helper Functions ---
async function fetchL3Data(
  fiscalYear: number,
  l2CategoryId: string,
): Promise<L3CategoryData[]> {
  const { data } = await axios.get('/api/dashboard/l3-drilldown', {
    params: { fiscalYear, l2CategoryId },
  });
  return data;
}
// ------------------------

// Helper to get Icon component from string name
const getIcon = (iconName: string | null): React.ElementType => {
  if (iconName && Icons[iconName as keyof typeof Icons]) {
    return Icons[iconName as keyof typeof Icons];
  }
  return Icons.Box; // Default icon
};

export function L2ExpenseAccordion({
  fiscalYear,
  l2Category,
}: {
  fiscalYear: number;
  l2Category: L2CategoryData;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const Icon = getIcon(l2Category.icon);

  // L3 Data Query (lazy loaded)
  const {
    data: l3Data,
    isLoading: isLoadingL3,
    error: errorL3,
  } = useQuery<L3CategoryData[]>({
    queryKey: ['expenseDrilldownL3', fiscalYear, l2Category.id],
    queryFn: () => fetchL3Data(fiscalYear, l2Category.id),
    enabled: isOpen, // Only fetch when the accordion is opened
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { plan, actual, history } = l2Category;
  const variance = actual - plan;
  const variancePercent = plan === 0 ? (actual > 0 ? 100 : 0) : (variance / plan) * 100;

  let VarIcon;
  let colorClass;

  if (variancePercent > 1) {
    VarIcon = TrendingUp;
    colorClass = 'text-red-600';
  } else if (variancePercent < -1) {
    VarIcon = TrendingDown;
    colorClass = 'text-green-600';
  } else {
    VarIcon = Minus;
    colorClass = 'text-gray-500';
  }

  return (
    <AccordionItem
      value={l2Category.id}
      className="border-none"
    >
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <AccordionTrigger
          className="p-4 hover:no-underline"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between w-full gap-4">
            {/* Left Side: Icon & Name */}
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-left">
                  {l2Category.name}
                </h4>
                <p className="text-xs text-gray-500 text-left">
                  {l2Category.itemCount} หมวดหมู่ย่อย
                </p>
              </div>
            </div>

            {/* Middle: History Chart */}
            <div className="w-1/4 hidden lg:block">
              <HistoryBarChart data={l2Category.history} />
            </div>

            {/* Right Side: Financials */}
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">
                  {formatCurrency(actual)}
                </p>
                <p className="text-xs text-gray-500">
                  แผน: {formatCurrency(plan)}
                </p>
              </div>
              <div
                className={`flex items-center text-sm font-semibold ${colorClass} w-[90px] justify-end`}
              >
                <VarIcon className="w-4 h-4 mr-1" />
                <span>{variancePercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 pt-0">
          <Card className="bg-gray-50 p-4 shadow-inner">
            {isLoadingL3 && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {errorL3 && (
              <div className="flex items-center text-red-700">
                <AlertCircle className="w-4 h-4 mr-2" />
                <p className="text-sm">
                  ไม่สามารถโหลดข้อมูล L3: {errorL3.message}
                </p>
              </div>
            )}
            {l3Data && (
              <Accordion type="single" collapsible className="w-full space-y-2">
                {l3Data.map((l3Category) => (
                  <L3CategoryAccordion
                    key={l3Category.id}
                    fiscalYear={fiscalYear}
                    l3Category={l3Category}
                  />
                ))}
              </Accordion>
            )}
          </Card>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}