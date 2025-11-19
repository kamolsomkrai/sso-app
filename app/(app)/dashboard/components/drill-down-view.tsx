"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner"; // Assuming 'sonner' for toasts as per modern Next.js stacks

import { UnifiedDrillDownTable } from "@/components/dashboard/unified-drill-down-table";
import { SmartBreadcrumb } from "@/components/dashboard/smart-breadcrumb";
import { ContextualActionPanel } from "@/components/dashboard/contextual-action-panel";
import { DrillDownResponse, DrillDownRow } from "@/lib/types/drilldown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DrillDownView({ fiscalYear }: { fiscalYear: number }) {
  // --- State Management ---
  const [history, setHistory] = useState<{ id: string | null; level: number; name: string }[]>([
    { id: null, level: 0, name: "Strategic Overview" }
  ]);

  const currentContext = history[history.length - 1];

  // --- Data Fetching ---
  const { data, isLoading, error } = useQuery<DrillDownResponse>({
    queryKey: ["drillDown", fiscalYear, currentContext.id, currentContext.level],
    queryFn: async () => {
      const res = await axios.get("/api/dashboard/drill-down", {
        params: {
          fiscalYear,
          parentId: currentContext.id,
          level: currentContext.level,
        },
      });
      return res.data;
    },
    // Keep previous data while loading for smoother transition effect
    placeholderData: (previousData) => previousData,
  });

  // --- Interaction Handlers ---

  // 1. Drill Down (Click Row)
  const handleDrillDown = (row: DrillDownRow) => {
    setHistory((prev) => [
      ...prev,
      { id: row.id, level: currentContext.level + 1, name: row.name }
    ]);
  };

  // 2. Navigate Breadcrumb
  const handleNavigate = (targetId: string | null, targetLevel: number) => {
    const targetIndex = history.findIndex(h => h.id === targetId);
    if (targetIndex !== -1) {
      setHistory(history.slice(0, targetIndex + 1));
    } else {
      setHistory([{ id: null, level: 0, name: "Strategic Overview" }]);
    }
  };

  // 3. Back Button
  const handleBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  // 4. Contextual Action Handler (Toolbar)
  const handleContextAction = (actionId: string) => {
    console.log(`Global Action: ${actionId} at Level ${currentContext.level}`);
    toast.info(`Action Triggered: ${actionId}`, {
      description: `Applied to ${currentContext.name}`
    });

    if (actionId === "add_entry") {
      // Example: Redirect to data entry or open modal
      // router.push('/data-entry');
    }
  };

  // 5. Row Specific Action Handler (Dropdown)
  const handleRowAction = (actionId: string, row: DrillDownRow) => {
    console.log(`Row Action: ${actionId} on ${row.name}`);
    toast.success(`${actionId} for ${row.name}`);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- Navigation & Controls --- */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SmartBreadcrumb
            items={history}
            onNavigate={handleNavigate}
          />
          {history.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleBack} className="mb-6 hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        {/* --- Tactical Operations Panel --- */}
        <ContextualActionPanel
          level={currentContext.level}
          contextName={currentContext.name}
          onAction={handleContextAction}
        />
      </div>

      {/* --- Main Content Area --- */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          {error ? (
            <div className="p-6 text-center rounded-xl bg-red-50 border border-red-100 text-red-600">
              <p className="font-semibold">Unable to load financial data.</p>
              <p className="text-sm mt-1">Please verify your connection and try again.</p>
              <Button variant="outline" className="mt-4 border-red-200 text-red-700 hover:bg-red-100" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <UnifiedDrillDownTable
              data={data?.items || []}
              isLoading={isLoading}
              onDrillDown={handleDrillDown}
              onRowAction={handleRowAction}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}