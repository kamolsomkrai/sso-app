"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { L2ExpenseAccordion } from "./l2-expense-accordion";
import { DrillDownResponse } from "@/lib/types/drilldown";

export function ExpenseDrilldown({ fiscalYear }: { fiscalYear: number }) {
  // Fetch Root Categories (L2)
  const { data, isLoading, error } = useQuery<DrillDownResponse>({
    queryKey: ["drillDownRoot", fiscalYear],
    queryFn: async () => {
      const res = await axios.get("/api/dashboard/drill-down", {
        params: {
          fiscalYear,
          level: 0, // Fetch Top Level (L1->L2)
        },
      });
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <p>Unable to load expense categories. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-lg font-semibold text-slate-800">
          Expense Breakdown by Category (L2)
        </h3>
        <span className="text-xs text-slate-500">
          Click rows to expand details
        </span>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {data?.items.map((l2Item) => (
          <L2ExpenseAccordion
            key={l2Item.id}
            l2Item={l2Item}
            fiscalYear={fiscalYear}
          />
        ))}
      </Accordion>
    </div>
  );
}