'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl signature-gradient flex items-center justify-center shadow-ambient-md animate-pulse">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
              auto_awesome
            </span>
          </div>
          <p className="text-sm font-medium text-[#6F7880]">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F7F9FB]">
      <Sidebar />
      <main className="ml-60 flex-1 flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
