"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Folder,
  Package,
  MoreHorizontal,
  TrendingUp,
  FileText,
  AlertCircle
} from "lucide-react";
import { DrillDownRow } from "@/lib/types/drilldown";
import { formatCurrency, cn } from "@/lib/utils";

interface UnifiedDrillDownTableProps {
  data: DrillDownRow[];
  isLoading: boolean;
  onDrillDown: (row: DrillDownRow) => void;
  onRowAction: (action: string, row: DrillDownRow) => void;
}

export function UnifiedDrillDownTable({
  data,
  isLoading,
  onDrillDown,
  onRowAction
}: UnifiedDrillDownTableProps) {

  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <Package className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">No data available for this selection.</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <Table>
        <TableHeader className="bg-slate-50 border-b border-slate-200">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40%] font-semibold text-slate-700 pl-6 py-4">Category / Item Name</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">Plan</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">Actual</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">Variance</TableHead>
            <TableHead className="text-center w-[120px] font-semibold text-slate-700">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id}
              className={cn(
                "group cursor-pointer transition-all duration-200 ease-in-out border-b border-slate-100",
                "hover:bg-brand-50/30"
              )}
              style={{ animationDelay: `${index * 50}ms` }} // Staggered entrance effect
              onClick={(e) => {
                // Prevent drill down if clicking action button
                if ((e.target as HTMLElement).closest(".action-btn")) return;
                if (row.hasChildren) onDrillDown(row);
              }}
            >
              {/* Name Column */}
              <TableCell className="pl-6 py-3">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors duration-200",
                    row.hasChildren
                      ? "bg-brand-100 text-brand-600 group-hover:bg-brand-200 group-hover:text-brand-700"
                      : "bg-slate-100 text-slate-500"
                  )}>
                    {row.hasChildren ? <Folder className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 group-hover:text-brand-700 transition-colors">
                      {row.name}
                    </div>
                    {row.code && <div className="text-xs text-slate-400 font-mono">{row.code}</div>}
                  </div>
                </div>
              </TableCell>

              {/* Financial Columns */}
              <TableCell className="text-right font-mono text-slate-600 text-sm">
                {formatCurrency(row.currentYear.plan)}
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-slate-800 text-sm">
                {formatCurrency(row.currentYear.actual)}
              </TableCell>
              <TableCell className={cn("text-right font-mono text-xs font-medium",
                row.currentYear.variance >= 0 ? "text-success-600" : "text-danger-600"
              )}>
                {row.currentYear.variancePercent > 0 ? "+" : ""}
                {row.currentYear.variancePercent.toFixed(1)}%
              </TableCell>

              {/* Status Column */}
              <TableCell className="text-center">
                <StatusBadge status={row.currentYear.status} />
              </TableCell>

              {/* Actions Column */}
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {/* Drill Icon */}
                  {row.hasChildren && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Context Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 action-btn text-slate-400 hover:text-slate-700">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onRowAction('view_details', row)}>
                        <FileText className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRowAction('trend', row)}>
                        <TrendingUp className="mr-2 h-4 w-4" /> Analyze Trend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onRowAction('flag', row)} className="text-red-600 focus:text-red-600">
                        <AlertCircle className="mr-2 h-4 w-4" /> Flag Issue
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper for Status Badge
function StatusBadge({ status }: { status: 'success' | 'warning' | 'danger' }) {
  const styles = {
    success: "bg-success-50 text-success-700 border-success-200 hover:bg-success-100",
    warning: "bg-warning-50 text-warning-700 border-warning-200 hover:bg-warning-100",
    danger: "bg-danger-50 text-danger-700 border-danger-200 hover:bg-danger-100",
  };

  const labels = {
    success: "On Track",
    warning: "Review",
    danger: "Over Limit",
  };

  return (
    <Badge variant="outline" className={cn("transition-colors duration-300 font-normal", styles[status])}>
      {labels[status]}
    </Badge>
  );
}