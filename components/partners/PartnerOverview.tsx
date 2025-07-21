'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, CheckCircle, Plus, DollarSign, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import QRPurchaseModal from "@/components/partners/QRPurchaseModal";
import { useToast } from "@/hooks/use-toast";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-raleway',
});

interface PartnerOverviewProps {
  openModalByDefault?: boolean;
  partnerId?: string;
}

interface AnalyticsData {
  overview: {
    revenue: {
      current: number;
      previous: number;
      growth: number;
      currency: string;
    };
    transactions: {
      current: number;
      previous: number;
      growth: number;
    };
    customers: {
      current: number;
      previous: number;
      growth: number;
    };
    qrCodes: {
      total: number;
      used: number;
      available: number;
      usageRate: number;
    };
    secureLinks: {
      total: number;
      used: number;
      active: number;
      usageRate: number;
    };
  };
  trends: {
    monthly: any[];
    daily: any[];
    qrUsage: any[];
  };
  performance: {
    topPlans: any[];
    customerInsights: any[];
  };
}

const PartnerOverview = ({ openModalByDefault = false, partnerId }: PartnerOverviewProps) => {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(openModalByDefault);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 PARTNER OVERVIEW: Fetching analytics for partnerId:', partnerId);
      const response = await fetch(`/api/partner-analytics?partnerId=${partnerId}&timeRange=last30days`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ PARTNER OVERVIEW: Analytics data received:', data.data);
        setAnalyticsData(data.data);
      } else {
        console.error('❌ PARTNER OVERVIEW: Failed to fetch analytics:', data.error);
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ PARTNER OVERVIEW: Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [partnerId]);

  // Effect to handle modal opening from URL parameter
  useEffect(() => {
    if (openModalByDefault) {
      setIsPurchaseOpen(true);
    }
  }, [openModalByDefault]);

  const handlePurchase = (packageName: string | null, count: number, price: number) => {
    console.log(`Purchased: ${packageName || 'Custom'} - ${count} QR codes for $${price}`);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${raleway.className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading partner data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!partnerId) {
    return (
      <div className={`space-y-6 ${raleway.className}`}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view your partner dashboard.</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`space-y-6 ${raleway.className}`}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  const { overview, trends } = analyticsData;

  return (
    <div className={`space-y-6 ${raleway.className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${overview.revenue.current.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className={overview.revenue.growth >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {overview.revenue.growth >= 0 ? "+" : ""}{overview.revenue.growth.toFixed(1)}%
                </span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{overview.transactions.current}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className={overview.transactions.growth >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {overview.transactions.growth >= 0 ? "+" : ""}{overview.transactions.growth.toFixed(1)}%
                </span> from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Customers</p>
                <p className="text-2xl font-bold">{overview.customers.current}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                <span className={overview.customers.growth >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {overview.customers.growth >= 0 ? "+" : ""}{overview.customers.growth.toFixed(1)}%
                </span> from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">QR Code Usage</p>
                <p className="text-2xl font-bold">{overview.qrCodes.usageRate.toFixed(1)}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                {overview.qrCodes.used} used out of {overview.qrCodes.total} total
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
            <CardTitle>Monthly Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.monthly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                  <Bar dataKey="transactions" fill="hsl(var(--muted))" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code Usage Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.qrUsage} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalCreated" fill="hsl(var(--primary))" name="Created" />
                  <Bar dataKey="totalUsed" fill="hsl(var(--muted))" name="Used" />
                </BarChart>
              </ResponsiveContainer>
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