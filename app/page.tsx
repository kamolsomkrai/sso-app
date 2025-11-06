// app/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useAuth, mockUsers } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  // ใช้ useRouter จริงจาก next/navigation
  const router = useRouter();

  const [selectedUserKey, setSelectedUserKey] = useState<string>('exec');

  const handleLogin = () => {
    const userToLogin = mockUsers[selectedUserKey];
    if (userToLogin) {
      login(userToLogin);
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">
          SSO Dashboard (Mock Login)
        </h1>
        <p className="text-center text-gray-600 mb-4">
          เลือกระดับสิทธิ์ (Role) เพื่อเข้าสู่ระบบ
        </p>

        <Select value={selectedUserKey} onValueChange={setSelectedUserKey}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือก Role..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(mockUsers).map(([key, user]) => (
              <SelectItem key={key} value={key}>
                {user.name} ({user.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleLogin} className="w-full mt-6">
          เข้าสู่ระบบ
        </Button>
      </div>
    </div>
  );
}