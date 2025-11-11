// app/(app)/dashboard/page.tsx

'use client';

import { useAuth } from '@/components/auth-provider';
import { useSearchParams } from 'next/navigation';
import {
  // ExecutiveView, //
  DepartmentView,
  CategoryView,
  ItemTableView,
} from '@/components/dashboard-views';
import { Suspense } from 'react';
import { HybridExecutiveView } from '@/components/dashboard-views/hybrid-executive-view'; //

// ใช้ Suspense เพื่อให้ useSearchParams ทำงานได้ถูกต้อง
function DashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  // ดึงค่า state จาก URL
  const deptId = searchParams.get('deptId'); // (นี่คือ String UUID)
  const catId = searchParams.get('catId'); // (นี่คือ String UUID)

  if (!user) return null;

  // Logic การแสดงผลตาม Role และ Drill-down
  if (catId) {
    if (user.role === 'OPERATOR') {
      return <ItemTableView user={user} deptId={deptId!} catId={catId} fiscalYear={2569} />;
    }
    return <CategoryView user={user} deptId={deptId!} catId={catId} />;
  }

  if (deptId) {
    return <DepartmentView user={user} deptId={deptId} />;
  }

  if (user.role === 'EXECUTIVE') {
    return <HybridExecutiveView user={user} />;
  }

  if (user.role === 'DEPT_HEAD' && user.departmentId) {
    // (user.departmentId ควรเป็น String UUID ของ BudgetCategory L2)
    return <DepartmentView user={user} deptId={user.departmentId} />;
  }

  if (user.role === 'GROUP_HEAD' && user.departmentId) {
    return <DepartmentView user={user} deptId={user.departmentId} />;
  }

  // Fallback
  return (
    <div className="text-center p-8">
      <h2 className="text-xl">ยินดีต้อนรับ, {user.name}</h2>
      <p>ไม่พบมุมมองที่กำหนดค่าไว้สำหรับ Role ของคุณ</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}