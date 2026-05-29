import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Teacher AI Assistance',
    template: '%s | Teacher AI Assistance',
  },
  description: 'Nền tảng AI hỗ trợ giảng dạy thông minh — Quản lý tài liệu, chatbot AI và sinh câu hỏi tự động.',
  keywords: ['teacher', 'ai', 'education', 'question generator', 'chatbot'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#191c1e',
              boxShadow: '0px 12px 32px rgba(25, 28, 30, 0.08)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#006a62', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' },
            },
          }}
        />
      </body>
    </html>
  );
}
