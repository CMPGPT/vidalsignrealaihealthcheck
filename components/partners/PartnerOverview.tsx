'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, CheckCircle, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import QRPurchaseModal from "@/components/partners/QRPurchaseModal";
// Import centralized data
import { partnerMetricsData, qrActivityData, customers } from "@/data/mock/partnerUsers";

import { Raleway } from "next/font/google";


const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Add weights as needed
  variable: '--font-raleway', // Optional: for CSS variable usage
});


interface PartnerOverviewProps {
  openModalByDefault?: boolean;
  partnerId?: string;
}

// Default partner ID - in a real app this would come from auth context
const DEFAULT_PARTNER_ID = "P-001";

const PartnerOverview = ({ openModalByDefault = false, partnerId = DEFAULT_PARTNER_ID }: PartnerOverviewProps) => {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(openModalByDefault);

  // Get partner-specific data from centralized store
  const metrics = partnerMetricsData[partnerId] || {
    qrCodes: { total: 0, available: 0, used: 0, growthRate: 0 },
    customers: { total: 0, active: 0, new: 0, growthRate: 0 },
    redemptions: { total: 0, thisMonth: 0, lastMonth: 0, growthRate: 0 }
  };
  
  // Get activity data for the chart
  const activityData = qrActivityData[partnerId] || [];
  
  // Get recent customers
  const partnerCustomers = customers[partnerId] || [];
  const recentCustomers = [...partnerCustomers]
    .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
    .slice(0, 4);

  // Effect to handle modal opening from URL parameter
  useEffect(() => {
    if (openModalByDefault) {
      setIsPurchaseOpen(true);
    }
  }, [openModalByDefault]);

  const handlePurchase = (packageName: string | null, count: number, price: number) => {
    // Here you would implement the actual purchase logic
    console.log(`Purchased: ${packageName || 'Custom'} - ${count} QR codes for $${price}`);
    // Add API call or other logic as needed
  };

  return (
    <div className={`space-y-6 ${raleway.className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My QR Codes</p>
                <p className="text-2xl font-bold">{metrics.qrCodes.total.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className={metrics.qrCodes.growthRate >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {metrics.qrCodes.growthRate >= 0 ? "+" : ""}{metrics.qrCodes.growthRate.toFixed(1)}%
                </span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">QR Redemptions</p>
                <p className="text-2xl font-bold">{metrics.redemptions.total.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className={metrics.redemptions.growthRate >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {metrics.redemptions.growthRate >= 0 ? "+" : ""}{metrics.redemptions.growthRate.toFixed(1)}%
                </span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{metrics.customers.active.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className={metrics.customers.growthRate >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {metrics.customers.growthRate >= 0 ? "+" : ""}{metrics.customers.growthRate.toFixed(1)}%
                </span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buy New Batch Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold mb-2">Need more QR codes?</p>
              <p className="text-muted-foreground mb-4">Purchase additional QR code batches for your business needs.</p>
              <Button onClick={() => setIsPurchaseOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Buy New Batch
              </Button>
            </div>
            <div className="hidden md:block p-4 bg-background/80 rounded-xl">
              <QrCode className="h-16 w-16 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData.slice(-6)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">Joined on {new Date(customer.joinedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{customer.redemptions} Redemptions</p>
                    <p className="text-sm text-muted-foreground">
                      Last active {new Date(customer.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Modal */}
      <QRPurchaseModal 
        isOpen={isPurchaseOpen} 
        onClose={() => setIsPurchaseOpen(false)}
      />
    </div>
  );
};

export default PartnerOverview; 