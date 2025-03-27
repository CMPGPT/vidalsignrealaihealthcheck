'use client';

import React, { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, CreditCard, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Import centralized mock data
import { adminDashboardMetrics, recentActivityData, recentQrBatches } from '@/data/mock/analytics';

const AdminOverview: FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total QR Codes</p>
                <p className="text-2xl font-bold">{adminDashboardMetrics.totalQrCodes.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className="text-emerald-500 font-medium">+{adminDashboardMetrics.growthRates.qrCodes}%</span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">QR Redemptions</p>
                <p className="text-2xl font-bold">{adminDashboardMetrics.qrRedemptions.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className="text-emerald-500 font-medium">+{adminDashboardMetrics.growthRates.redemptions}%</span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Partners</p>
                <p className="text-2xl font-bold">{adminDashboardMetrics.activePartners.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className="text-emerald-500 font-medium">+{adminDashboardMetrics.growthRates.partners}%</span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${adminDashboardMetrics.revenue.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className="text-emerald-500 font-medium">+{adminDashboardMetrics.growthRates.revenue}%</span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="scans" fill="hsl(var(--primary))" name="QR Scans" />
                  <Bar dataKey="redemptions" fill="hsl(var(--muted))" name="Redemptions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent QR Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQrBatches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{batch.id}</p>
                    <p className="text-sm text-muted-foreground">Created on {new Date(batch.createdDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{batch.totalQrCodes} QR Codes</p>
                    <p className="text-sm text-muted-foreground">{batch.redemptionPercentage}% Redeemed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview; 