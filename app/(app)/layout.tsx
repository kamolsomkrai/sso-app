// app/(app)/layout.tsx
'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, LayoutGrid, FilePlus } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  // ตรวจสอบสิทธิ์
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // --- สถานะกำลังโหลด ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <p className="mb-4">กำลังโหลดข้อมูลผู้ใช้...</p>
          <Skeleton className="h-10 w-40 mx-auto" />
        </div>
      </div>
    );
  }

  // --- ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่ ---
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <p className="mb-4">กรุณาเข้าสู่ระบบก่อน</p>
          <Button onClick={() => router.push('/')}>
            ไปหน้าล็อกอิน
          </Button>
        </div>
      </div>
    );
  }

  // --- แสดงผลเมื่อล็อกอินแล้ว ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            SSO Expense Insight
          </h1>
          <div className="flex items-center space-x-4">

            {/* User Info */}
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.organizationPosition} • {user.role}
                {user.organizationHnameTh && ` • ${user.organizationHnameTh}`}
              </p>
            </div>
            <UserCircle className="h-8 w-8 text-gray-400" />

            {/* --- Navigation Links --- */}
            <Link href="/dashboard" passHref>
              <Button variant="outline" size="sm">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/data-entry" passHref>
              <Button variant="ghost" size="sm">
                <FilePlus className="h-4 w-4 mr-2" />
                บันทึกข้อมูล
              </Button>
            </Link>

            {/* Logout Button */}
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}