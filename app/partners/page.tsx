'use client';

import React, { Suspense } from "react";
import PartnerOverview from "@/components/partners/PartnerOverview";
import { useSearchParams } from "next/navigation";
import { useSession, signOut } from 'next-auth/react';


function PartnerDashboardContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  console.log('🔍 PARTNERS PAGE DEBUG: ========== Partners Page Loaded ==========');
  console.log('🔍 PARTNERS PAGE DEBUG: Session status:', status);
  console.log('🔍 PARTNERS PAGE DEBUG: Session data:', session);
  
  // Get partner ID from session (MongoDB _id)
  const partnerId = (session?.user as any)?.partnerId || null;
  
  return (
    <div>
      <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded">
        <h2 className="font-bold text-green-800">🎉 SUCCESS! You've reached the Partners page!</h2>
        <p className="text-green-700">Login and redirect working correctly.</p>
        <p className="text-sm text-green-600">Session status: {status}</p>
        <p className="text-sm text-green-600">User email: {session?.user?.email || 'Not available'}</p>
      </div>
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