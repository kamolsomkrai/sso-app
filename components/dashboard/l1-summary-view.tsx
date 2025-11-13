// components/dashboard/l1-summary-view.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { KPICard } from './kpi-cards';
import { MonthlyTrendChart } from './monthly-trend-chart';
import { CategoryBreakdownChart } from './category-breakdown-chart';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface L1SummaryViewProps {
  fiscalYear?: number;
}

export function L1SummaryView({ fiscalYear = 2569 }: L1SummaryViewProps) {
  const [selectedYear, setSelectedYear] = useState(fiscalYear);
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['l1-summary', selectedYear],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/l1-summary', {
        params: { fiscalYear: selectedYear }
      });
      return data;
    },
  });

  const handleDrillDown = (type: 'revenue' | 'expense', categoryId: string) => {
    router.push(`/dashboard/l2?type=${type}&parentId=${categoryId}&fiscalYear=${selectedYear}`);
  };

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        เกิดข้อผิดพลาดในการโหลดข้อมูล
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ภาพรวมงบประมาณ</h1>
          <p className="text-muted-foreground">
            สรุปภาพรวมรายได้และรายจ่ายทั้งหมด
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <KPICard
              title="รายได้รวม"
              value={data?.summary.revenue.actual || 0}
              plan={data?.summary.revenue.plan || 0}
              type="revenue"
              onClick={() => {
                const revenueCategory = data?.categories.find((c: any) => c.type === 'revenue');
                if (revenueCategory) {
                  handleDrillDown('revenue', revenueCategory.id);
                }
              }}
            />
            <KPICard
              title="รายจ่ายรวม"
              value={data?.summary.expense.actual || 0}
              plan={data?.summary.expense.plan || 0}
              type="expense"
              onClick={() => {
                const expenseCategory = data?.categories.find((c: any) => c.type === 'expense');
                if (expenseCategory) {
                  handleDrillDown('expense', expenseCategory.id);
                }
              }}
            />
            <KPICard
              title="กำไร/ขาดทุน"
              value={(data?.summary.revenue.actual || 0) - (data?.summary.expense.actual || 0)}
              plan={(data?.summary.revenue.plan || 0) - (data?.summary.expense.plan || 0)}
              type="revenue"
            />
            <KPICard
              title="อัตราการใช้จ่าย"
              value={data?.summary.expense.actual || 0}
              plan={data?.summary.revenue.actual || 0}
              type="expense"
              format="percentage"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="trends">เทรนด์</TabsTrigger>
          <TabsTrigger value="breakdown">แบ่งตามหมวดหมู่</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>เทรนด์รายได้-รายจ่าย</CardTitle>
                <CardDescription>
                  แสดงการเปลี่ยนแปลงรายได้และรายจ่ายตลอดปีงบประมาณ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80" />
                ) : (
                  <MonthlyTrendChart data={data?.monthlyTrend || []} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สรุปตามหมวดหมู่</CardTitle>
                <CardDescription>
                  แสดงสัดส่วนรายได้และรายจ่ายแบ่งตามหมวดหมู่
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80" />
                ) : (
                  <CategoryBreakdownChart data={data?.categories || []} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>วิเคราะห์เทรนด์เชิงลึก</CardTitle>
              <CardDescription>
                การวิเคราะห์เชิงลึกของเทรนด์ทางการเงิน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                กำลังพัฒนาระบบวิเคราะห์เทรนด์เชิงลึก
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดตามหมวดหมู่</CardTitle>
              <CardDescription>
                ข้อมูลเชิงลึกของแต่ละหมวดหมู่
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.categories.map((category: any) => (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          แผน: {new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB',
                            minimumFractionDigits: 0,
                          }).format(category.plan)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB',
                            minimumFractionDigits: 0,
                          }).format(category.actual)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDrillDown(category.type, category.id)}
                        >
                          ดูรายละเอียด
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}