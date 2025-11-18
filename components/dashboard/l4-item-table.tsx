'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { L4ItemData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function L4ItemTable({ data }: { data: L4ItemData[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-center text-gray-500 py-4">
        ไม่พบรายการ (L4) ในหมวดหมู่นี้
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ชื่อรายการ (L4)</TableHead>
          <TableHead className="text-right">คงคลัง</TableHead>
          <TableHead className="text-right">แผนปีปัจจุบัน</TableHead>
          <TableHead className="text-right">ใช้จริงปีปัจจุบัน</TableHead>
          <TableHead className="text-right hidden md:table-cell">ใช้จริงปีก่อน</TableHead>
          <TableHead className="text-right hidden md:table-cell">ใช้จริง 2 ปีก่อน</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary">
                {item.inventory.toLocaleString()} {item.unit}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-gray-600">
              {formatCurrency(item.planCurrentYear)}
            </TableCell>
            <TableCell className="text-right font-semibold text-blue-700">
              {formatCurrency(item.actualCurrentYear)}
            </TableCell>
            <TableCell className="text-right hidden md:table-cell">
              {formatCurrency(item.actualLastYear)}
            </TableCell>
            <TableCell className="text-right hidden md:table-cell">
              {formatCurrency(item.actual2YearsAgo)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}