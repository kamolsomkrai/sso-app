"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  Box,
  FileText,
  Layers
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { DrillDownRow } from "@/lib/types/drilldown";

interface RecursiveRowProps {
  row: DrillDownRow;
  fiscalYear: number;
  levelIndex: number; // 0=L3, 1=L4, 2=L5
}

export function RecursiveDrillDownRow({ row, fiscalYear, levelIndex }: RecursiveRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch children ONLY when expanded
  const { data: children, isLoading } = useQuery<DrillDownRow[]>({
    queryKey: ["drillDownNode", fiscalYear, row.id],
    queryFn: async () => {
      const res = await axios.get("/api/dashboard/drill-down", {
        params: {
          fiscalYear,
          parentId: row.id,
          // Convert string level "L3" -> number 3 for API logic
          level: parseInt(row.level.replace('L', '')),
        },
      });
      return res.data.items;
    },
    enabled: isExpanded && row.hasChildren, // Only fetch if expanded
    staleTime: 10 * 60 * 1000, // Cache 10 mins
  });

  const handleToggle = () => {
    if (row.hasChildren) setIsExpanded(!isExpanded);
  };

  // Visual Indentation
  const paddingLeft = `${(levelIndex * 1.5) + 0.5}rem`;

  // Background color gets lighter as we go deeper
  const bgClass = isExpanded
    ? "bg-brand-50/50"
    : levelIndex === 0 ? "bg-white" : "bg-slate-50/30";

  return (
    <>
      {/* --- Main Row --- */}
      <TableRow
        className={cn("hover:bg-slate-50 transition-colors border-b border-slate-100", bgClass)}
        onClick={handleToggle} // Click anywhere to toggle
      >
        {/* Name Column with Indentation & Expand Icon */}
        <TableCell className="py-3 font-medium text-slate-700 relative" style={{ paddingLeft }}>
          <div className="flex items-center gap-2">
            {/* Expand/Collapse Button */}
            {row.hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 text-slate-400 hover:text-brand-600"
                onClick={(e) => { e.stopPropagation(); handleToggle(); }}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            ) : (
              <span className="w-6" /> // Spacer
            )}

            {/* Icon based on Level */}
            {row.level === 'L5' ? (
              <Box className="w-4 h-4 text-brand-500" />
            ) : (
              <Layers className="w-4 h-4 text-slate-400" />
            )}

            <div className="flex flex-col">
              <span className={cn(row.level === 'L5' ? "text-sm" : "text-sm font-semibold")}>
                {row.name}
              </span>
              {row.code && <span className="text-[10px] text-slate-400 font-mono">{row.code}</span>}
            </div>
          </div>
        </TableCell>

        {/* 1. Last Year Actual (อดีต) */}
        <TableCell className="text-right font-mono text-xs text-slate-500 bg-slate-50/50">
          {formatCurrency(row.financials.lastYearActual)}
        </TableCell>

        {/* 2. Current Plan (แผนปีนี้) */}
        <TableCell className="text-right font-mono text-xs text-slate-600 border-l border-slate-100">
          {formatCurrency(row.financials.currentPlan)}
        </TableCell>

        {/* 3. Current Actual (ใช้จริงปีนี้) */}
        <TableCell className="text-right font-mono text-sm font-medium text-slate-900">
          {formatCurrency(row.financials.currentActual)}
        </TableCell>

        {/* 4. Variance % (ผลต่าง) */}
        <TableCell className={cn("text-right font-mono text-xs font-medium",
          row.financials.variance >= 0 ? "text-emerald-600" : "text-rose-600"
        )}>
          {row.financials.variancePercent > 0 ? "+" : ""}
          {row.financials.variancePercent.toFixed(1)}%
        </TableCell>

        {/* 5. Next Year Plan (แผนปีหน้า - อนาคต) */}
        <TableCell className="text-right font-mono text-xs text-brand-600 bg-brand-50/30 border-l border-slate-100">
          {formatCurrency(row.financials.nextYearPlan)}
        </TableCell>
      </TableRow>

      {/* --- Children Rows (Rendered Recursively) --- */}
      {isExpanded && (
        <>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-2 text-center text-slate-400 bg-slate-50/20">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading details...
                </div>
              </TableCell>
            </TableRow>
          ) : children && children.length > 0 ? (
            children.map((child) => (
              <RecursiveDrillDownRow
                key={child.id}
                row={child}
                fiscalYear={fiscalYear}
                levelIndex={levelIndex + 1} // Increase indentation level
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-2 text-center text-xs text-slate-400 italic bg-slate-50/20">
                No items found.
              </TableCell>
            </TableRow>
          )}
        </>
      )}
    </>
  );
}