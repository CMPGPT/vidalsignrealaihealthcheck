'use client';

import React, { Suspense } from "react";
import PartnerOverview from "@/components/partners/PartnerOverview";
import { useSearchParams } from "next/navigation";

function PartnerDashboardContent() {
  const searchParams = useSearchParams();
  // Default partner ID - in a real app, this would come from authentication context
  const partnerId = "P-001";
  
  return (
    <div>
     { /*  <h2 className="text-xl font-semibold mb-6">Overview</h2> */}
      <PartnerOverview 
        openModalByDefault={searchParams.get("openModal") === "true"} 
        partnerId={partnerId}
      />
    </div>
  );
}

export default function PartnerDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerDashboardContent />
    </Suspense>
  );
} 