"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PieChart,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  TrendingUp,
  FileText,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function ModernSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const navItems = [
    {
      group: "Analytics",
      items: [
        {
          title: "Executive Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Budget Hierarchy",
          href: "/dashboard2",
          icon: PieChart,
        },
        {
          title: "Trends & Analysis",
          href: "/dashboard3",
          icon: TrendingUp,
        },
        {
          title: "Comprehensive Analysis",
          href: "/analysis",
          icon: Activity,
        },
        {
          title: "KPI Dashboard",
          href: "/kpi",
          icon: BarChart3,
        },
        {
          title: "Financial Reports",
          href: "/reports",
          icon: FileText,
        },
      ],
    },
    {
      group: "Operations",
      items: [
        {
          title: "Data Entry",
          href: "/data-entry",
          icon: Wallet,
        },
        {
          title: "Procurement",
          href: "/procurement",
          icon: Activity,
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen bg-slate-950 text-slate-100 transition-all duration-300 border-r border-slate-800",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center h-20 px-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div
            className={cn(
              "flex flex-col transition-opacity duration-200",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">
              FinSight
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              CEO Dashboard
            </span>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-24 h-6 w-6 rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 z-50 hidden md:flex"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-none">
        {navItems.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {!isCollapsed && (
              <h4 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.group}
              </h4>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <TooltipProvider key={item.href} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                            isActive
                              ? "bg-indigo-600/10 text-indigo-400"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                          )}
                          <item.icon
                            className={cn(
                              "w-5 h-5 flex-shrink-0 transition-colors",
                              isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-100"
                            )}
                          />
                          <span
                            className={cn(
                              "font-medium transition-all duration-200 whitespace-nowrap",
                              isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                            )}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-slate-100">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Section */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex flex-col gap-2">
          {!isCollapsed && (
             <Link
             href="/settings"
             className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
           >
             <Settings className="w-5 h-5" />
             <span>Settings</span>
           </Link>
          )}
         
          <button className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors w-full",
            isCollapsed && "justify-center"
          )}>
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
