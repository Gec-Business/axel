import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Axel Network Dashboard',
  description: 'Social media management dashboard for Axel Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  );
}
