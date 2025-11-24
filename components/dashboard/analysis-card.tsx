"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface Insight {
  type: "positive" | "negative" | "neutral" | "warning";
  message: string;
}

interface AnalysisCardProps {
  insights: Insight[];
}

export function AnalysisCard({ insights }: AnalysisCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "positive": return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "negative": return <TrendingUp className="w-5 h-5 text-rose-500 transform rotate-180" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-800">AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex gap-3 p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
              <div className="mt-0.5">{getIcon(insight.type)}</div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {insight.message}
              </p>
            </div>
          ))}
          
          {insights.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm">
              No significant insights available at this time.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
