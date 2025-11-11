// components/dashboard-views.tsx

'use client';

import React from 'react';
import { useAuth, User } from './auth-provider';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';

// -------------------------------------------------------------------
// 1. Breadcrumbs Helper
// -------------------------------------------------------------------

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

// -------------------------------------------------------------------
// 2. L1 View (Original - Kept for reference or other roles)
// -------------------------------------------------------------------

export function ExecutiveView({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Original Executive Dashboard (L1)</h2>
      <p>(This view is now replaced by HybridExecutiveView for Executives)</p>
    </div>
  );
}

// -------------------------------------------------------------------
// 3. L2 View (Upgraded with L3/L4 Accordion Drill-Down)
// -------------------------------------------------------------------

export function DepartmentView({ user, deptId }: { user: User; deptId: string }) {
  const router = useRouter();
  const fiscalYear = 2569;

  // 1. Query L3 (Categories) จาก API
  const { data: categories, isLoading: isLoadingCategories } = useQuery<any[]>({
    queryKey: ['l2Categories', fiscalYear, deptId],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/l2-categories', {
        params: {
          year: fiscalYear,
          dept_id: deptId,
        },
      });
      return data;
    },
  });

  if (isLoadingCategories) {
    return <div>Loading Categories...</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        กลับไปหน้า L1 Hub
      </Button>

      <h2 className="text-3xl font-bold">L2 Dashboard: แผนก {deptId}</h2>
      <p className="text-gray-500">
        แสดงหมวดหมู่ (L3) ทั้งหมดของแผนกนี้ คลิกที่รายการเพื่อดู "ราย list" (L4)
      </p>

      {/* 2. สร้าง Accordion L3 -> L4 */}
      <Accordion type="single" collapsible className="w-full">
        {categories?.map((category: any) => (
          <AccordionItem value={category.id} key={category.id} className="border-b">

            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <span>{category.name} (L3)</span>
                <BudgetInsight
                  plan={category.totalPlan}
                  actual={category.totalActual}
                />
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <Card className="p-4 bg-gray-50/50">
                <h4 className="text-md font-semibold mb-4">
                  "ราย LIST" (L4)
                </h4>
                {/* 3. เรียก ItemTableView (L4) */}
                <ItemTableView
                  user={user}
                  deptId={deptId}
                  catId={category.id} //
                  fiscalYear={fiscalYear}
                />
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// -------------------------------------------------------------------
// 4. L3 View (Original - Kept for roles landing directly here)
// -------------------------------------------------------------------

export function CategoryView({ user, deptId, catId }: { user: User; deptId: string; catId: string }) {
  const router = useRouter();
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

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          รายการค่าใช้จ่าย (L4)
        </h3>
        <ItemTableView user={user} deptId={deptId} catId={catId} fiscalYear={2569} />
      </Card>
    </div>
  );
}

// -------------------------------------------------------------------
// 5. L4 View (Upgraded with 5-Year Comparison)
// -------------------------------------------------------------------

export function ItemTableView({ user, deptId, catId, fiscalYear }: { user: User; deptId: string; catId: string; fiscalYear: number }) {

  // 1. Query L4 (Items) จาก API
  const { data: items, isLoading } = useQuery<any[]>({
    queryKey: ['l4Items', fiscalYear, catId],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/l4-items', {
        params: {
          year: fiscalYear,
          cat_id: catId,
        },
      });
      return data;
    },
  });

  if (isLoading) return <p>Loading items...</p>;
  if (!items || items.length === 0) return <p className="text-gray-500">ไม่พบรายการ (L4) ในหมวดหมู่นี้</p>;

  // 2. Dynamic Headers
  const yearHeaders = [
    { key: `plan_${fiscalYear}`, label: `แผนปี ${fiscalYear}` },
    { key: `actual_${fiscalYear}`, label: `จริงปี ${fiscalYear}` },
    { key: `actual_${fiscalYear - 1}`, label: `จริงปี ${fiscalYear - 1}` },
    { key: `actual_${fiscalYear - 2}`, label: `จริงปี ${fiscalYear - 2}` },
    { key: `actual_${fiscalYear - 3}`, label: `จริงปี ${fiscalYear - 3}` },
    { key: `actual_${fiscalYear - 4}`, label: `จริงปี ${fiscalYear - 4}` },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>รายการ (L4)</TableHead>
          <TableHead>แก้ไขล่าสุด (โดย)</TableHead>
          {yearHeaders.map(h => (
            <TableHead key={h.key} className="text-right">{h.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map((item: any) => (
          <TableRow key={item.id} className="bg-white">
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-xs text-gray-500">
              {new Date(item.updatedAt).toLocaleDateString('th-TH')}
              <br />
              ({item.updatedBy})
            </TableCell>
            {/* 3. Dynamic Cells */}
            {yearHeaders.map(h => (
              <TableCell
                key={h.key}
                className={cn(
                  "text-right",
                  h.key.startsWith('plan') && "font-bold text-primary",
                  h.key === `actual_${fiscalYear}` && "font-semibold text-blue-600"
                )}
              >
                {formatCurrency(item[h.key] || 0)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// -------------------------------------------------------------------
// 6. Helper Component (แสดงสัญลักษณ์ 📈/📉)
// -------------------------------------------------------------------

interface BudgetInsightProps {
  plan: number;
  actual: number;
}
function BudgetInsight({ plan, actual }: BudgetInsightProps) {
  const variance = actual - plan;
  const rate = plan === 0 ? 0 : (actual / plan) * 100;
  let Icon = Minus;
  let color = "text-gray-500";
  let text = "ตามเป้า";

  if (variance > 0) {
    Icon = TrendingUp;
    color = "text-red-600";
    text = `+${rate}% เกินเป้า ${formatCurrency(variance)}`;
  } else if (variance < 0) {
    Icon = TrendingDown;
    color = "text-green-600";
    text = `-${rate}% ต่ำกว่าเป้า ${formatCurrency(Math.abs(variance))}`;
  }

  return (
    <div className={cn("flex items-center space-x-2", color)}>
      <Icon className="h-5 w-5" />
      <div className="text-right">
        <div className="text-sm font-semibold">{text}</div>
        <div className="text-xs font-normal text-gray-500">
          ใช้จริง {formatCurrency(actual)} / เป้าหมาย {formatCurrency(plan)}
        </div>
      </div>
    </div>
  );
}