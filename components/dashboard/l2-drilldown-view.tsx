// components/dashboard/l2-drilldown-view.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface L2DrilldownViewProps {
  fiscalYear?: number;
}

export function L2DrilldownView({ fiscalYear = 2569 }: L2DrilldownViewProps) {
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId');
  const type = searchParams.get('type') as 'revenue' | 'expense';
  const [selectedYear, setSelectedYear] = useState(fiscalYear);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['l2-drilldown', parentId, selectedYear],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/l2-drilldown', {
        params: {
          fiscalYear: selectedYear,
          parentId
        }
      });
      return data;
    },
    enabled: !!parentId
  });

  const handleDrillDown = (categoryId: string) => {
    router.push(`/dashboard/l3?parentId=${categoryId}&fiscalYear=${selectedYear}&type=${type}`);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {type === 'revenue' ? 'รายได้' : 'รายจ่าย'} - ระดับ L2
            </h1>
            <p className="text-muted-foreground">
              รายละเอียดหมวดหมู่ระดับที่ 2
            </p>
          </div>
        </div>

        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-32">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2566, 2567, 2568, 2569, 2570].map(year => (
              <SelectItem key={year} value={year.toString()}>
                ปี {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* L2 Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((category: any) => (
          <Card
            key={category.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown(category.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription>{category.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ใช้จริง</span>
                  <span className="text-lg font-bold">{formatCurrency(category.actual)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">แผน</span>
                  <span className="text-sm">{formatCurrency(category.plan)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ผลต่าง</span>
                  <span className={`text-sm ${category.variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {formatCurrency(category.variance)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {category.childrenCount} หมวดหมู่ย่อย
                  </span>
                  <Button variant="ghost" size="sm">
                    ดูรายละเอียด
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              ไม่พบข้อมูลหมวดหมู่ระดับ L2
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}