// app/layout.tsx

import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import QueryProvider from '@/components/query-provider';

export const metadata = {
  title: 'SSO Expense Insight Dashboard',
  description: 'Dashboard for SSO analysis',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
};