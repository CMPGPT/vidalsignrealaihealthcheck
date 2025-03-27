'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Progress } from '@/components/ui/progress';

// Dashboard routes for prefetching
const dashboardRoutes = [
  '/dashboard',
  '/dashboard/upload',
  '/dashboard/reports',
  '/dashboard/analytics',
  '/dashboard/patients',
  '/dashboard/settings',
  '/dashboard/support'
];

function LoadingIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress value={100} className="h-1 animate-progress" />
    </div>
  );
}

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Prefetch all dashboard routes
  useEffect(() => {
    dashboardRoutes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingIndicator />}>
        {children}
      </Suspense>
    </DashboardLayout>
  );
} 