import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, Activity } from "lucide-react";
import { KpiMetric } from "@/lib/types/dashboard";

interface KpiMetricCardProps {
  metric: KpiMetric;
  icon?: React.ElementType;
}

export function KpiMetricCard({ metric, icon: Icon = Activity }: KpiMetricCardProps) {
  const isPositive = metric.variance >= 0;
  const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  // Dynamic Color based on semantic status
  const statusColor = {
    success: "text-success-600",
    danger: "text-danger-600",
    warning: "text-warning-500",
  }[metric.status];

  return (
    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: `var(--color-${metric.status}-600)` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
        <div className={`p-2 rounded-full bg-secondary`}>
          <Icon className={`h-4 w-4 ${statusColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(metric.amount)}
        </div>
        <div className="flex items-center text-xs mt-1 space-x-2">
          <span className="text-muted-foreground">Target: {new Intl.NumberFormat('th-TH', { notation: 'compact' }).format(metric.target)}</span>
          <div className={`flex items-center font-medium ${statusColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {Math.abs(metric.variancePercent).toFixed(1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}