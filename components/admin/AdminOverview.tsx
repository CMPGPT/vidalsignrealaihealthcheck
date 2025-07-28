'use client';

import React, { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, CreditCard, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useSWR from 'swr';

// Import centralized mock data
import { adminDashboardMetrics, recentActivityData, recentQrBatches } from '@/data/mock/analytics';
import RecentQRBatchesTable from "./RecentQRBatchesTable";
import RecentActivityGraphPage from "@/app/admin/recent-activity-graph/page";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const AdminOverview: FC = () => {
  // Fetch dashboard metrics
  const { data: metricsData, error: metricsError } = useSWR('/api/admin/dashboard-metrics', fetcher);
  // Fetch securelinks activity for the bar chart
  const { data: secureLinksData, error: secureLinksError } = useSWR('/api/admin/securelinks-activity', fetcher);
  // Fetch payment history for the recent QR batches table
  const { data: paymentData, error: paymentError } = useSWR('/api/admin/payment-history', fetcher);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total QR Codes</p>
                <p className="text-2xl font-bold">
                  {metricsError ? '—' : metricsData ? metricsData.totalQrCodes.toLocaleString() : '...'}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                +12% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">QR Redemptions</p>
                <p className="text-2xl font-bold">
                  {metricsError ? '—' : metricsData ? metricsData.qrRedemptions.toLocaleString() : '...'}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                +8% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Partners</p>
                <p className="text-2xl font-bold">
                  {metricsError ? '—' : metricsData ? metricsData.activePartners.toLocaleString() : '...'}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                +5% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  {metricsError ? '—' : metricsData ? `$${metricsData.revenue.toLocaleString()}` : '...'}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                +15% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stack Recent Activity and Recent QR Batches vertically */}
      <div className="flex flex-col gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {secureLinksError && <div className="text-red-500">Failed to load activity data.</div>}
              {!secureLinksData && !secureLinksError && <div>Loading...</div>}
              {secureLinksData && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={secureLinksData.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="created" fill="hsl(var(--primary))" name="Created" />
                    <Bar dataKey="used" fill="hsl(var(--accent))" name="Used" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent QR Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentError && <div className="text-red-500">Failed to load payment history.</div>}
            {!paymentData && !paymentError && <div>Loading...</div>}
            {paymentData && <RecentQRBatchesTable data={paymentData.payments} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview; 