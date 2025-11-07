// components/dashboard-views.tsx

'use client';

import React, { useState } from 'react';
import { useAuth } from './auth-provider';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from './ui/toggle-group';
import { Card } from './ui/card';
import { QuarterlyKpiCard, RootCauseAnalysisCard } from './kpi-card';
import { TargetActualChart, BreakdownPieChart } from './charts';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { formatCurrency } from '@/lib/utils';
// import { Decimal } from '@prisma/client/runtime/library'; // <--- ลบออก: นี่คือสาเหตุของ Error

// Mock Data Types (ควรย้ายไปไฟล์ types.ts)
interface User {
  id: string;
  name: string;
  role: string;
  departmentId?: string;
}
interface QuarterlyPerf {
  quarter: number;
  target: number;
  actual: number;
  variance: number;
}
interface MonthlyData {
  name: string; // 'ต.ค.', 'พ.ย.', ...
  target: number;
  actual: number;
}
interface OverviewResponse {
  quarterly: QuarterlyPerf[];
  monthly: MonthlyData[];
}
interface VarianceResponse {
  notes: any[]; // VarianceNote
  breakdown: { name: string; value: number; id: string }[]; // by Dept
}
interface ItemResponse {
  id: string;
  name: string;
  details: string | null;
  actualCost: number; // <--- เปลี่ยนจาก Decimal เป็น number
  date: string;
}

// L1: Executive View
export function ExecutiveView({ user }: { user: User }) {
  const router = useRouter();
  const [fiscalYear, setFiscalYear] = useState('2024'); // ปีงบ 2567
  const [view, setView] = useState('performance'); // 'performance' vs 'trend'
  const [selectedQ, setSelectedQ] = useState<number | null>(null);

  // Query: L1 Overview (Target vs Actual)
  const { data: overviewData, isLoading: isLoadingOverview } =
    useQuery<OverviewResponse>({
      queryKey: ['performance', 'overview', fiscalYear],
      queryFn: async () => {
        const { data } = await axios.get(
          `/api/performance/overview?fy=${fiscalYear}`,
        );
        return data;
      },
    });

  // Query: L1 Variance Analysis (Root Cause)
  const { data: varianceData, isLoading: isLoadingVariance } =
    useQuery<VarianceResponse>({
      queryKey: ['performance', 'variance', fiscalYear, selectedQ],
      queryFn: async () => {
        const { data } = await axios.get(
          `/api/performance/variance?fy=${fiscalYear}&quarter=${selectedQ}`,
        );
        return data;
      },
      enabled: !!selectedQ, // รัน query ต่อเมื่อมีการเลือก Q
    });

  const handleDrilldown = (deptId: string) => {
    router.push(`/dashboard?deptId=${deptId}`);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Executive Dashboard (L1)</h2>
        <div className="flex items-center gap-4">
          <Select value={fiscalYear} onValueChange={setFiscalYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกปีงบประมาณ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">ปีงบ 2567</SelectItem>
              <SelectItem value="2023">ปีงบ 2566</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v)}
          >
            <ToggleGroupItem value="performance">เทียบเป้าหมาย</ToggleGroupItem>
            <ToggleGroupItem value="trend">แนวโน้ม 5 ปี</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* View Content */}
      {view === 'performance' ? (
        <div className="space-y-6">
          {/* KPI Cards (4 Quarters) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingOverview && <p>Loading KPIs...</p>}
            {overviewData?.quarterly.map((q) => (
              <QuarterlyKpiCard
                key={q.quarter}
                quarter={q.quarter}
                target={q.target}
                actual={q.actual}
                variance={q.variance}
                isSelected={selectedQ === q.quarter}
                onClick={() =>
                  setSelectedQ(q.quarter === selectedQ ? null : q.quarter)
                }
              />
            ))}
          </div>

          {/* Main Chart (Monthly Target vs Actual) */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              ประสิทธิภาพรายจ่ายเทียบเป้า (รายเดือน) - ปีงบ {parseInt(fiscalYear) + 543}
            </h3>
            {isLoadingOverview && <p>Loading Chart...</p>}
            {overviewData?.monthly && (
              <TargetActualChart data={overviewData.monthly} />
            )}
          </Card>

          {/* Drill-Down Section (Root Cause) */}
          {selectedQ && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RootCauseAnalysisCard
                data={varianceData?.notes ?? []}
                isLoading={isLoadingVariance}
              />
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  สัดส่วนผลต่าง Q{selectedQ} (จำแนกตามหน่วยงาน)
                </h3>
                {isLoadingVariance && <p>Loading Breakdown...</p>}
                {varianceData?.breakdown && (
                  <BreakdownPieChart
                    data={varianceData.breakdown}
                    onDataClick={(entry) => handleDrilldown(entry.id)}
                  />
                )}
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-4 text-center">
          <h3 className="text-lg font-semibold">มุมมอง "แนวโน้ม 5 ปี"</h3>
          <p>(สร้างกราฟ 5-Year Trend ที่นี่)</p>
          {/* <FiveYearTrendChart /> */}
        </Card>
      )}
    </div>
  );
}

// Breadcrumbs Helper
function Breadcrumbs({ path }: { path: { name: string; href: string }[] }) {
  const router = useRouter();
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      {path.map((p, i) => (
        <React.Fragment key={p.href}>
          {i > 0 && <span>/</span>}
          <a
            href={p.href}
            onClick={(e) => {
              e.preventDefault();
              router.push(p.href);
            }}
            className={
              i === path.length - 1
                ? 'font-medium text-gray-700'
                : 'hover:underline'
            }
          >
            {p.name}
          </a>
        </React.Fragment>
      ))}
    </nav>
  );
}

