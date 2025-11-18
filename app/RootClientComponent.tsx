// app/RootClientComponent.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from '@/components/auth-provider';
import QueryProvider from '@/components/query-provider';

export default function RootClientComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </SessionProvider>
  );
}