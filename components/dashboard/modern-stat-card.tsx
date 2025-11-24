"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface ModernStatCardProps {
  title: string;
  value: number;
  target?: number;
  trend?: number; // Percentage change
  icon: React.ElementType;
  color?: "emerald" | "rose" | "indigo" | "amber";
  subtext?: string;
}

export function ModernStatCard({
  title,
  value,
  target,
  trend,
  icon: Icon,
  color = "indigo",
  subtext
}: ModernStatCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;
  
  const colorMap = {
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      icon: "text-emerald-500",
      border: "border-emerald-200",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-600",
      icon: "text-rose-500",
      border: "border-rose-200",
    },
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-600",
      icon: "text-indigo-500",
      border: "border-indigo-200",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      icon: "text-amber-500",
      border: "border-amber-200",
    },
  };

  const styles = colorMap[color];

  return (
    <Card className={cn("border-l-4 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200", styles.border)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl", styles.bg)}>
            <Icon className={cn("w-6 h-6", styles.icon)} />
          </div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              isPositive ? "bg-emerald-100 text-emerald-700" : 
              isNegative ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
            )}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : 
               isNegative ? <ArrowDown className="w-3 h-3" /> : 
               <Minus className="w-3 h-3" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(value)}
          </h3>
        </div>

        {target && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Target: {formatCurrency(target)}</span>
              <span>{Math.round((value / target) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", styles.bg.replace("/10", ""))}
                style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {subtext && (
          <p className="mt-2 text-xs text-slate-400">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
