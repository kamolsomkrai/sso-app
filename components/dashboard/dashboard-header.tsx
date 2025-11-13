// components/dashboard/dashboard-header.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter } from 'lucide-react';

interface DashboardHeaderProps {
  fiscalYear: number;
  onFiscalYearChange: (year: number) => void;
  onExport: () => void;
}

export function DashboardHeader({ fiscalYear, onFiscalYearChange, onExport }: DashboardHeaderProps) {
  const fiscalYears = [2566, 2567, 2568, 2569, 2570];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard งบประมาณ</h1>
            <p className="text-muted-foreground">
              ภาพรวมงบประมาณและประสิทธิภาพทางการเงิน
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={fiscalYear.toString()} onValueChange={(value) => onFiscalYearChange(parseInt(value))}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    ปี {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}