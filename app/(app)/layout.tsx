// app/(app)/layout.tsx

'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, LayoutGrid } from 'lucide-react'; // 
import Link from 'next/link'; // <--- เพิ่ม Link

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // ตรวจสอบสิทธิ์
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            SSO Expense Insight
          </h1>
          <div className="flex items-center space-x-4">

            <div className="text-right">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <UserCircle className="h-8 w-8 text-gray-400" />

            {/* --- เพิ่มลิงก์ตรงนี้ --- */}
            <Link href="/dashboard/cross-filter" passHref>
              <Button variant="outline" size="sm">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cross-Filter
              </Button>
            </Link>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}