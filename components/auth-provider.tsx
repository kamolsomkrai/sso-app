// app/components/auth-provider.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
// import { UserRole } from '@prisma/client'; // <--- ลบออกเพื่อแก้ปัญหา build

// 1. Manually define UserRole enum to avoid client-side Prisma dependency
// This MUST match the enum in /prisma/schema.prisma
export enum UserRole {
  EXECUTIVE = 'EXECUTIVE',
  DEPT_HEAD = 'DEPT_HEAD',
  GROUP_HEAD = 'GROUP_HEAD',
  OPERATOR = 'OPERATOR',
}

// 2. Mock Data (ใช้ UserRole enum)
export const mockUsers = [
  {
    id: 'exec',
    name: 'ผู้บริหาร (Executive)',
    role: UserRole.EXECUTIVE,
  },
  {
    id: 'dept',
    name: 'หัวหน้าหน่วยงาน (Dept Head)',
    role: UserRole.DEPT_HEAD,
  },
  {
    id: 'group',
    name: 'หัวหน้ากลุ่มงาน (Group Head)',
    role: UserRole.GROUP_HEAD,
  },
  {
    id: 'op',
    name: 'ผู้ปฏิบัติงาน (Operator)',
    role: UserRole.OPERATOR,
  },
];

// 3. Auth Context Type
interface AuthContextType {
  user: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
  login: (userId: string) => void;
  logout: () => void;
  isLoading: boolean;
}

// 4. Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 5. AuthProvider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  // จำลองการตรวจสอบ session เมื่อเปิดแอป
  useEffect(() => {
    // ลองดึง user จาก localStorage (ถ้ามี)
    const storedUserId = localStorage.getItem('sso-dashboard-user-id');
    if (storedUserId) {
      const foundUser = mockUsers.find((u) => u.id === storedUserId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userId: string) => {
    const foundUser = mockUsers.find((u) => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('sso-dashboard-user-id', foundUser.id);
    } else {
      console.error('User not found');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sso-dashboard-user-id');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Custom Hook (useAuth)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};