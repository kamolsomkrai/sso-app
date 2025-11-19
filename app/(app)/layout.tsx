import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  PieChart,
  Wallet,
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Sidebar Component
function Sidebar() {
  return (
    <div className="flex h-full flex-col border-r bg-slate-900 text-slate-50 w-64">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
            <Wallet className="w-5 h-5" />
          </div>
          FinSight
        </div>
        <p className="text-xs text-slate-400 mt-1">Hospital Finance System</p>
      </div>

      <div className="flex-1 px-4 space-y-2">
        <nav className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Analytics</h4>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-600/10 text-brand-400 font-medium border border-brand-600/20">
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          <Link href="/dashboard/budget" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
            <PieChart className="w-5 h-5" />
            Budget Plan
          </Link>
        </nav>

        <nav className="space-y-1 mt-6">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Operations</h4>
          <Link href="/data-entry" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
            <Wallet className="w-5 h-5" />
            Data Entry
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <button className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/30 transition-colors">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0 bg-slate-900">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}