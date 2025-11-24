"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ModernHeader() {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      {/* Left: Breadcrumbs */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-800">
          {breadcrumbs[breadcrumbs.length - 1] || "Dashboard"}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="text-slate-400">Home</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb}>
              <span className="text-slate-300">/</span>
              <span className={index === breadcrumbs.length - 1 ? "text-indigo-600 font-medium" : ""}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search anything..." 
            className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-2 pr-4 py-1 h-auto hover:bg-slate-100 rounded-full border border-slate-200">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-xs hidden md:flex">
                  <span className="font-semibold text-slate-700">Dr. Prom Jaiboriban</span>
                  <span className="text-slate-500">Hospital Director</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-rose-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
