// components/auth-provider.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

export enum UserRole {
  EXECUTIVE = 'EXECUTIVE',
  DEPT_HEAD = 'DEPT_HEAD',
  GROUP_HEAD = 'GROUP_HEAD',
  OPERATOR = 'OPERATOR',
}

interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  providerId?: string;
  firstNameTh?: string;
  lastNameTh?: string;
  organizationHnameTh?: string;
  organizationPosition?: string;
  ialLevel?: number;
  isDirector?: boolean;
  isHrAdmin?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (provider?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // components/auth-provider.tsx - เพิ่ม debug logging
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthProvider: Initializing auth', { status, hasSession: !!session });

      if (status === "loading") {
        setIsLoading(true);
        return;
      }

      if (session?.user) {
        try {
          console.log('AuthProvider: Fetching user data for:', session.user.id);
          const response = await fetch('/api/auth/user');

          if (response.ok) {
            const data = await response.json();
            console.log('AuthProvider: User data received', data);
            setUser(data.user);
          } else {
            console.error('AuthProvider: Failed to fetch user data, status:', response.status);
            // ใช้ session data เป็น fallback
            if (session.user.name && session.user.role) {
              setUser({
                id: session.user.id!,
                name: session.user.name,
                email: session.user.email || undefined,
                role: session.user.role as any,
                providerId: session.user.providerId,
                firstNameTh: session.user.name.split(' ')[0],
                lastNameTh: session.user.name.split(' ')[1] || '',
                organizationHnameTh: session.user.organization?.hname_th,
                organizationPosition: session.user.organization?.position,
                ialLevel: session.user.ialLevel,
                isDirector: session.user.role === 'EXECUTIVE',
                isHrAdmin: session.user.role === 'DEPT_HEAD',
              });
            } else {
              setUser(null);
            }
          }
        } catch (error) {
          console.error('AuthProvider: Error fetching user:', error);
          setUser(null);
        }
      } else {
        console.log('AuthProvider: No session found');
        setUser(null);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [session, status]);

  const handleSignIn = async (provider: string = "provider-id", options?: any) => {
    try {
      console.log('Signing in with provider:', provider);
      await signIn(provider, {
        redirect: true,
        callbackUrl: '/dashboard',
        ...options
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || status === "loading",
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};