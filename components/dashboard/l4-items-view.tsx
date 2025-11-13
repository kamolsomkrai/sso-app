// components/dashboard/l4-items-view.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface L4ItemsViewProps {
  fiscalYear?: number;
}

export function L4ItemsView({ fiscalYear = 2569 }: L4ItemsViewProps) {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const [selectedYear, setSelectedYear] = useState(fiscalYear);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['l4-items', categoryId, selectedYear],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/l4-items', {
        params: {
          fiscalYear: selectedYear,
          categoryId
        }
      });
      return data;
    },
    enabled: !!categoryId
  });

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
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
            <h1 className="text-3xl font-bold tracking-tight">รายการจัดซื้อจัดจ้าง</h1>
            <p className="text-muted-foreground">
              รายละเอียดรายการระดับ L4 พร้อมข้อมูลย้อนหลัง
            </p>
          </div>
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

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการทั้งหมด</CardTitle>
          <CardDescription>
            แสดงแผนและผลจริงของแต่ละรายการ พร้อมข้อมูลเปรียบเทียบ 3 ปี
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รายการ</TableHead>
                <TableHead>หน่วย</TableHead>
                <TableHead className="text-right">แผนปี {selectedYear}</TableHead>
                <TableHead className="text-right">จริงปี {selectedYear}</TableHead>
                <TableHead className="text-right">จริงปี {selectedYear - 1}</TableHead>
                <TableHead className="text-right">จริงปี {selectedYear - 2}</TableHead>
                <TableHead className="text-right">ผลต่าง</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.procurementCode && (
                        <div className="text-xs text-muted-foreground">
                          {item.procurementCode}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.unit && (
                      <div className="text-sm">
                        {item.quantity} {item.unit}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.plan)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.currentYearActual)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.lastYearActual)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.twoYearsAgoActual)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {formatCurrency(item.variance)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.variance === 0 ? "default" :
                          item.variance > 0 ? "destructive" : "secondary"
                      }
                    >
                      {item.variance === 0 ? "ตามแผน" :
                        item.variance > 0 ? "เกินแผน" : "ต่ำกว่าแผน"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบรายการในหมวดหมู่นี้
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">รวมแผนปี {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.reduce((sum: number, item: any) => sum + item.plan, 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">รวมจริงปี {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.reduce((sum: number, item: any) => sum + item.currentYearActual, 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">ผลต่างรวม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.reduce((sum: number, item: any) => sum + item.variance, 0) >= 0
                ? 'text-green-600' : 'text-red-600'
                }`}>
                {formatCurrency(data.reduce((sum: number, item: any) => sum + item.variance, 0))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}