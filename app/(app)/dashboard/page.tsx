// app/dashboard/page.tsx

'use client';

import { useAuth } from '@/components/auth-provider';
import { useSearchParams } from 'next/navigation';
import {
  ExecutiveView,
  DepartmentView,
  CategoryView,
  ItemTableView,
} from '@/components/dashboard-views';
import { Suspense } from 'react';

// ใช้ Suspense เพื่อให้ useSearchParams ทำงานได้ถูกต้อง
function DashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // ดึงค่า state จาก URL
  const deptId = searchParams.get('deptId');
  const catId = searchParams.get('catId');

  if (!user) return null;

  // Logic การแสดงผลตาม Role และ Drill-down
  // 1. ถ้ามี catId -> แสดง L4 (Item Table) หรือ L3 (Category View)
  if (catId) {
    if (user.role === 'OPERATOR') {
      // Operator เห็นแค่ตารางงานตัวเอง
      return <ItemTableView user={user} deptId={deptId} catId={catId} />;
    }
    return <CategoryView user={user} deptId={deptId} catId={catId} />;
  }

  // 2. ถ้ามี deptId -> แสดง L2 (Department View)
  if (deptId) {
    return <DepartmentView user={user} deptId={deptId} />;
  }

  // 3. ถ้าเป็น Executive และไม่มี state -> แสดง L1 (Executive View)
  if (user.role === 'EXECUTIVE') {
    return <ExecutiveView user={user} />;
  }

  // 4. ถ้าเป็น Role อื่นๆ ที่ไม่มี state (เช่น Dept Head login)
  if (user.role === 'DEPT_HEAD' && user.departmentId) {
    return <DepartmentView user={user} deptId={user.departmentId} />;
  }

  if (user.role === 'GROUP_HEAD' && user.departmentId) {
    // ในระบบจริงต้องมี categoryId ใน user
    // สมมติว่าไป L2 ก่อน
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