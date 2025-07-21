'use client';

import React from "react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { useSession } from "next-auth/react";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  
  // Get partner ID from session (MongoDB _id)
  const partnerId = (session?.user as any)?.partnerId || null;
  
  if (status === "loading") {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!partnerId) {
    return (
      <div className="container mx-auto">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view analytics.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <AnalyticsDashboard partnerId={partnerId} />
    </div>
  );
} 