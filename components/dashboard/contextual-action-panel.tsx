"use client";

import React from "react";
import {
  Download,
  Filter,
  TrendingUp,
  PlusCircle,
  Settings,
  AlertTriangle,
  FileBarChart,
  PackageSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrillLevel } from "@/lib/types/drilldown";
import { cn } from "@/lib/utils";

interface ContextualActionPanelProps {
  level: number; // 0 (L1) to 4 (L5)
  contextName: string;
  onAction: (action: string) => void;
}

export function ContextualActionPanel({ level, contextName, onAction }: ContextualActionPanelProps) {
  // Define available actions based on Hierarchy Level
  const getActions = () => {
    switch (level) {
      case 0: // L1: Strategic Overview
        return [
          { id: "export_summary", label: "Export Summary", icon: Download, variant: "outline" },
          { id: "compare_years", label: "Compare Years", icon: FileBarChart, variant: "ghost" },
        ];
      case 1: // L2: Department/Major Category
      case 2: // L3: Sub Category
        return [
          { id: "budget_transfer", label: "Transfer Budget", icon: TrendingUp, variant: "outline" },
          { id: "set_alert", label: "Set Spending Alert", icon: AlertTriangle, variant: "ghost" },
        ];
      case 3: // L4: Item Group
      case 4: // L5: Individual Items
        return [
          { id: "add_entry", label: "Record Actual", icon: PlusCircle, variant: "default" }, // Tactical Action
          { id: "inventory", label: "Check Inventory", icon: PackageSearch, variant: "outline" },
          { id: "supplier", label: "Supplier Info", icon: Settings, variant: "ghost" },
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 mb-4 rounded-lg border border-brand-100 bg-brand-50/50 animate-fade-in">
      <div className="flex items-center gap-2 mb-3 sm:mb-0">
        <div className="p-2 bg-white rounded-full shadow-sm text-brand-600">
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-brand-900">Operations: {contextName}</h4>
          <p className="text-xs text-brand-600">
            {level === 0 ? "Strategic Actions" : level >= 3 ? "Tactical Controls" : "Analytical Tools"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant as any}
            size="sm"
            onClick={() => onAction(action.id)}
            className={cn(
              "transition-all duration-200",
              action.variant === "default" && "bg-brand-600 hover:bg-brand-700 shadow-sm hover:shadow-md"
            )}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}