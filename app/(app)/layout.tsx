"use client";

import React, { useState } from "react";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernHeader } from "@/components/layout/modern-header";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50">
        <ModernSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      {/* Main Content Wrapper */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isCollapsed ? "ml-20" : "ml-72"
        )}
      >
        <ModernHeader />
        
        <main className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}