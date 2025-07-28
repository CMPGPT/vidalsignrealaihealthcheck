'use client';

import React from "react";
import QRCodeManager from "@/components/admin/QRCodeManager";
import useSWR from 'swr';
import RecentQRBatchesTable from '@/components/admin/RecentQRBatchesTable';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function QRCodesPage() {
  return (
    <div>
      <QRCodeManager />
    </div>
  );
} 