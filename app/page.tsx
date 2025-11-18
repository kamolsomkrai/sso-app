// app/page.tsx
'use client';

import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, UserCheck, Shield, LogIn, UserCog, AlertTriangle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// ตรวจสอบการตั้งค่า Provider ID
const isProviderIdConfigured =
  process.env.PROVIDER_ID_URL &&
  process.env.PROVIDER_ID_CLIENT_ID &&
  process.env.PROVIDER_ID_CLIENT_SECRET;

export default function LoginPage() {
  const { user, signIn, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  console.log('LoginPage: Auth state', { user, isLoading, error });

  // ถ้าผู้ใช้ล็อกอินอยู่แล้ว ให้ redirect ไป dashboard
  useEffect(() => {
    if (user && !isLoading) {
      console.log('LoginPage: User is logged in, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleMockLogin = async (role: string) => {
    console.log('Mock login with role:', role);
    try {
      await signIn('credentials', {
        username: role,
        password: 'password', // ใช้ password ใดๆ ก็ได้
        redirect: true,
        callbackUrl: '/dashboard'
      });
    } catch (error) {
      console.error('Mock login error:', error);
    }
  };

  // ถ้ากำลังโหลดข้อมูลผู้ใช้ ให้แสดง loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ถ้ามีผู้ใช้แล้วแต่ยังโหลดอยู่ หรือกำลัง redirect
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังเปลี่ยนเส้นทาง...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            SSO Expense Insight
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            ระบบบริหารจัดการงบประมาณโรงพยาบาล
          </CardDescription>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">
                {error === 'CredentialsSignin'
                  ? 'การเข้าสู่ระบบล้มเหลว กรุณาลองอีกครั้ง'
                  : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'}
              </p>
            </div>
          )}

          {!isProviderIdConfigured && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <p className="text-yellow-800 text-sm font-semibold">โหมดทดสอบระบบ</p>
              </div>
              <p className="text-yellow-700 text-xs text-center">
                Provider ID ยังไม่ได้ตั้งค่า ใช้ Mock Login สำหรับทดสอบ
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Provider ID Login - แสดงเฉพาะเมื่อตั้งค่าแล้ว */}
          {isProviderIdConfigured && (
            <>
              <Button
                onClick={() => signIn("provider-id")}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                size="lg"
              >
                <UserCheck className="w-5 h-5 mr-2" />
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Provider ID"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">หรือ</span>
                </div>
              </div>
            </>
          )}

          {/* Mock Login สำหรับ Testing */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 text-center">
              {isProviderIdConfigured ? 'ทดสอบระบบ' : 'เข้าสู่ระบบทดสอบ'}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleMockLogin('exec')}
                variant="outline"
                disabled={isLoading}
                className="py-3 h-auto flex flex-col items-center justify-center"
              >
                <Shield className="w-5 h-5 mb-1" />
                <span className="text-xs">ผู้บริหาร</span>
                <span className="text-xs text-gray-500 font-normal">(Executive)</span>
              </Button>

              <Button
                onClick={() => handleMockLogin('dept')}
                variant="outline"
                disabled={isLoading}
                className="py-3 h-auto flex flex-col items-center justify-center"
              >
                <UserCog className="w-5 h-5 mb-1" />
                <span className="text-xs">หัวหน้าแผนก</span>
                <span className="text-xs text-gray-500 font-normal">(Dept Head)</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleMockLogin('group')}
                variant="outline"
                disabled={isLoading}
                className="py-3 h-auto flex flex-col items-center justify-center"
              >
                <LogIn className="w-5 h-5 mb-1" />
                <span className="text-xs">หัวหน้ากลุ่ม</span>
                <span className="text-xs text-gray-500 font-normal">(Group Head)</span>
              </Button>

              <Button
                onClick={() => handleMockLogin('op')}
                variant="outline"
                disabled={isLoading}
                className="py-3 h-auto flex flex-col items-center justify-center"
              >
                <LogIn className="w-5 h-5 mb-1" />
                <span className="text-xs">ผู้ปฏิบัติงาน</span>
                <span className="text-xs text-gray-500 font-normal">(Operator)</span>
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
            <p className="font-semibold mb-2 text-gray-600">คำแนะนำสำหรับการทดสอบ:</p>
            <div className="space-y-1 text-left">
              {!isProviderIdConfigured && (
                <p className="flex items-start">
                  <span className="text-yellow-600 mr-1">•</span>
                  <span>ระบบกำลังทำงานในโหมดทดสอบ</span>
                </p>
              )}
              <p className="flex items-start">
                <span className="text-blue-600 mr-1">•</span>
                <span>คลิกปุ่มบทบาทที่ต้องการเพื่อเข้าสู่ระบบ</span>
              </p>
              <p className="flex items-start">
                <span className="text-green-600 mr-1">•</span>
                <span>ใช้ password อะไรก็ได้ (ระบบไม่ตรวจสอบ)</span>
              </p>
              <p className="flex items-start">
                <span className="text-purple-600 mr-1">•</span>
                <span>แต่ละบทบาทมีสิทธิ์การเข้าถึงข้อมูลต่างกัน</span>
              </p>
            </div>

            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <p className="font-medium text-gray-700 mb-1">ข้อมูล Mock Users:</p>
              <div className="grid grid-cols-2 gap-1 text-left">
                <div>
                  <p className="text-gray-600"><strong>ผู้บริหาร:</strong></p>
                  <p className="text-gray-500 text-xs">ดูข้อมูลภาพรวมทั้งหมด</p>
                </div>
                <div>
                  <p className="text-gray-600"><strong>หัวหน้าแผนก:</strong></p>
                  <p className="text-gray-500 text-xs">จัดการข้อมูลแผนก</p>
                </div>
                <div>
                  <p className="text-gray-600"><strong>หัวหน้ากลุ่ม:</strong></p>
                  <p className="text-gray-500 text-xs">ดูแลกลุ่มงาน</p>
                </div>
                <div>
                  <p className="text-gray-600"><strong>ผู้ปฏิบัติงาน:</strong></p>
                  <p className="text-gray-500 text-xs">บันทึกข้อมูลการใช้งบประมาณ</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}