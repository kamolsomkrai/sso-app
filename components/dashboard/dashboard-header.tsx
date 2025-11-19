"use client";

import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  LayoutGrid,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  fiscalYear: number;
  onFiscalYearChange: (year: number) => void;
  onExport: () => void;
}

export function DashboardHeader({ fiscalYear, onFiscalYearChange, onExport }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">

      {/* Title Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <LayoutGrid className="w-6 h-6 text-brand-600" />
          Executive Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Financial Overview & Operational Analysis for FY{fiscalYear}
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Fiscal Year Selector */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm p-1">
          <CalendarIcon className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          <Select value={String(fiscalYear)} onValueChange={(v) => onFiscalYearChange(Number(v))}>
            <SelectTrigger className="h-8 w-[100px] border-none shadow-none focus:ring-0 text-slate-700 font-medium">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2569">FY 2569</SelectItem>
              <SelectItem value="2568">FY 2568</SelectItem>
              <SelectItem value="2567">FY 2567</SelectItem>
              <SelectItem value="2566">FY 2566</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" className="h-10 bg-white">
          <Filter className="w-4 h-4 mr-2 text-slate-500" />
          Filters
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onExport}
          className="h-10 bg-brand-600 hover:bg-brand-700 shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>

        {/* User Profile / Notifications */}
        <div className="pl-3 ml-3 border-l border-slate-200 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-brand-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </Button>
          <Avatar className="w-8 h-8 border border-slate-200">
            <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
            <AvatarFallback className="bg-brand-100 text-brand-700">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}