// L2: Department View
export function DepartmentView({ user, deptId }: { user: User; deptId: string }) {
  const router = useRouter();
  // TODO: Fetch data for this department (deptId)
  const path = [
    { name: 'หน้าหลัก (L1)', href: '/dashboard' },
    { name: `แผนก ${deptId}`, href: `/dashboard?deptId=${deptId}` },
  ];

  const handleDrilldown = (catId: string) => {
    router.push(`/dashboard?deptId=${deptId}&catId=${catId}`);
  };

  return (
    <div className="space-y-6">
      {user.role === 'EXECUTIVE' && <Breadcrumbs path={path} />}
      <h2 className="text-2xl font-bold">Department Dashboard (L2)</h2>
      <p>แสดงข้อมูลของแผนก: {deptId}</p>

      {/* TODO: Add L2 KPIs, Target/Actual Chart for this Dept */}

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          สัดส่วนค่าใช้จ่ายตามกลุ่มงาน (L3)
        </h3>
        {/* Mock Drilldown */}
        <div className="flex gap-4">
          <Button onClick={() => handleDrilldown('software')}>
            Drill to Software
          </Button>
          <Button onClick={() => handleDrilldown('hardware')}>
            Drill to Hardware
          </Button>
        </div>
        {/* <BreakdownPieChart data={...} onDataClick={...} /> */}
      </Card>
    </div>
  );
}

// L3: Category View
export function CategoryView({ user, deptId, catId }: { user: User; deptId: string; catId: string }) {
  const router = useRouter();
  // TODO: Fetch data for this category (deptId, catId)
  const path = [
    { name: 'หน้าหลัก (L1)', href: '/dashboard' },
    { name: `แผนก ${deptId}`, href: `/dashboard?deptId=${deptId}` },
    { name: `กลุ่มงาน ${catId}`, href: `/dashboard?deptId=${deptId}&catId=${catId}` },
  ];

  return (
    <div className="space-y-6">
      {(user.role === 'EXECUTIVE' || user.role === 'DEPT_HEAD') && (
        <Breadcrumbs path={path} />
      )}
      <h2 className="text-2xl font-bold">Category Dashboard (L3)</h2>
      <p>
        แสดงข้อมูลของแผนก: {deptId}, กลุ่มงาน: {catId}
      </p>

      {/* TODO: Add L3 KPIs, Target/Actual Chart for this Category */}

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          รายการค่าใช้จ่าย (L4)
        </h3>
        <ItemTableView user={user} deptId={deptId} catId={catId} />
      </Card>
    </div>
  );
}

// L4: Item Table View
// L4: Item Table View
export function ItemTableView({ user, deptId, catId }: { user: User; deptId: string; catId: string }) {
  // TODO: Fetch item data (L4)
  const { data: items, isLoading } = useQuery<any[]>({ //
    queryKey: ['items', deptId, catId],
    queryFn: async () => {
      // API นี้ยังไม่ได้สร้าง (GET /api/items?deptId=...&catId=...)
      // return (await axios.get(`/api/items?deptId=${deptId}&catId=${catId}`)).data;

      // Mock data L4 - (อัปเดตให้มีข้อมูล 5 ปี)
      // นี่คือ "ราย list" ที่ผู้บริหารต้องการเห็น
      return [
        {
          id: 'item1',
          name: 'AWS WAF License (1 ปี)',
          details: 'สำหรับ 10 เว็บไซต์ (แผนก IT)',
          date: '2024-10-15T10:00:00Z',
          // ข้อมูลเปรียบเทียบ 5 ปี (ดึงจาก CSVs)
          year2569_plan: 75000,
          year2568_actual: 72000,
          year2567_actual: 70000,
          year2566_actual: 65000,
          year2565_actual: 60000,
        },
        {
          id: 'item2',
          name: 'Adobe Creative Cloud (1 ปี)',
          details: 'สำหรับทีม Design (แผนก IT)',
          date: '2024-10-20T10:00:00Z',
          // ข้อมูลเปรียบเทียบ 5 ปี
          year2569_plan: 25000,
          year2568_actual: 25000,
          year2567_actual: 22000,
          year2566_actual: 22000,
          year2565_actual: 0, // (เพิ่งเริ่มซื้อ)
        },
      ];
    },
  });

  if (isLoading) return <p>Loading items...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>รายการ (L4)</TableHead>
          <TableHead>รายละเอียด</TableHead>
          <TableHead>วันที่ตั้งแผน</TableHead>
          <TableHead className="text-right">แผนปี 69</TableHead>
          <TableHead className="text-right">จริงปี 68</TableHead>
          <TableHead className="text-right">จริงปี 67</TableHead>
          <TableHead className="text-right">จริงปี 66</TableHead>
          <TableHead className="text-right">จริงปี 65</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.details}</TableCell>
            <TableCell>
              {new Date(item.date).toLocaleDateString('th-TH')}
            </TableCell>
            <TableCell className="text-right font-bold text-primary">
              {formatCurrency(item.year2569_plan)}
            </TableCell>
            <TableCell className="text-right">{formatCurrency(item.year2568_actual)}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.year2567_actual)}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.year2566_actual)}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.year2565_actual)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}