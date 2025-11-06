// components/auth-provider.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@prisma/client';

// 1. Types
export interface User {
  id: string;
  name: string;
  role: UserRole;
  departmentId?: string; // For DEPT_HEAD, GROUP_HEAD, OPERATOR
  providerId: string; // From original requirement
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// 2. Mock Users (for login page)
export const mockUsers: Record<string, User> = {
  exec: {
    id: 'user-exec-01',
    name: 'คุณสมชาย บริหาร',
    role: 'EXECUTIVE',
    providerId: 'p-001',
  },
  dept: {
    id: 'user-dept-it-01',
    name: 'คุณสมหญิง ไอที',
    role: 'DEPT_HEAD',
    departmentId: 'dept-it-id',
    providerId: 'p-002',
  },
  group: {
    id: 'user-group-it-01',
    name: 'คุณสมศักดิ์ พัฒนา',
    role: 'GROUP_HEAD',
    departmentId: 'dept-it-id', // สังกัด IT
    providerId: 'p-003',
  },
  op: {
    id: 'user-op-it-01',
    name: 'คุณสมหมาย ปฏิบัติ',
    role: 'OPERATOR',
    departmentId: 'dept-it-id', // สังกัด IT
    providerId: 'p-004',
  },
};

// 3. Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // ใน App จริง, ส่วนนี้จะถูกเรียกหลังจากการยืนยันตัวตน (e.g., Firebase Auth, NextAuth)
  // แต่สำหรับ Mock, เราจะใช้ sessionStorage
  useState(() => {
    try {
      const storedUser = sessionStorage.getItem('auth-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from sessionStorage', error);
      sessionStorage.removeItem('auth-user');
    }
  });

  const login = (user: User) => {
    setUser(user);
    try {
      sessionStorage.setItem('auth-user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to sessionStorage', error);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('auth-user');
    } catch (error) {
      console.error('Failed to remove user from sessionStorage', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 5. Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}