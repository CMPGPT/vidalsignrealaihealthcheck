'use client';

import React from "react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default function AnalyticsPage() {
  // Default partner ID - in a real app, this would come from authentication context
  const partnerId = "P-001";
  
  return (
    <div className="container mx-auto">
      <AnalyticsDashboard partnerId={partnerId} />
    </div>
  );
} 