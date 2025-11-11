// components/metric-card.tsx

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export const MetricCard = ({ title, value, change, changeType = "neutral", icon: Icon }: MetricCardProps) => {
  const changeColorClass = {
    positive: "text-green-600", // (matching existing style)
    negative: "text-red-600",   // (matching existing style)
    neutral: "text-gray-500",   // (matching existing style)
  }[changeType];

  return (
    <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        {change && (
          <p className={cn("text-sm font-medium", changeColorClass)}>
            {change}
          </p>
        )}
      </div>
    </Card>
  );
};