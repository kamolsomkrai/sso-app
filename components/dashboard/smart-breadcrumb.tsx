"use client";

import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  id: string | null;
  name: string;
  level: number;
}

interface SmartBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string | null, level: number) => void;
}

export function SmartBreadcrumb({ items, onNavigate }: SmartBreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground mb-6 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
      {/* Home / Root */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all"
        onClick={() => onNavigate(null, 0)}
      >
        <Home className="w-4 h-4 mr-1" />
        <span className="font-medium">Overview</span>
      </Button>

      {items.slice(1).map((item, index) => {
        const isLast = index === items.length - 2; // -2 because slice removed root

        return (
          <div key={item.id || `crumb-${index}`} className="flex items-center animate-in fade-in slide-in-from-left-2 duration-300">
            <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
            <Button
              variant="ghost"
              size="sm"
              disabled={isLast}
              className={cn(
                "h-8 px-2 transition-all",
                isLast
                  ? "font-bold text-brand-700 bg-brand-50 pointer-events-none"
                  : "text-slate-500 hover:text-brand-600 hover:bg-brand-50 font-normal"
              )}
              onClick={() => !isLast && onNavigate(item.id, item.level)}
            >
              {item.name}
            </Button>
          </div>
        );
      })}
    </nav>
  );
}