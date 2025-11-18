// app/auth/error/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    Configuration: "มีปัญหาในการตั้งค่าระบบการเข้าสู่ระบบ",
    AccessDenied: "คุณไม่มีสิทธิ์เข้าถึงระบบนี้",
    Verification: "ลิงก์การยืนยันตัวตนหมดอายุหรือไม่ถูกต้อง",
    Default: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            เกิดข้อผิดพลาด
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {errorMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <Link href="/" passHref>
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              กลับไปหน้าหลัก
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}