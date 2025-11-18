// app/layout.tsx
import './globals.css';
import RootClientComponent from './RootClientComponent';

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
        {/* เอา Providers ออกไปไว้ใน RootClientComponent */}
        <RootClientComponent>{children}</RootClientComponent>
      </body>
    </html>
  );
}