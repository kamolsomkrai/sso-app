"use client";

import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FolderOpen, Loader2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { DrillDownRow } from "@/lib/types/drilldown";
import { RecursiveDrillDownRow } from "./recursive-drill-down-row";

interface L2ExpenseAccordionProps {
  l2Item: DrillDownRow;
  fiscalYear: number;
}

export function L2ExpenseAccordion({ l2Item, fiscalYear }: L2ExpenseAccordionProps) {
  // Fetch initial children (L3) for this L2 category
  const { data: l3Items, isLoading } = useQuery<DrillDownRow[]>({
    queryKey: ["drillDownChildren", fiscalYear, l2Item.id],
    queryFn: async () => {
      const res = await axios.get("/api/dashboard/drill-down", {
        params: {
          fiscalYear,
          parentId: l2Item.id,
          level: 2, // Asking for L3 items
        },
      });
      return res.data.items;
    },
  });

  // --- COMPATIBILITY FIX ---
  // Handle both New (financials) and Old (currentYear) data structures
  // This prevents the "undefined" crash if API is cached or outdated
  const financials = l2Item.financials || {
    currentPlan: (l2Item as any).currentYear?.plan || 0,
    currentActual: (l2Item as any).currentYear?.actual || 0,
    variance: (l2Item as any).currentYear?.variance || 0,
    variancePercent: (l2Item as any).currentYear?.variancePercent || 0,
    status: (l2Item as any).currentYear?.status || 'success',
    lastYearActual: (l2Item as any).history?.lastYearActual || 0,
    nextYearPlan: 0
  };

  // Safe Status Color Lookup
  const statusColor = {
    success: "text-emerald-600 bg-emerald-50 border-emerald-100",
    warning: "text-amber-600 bg-amber-50 border-amber-100",
    danger: "text-rose-600 bg-rose-50 border-rose-100",
  }[financials.status] || "text-slate-600 bg-slate-50 border-slate-100";

  return (
    <AccordionItem value={l2Item.id} className="border border-slate-200 rounded-lg bg-white mb-4 shadow-sm overflow-hidden">
      {/* --- Header (L2 Summary) --- */}
      <AccordionTrigger className="px-4 py-4 hover:bg-slate-50 hover:no-underline transition-all">
        <div className="flex flex-1 items-center justify-between pr-4">
          <div className="flex items-center gap-3 text-left">
            <div className={cn("p-2 rounded-lg", statusColor)}>
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">{l2Item.name}</p>
              <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                <span>Budget: {formatCurrency(financials.currentPlan)}</span>
                <span className="text-slate-300">|</span>
                <span>Actual: {formatCurrency(financials.currentActual)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block mr-4">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Next Year Plan</p>
              <p className="text-sm font-mono text-brand-600 font-medium">{formatCurrency(financials.nextYearPlan)}</p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "h-7 px-3 text-sm font-mono",
                statusColor
              )}
            >
              {financials.variancePercent > 0 ? "+" : ""}
              {financials.variancePercent.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </AccordionTrigger>

      {/* --- Content (Recursive Table) --- */}
      <AccordionContent className="px-0 pb-0 border-t border-slate-200">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="w-[40%] pl-12 text-xs uppercase font-bold text-slate-500">Sub-Category (L3-L5)</TableHead>
              <TableHead className="text-right text-xs uppercase font-bold text-slate-500 bg-slate-100/50">Last Year (Actual)</TableHead>
              <TableHead className="text-right text-xs uppercase font-bold text-slate-500 border-l border-slate-200">Plan (Curr)</TableHead>
              <TableHead className="text-right text-xs uppercase font-bold text-slate-800">Actual (Curr)</TableHead>
              <TableHead className="text-right text-xs uppercase font-bold text-slate-500">Diff %</TableHead>
              <TableHead className="text-right text-xs uppercase font-bold text-brand-600 border-l border-slate-200">Plan (Next)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></TableCell></TableRow>
            ) : (
              l3Items?.map((item) => (
                <RecursiveDrillDownRow
                  key={item.id}
                  row={item}
                  fiscalYear={fiscalYear}
                  levelIndex={0} // Start indentation at 0 for L3
                />
              ))
            )}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
}