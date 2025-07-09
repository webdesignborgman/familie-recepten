import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { AuthProvider } from '@/components/auth/AuthProvider'; // <--- toegevoegd

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Familie Recepten',
  description: 'Een verzameling van heerlijke familie recepten',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster richColors position="bottom-right" />
        <AuthProvider>
          {' '}
          {/* <-- HIER de hele app wrappen */}
          <Header />
          <PageContainer>{children}</PageContainer>
        </AuthProvider>
      </body>
    </html>
  );
}
