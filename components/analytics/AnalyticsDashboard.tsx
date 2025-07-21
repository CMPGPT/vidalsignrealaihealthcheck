import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  TrendingUp, 
  Users, 
  QrCode, 
  CheckCircle2, 
  Calendar, 
  BarChart3,
  DollarSign,
  Activity,
  Link
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Default partner ID - in a real app this would come from auth context
const DEFAULT_PARTNER_ID = "686aa71d7848ed9baed37c7f";

interface AnalyticsDashboardProps {
  className?: string;
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

export function AnalyticsDashboard({ className, partnerId = DEFAULT_PARTNER_ID }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("last30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      console.log('🔍 ANALYTICS: Fetching analytics for partnerId:', partnerId);
      const response = await fetch(`/api/partner-analytics?partnerId=${partnerId}&timeRange=${timeRange}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ ANALYTICS: Analytics data received:', data.data);
        setAnalyticsData(data.data);
      } else {
        console.error('❌ ANALYTICS: Failed to fetch analytics:', data.error);
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ ANALYTICS: Error fetching analytics:', error);
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
  }, [partnerId, timeRange]);

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  const { overview, trends, performance } = analyticsData;

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your business performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="thisMonth">This month</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
              <SelectItem value="thisYear">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold">${overview.revenue.current.toFixed(2)}</h3>
                  <Badge className={`ml-2 ${overview.revenue.growth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} hover:bg-emerald-100`}>
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {overview.revenue.growth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-1.5" style={{ width: `${Math.min(Math.max(overview.revenue.growth + 80, 0), 100)}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {overview.revenue.growth.toFixed(1)}% growth from previous period
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Transactions</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold">{overview.transactions.current}</h3>
                  <Badge className={`ml-2 ${overview.transactions.growth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} hover:bg-emerald-100`}>
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {overview.transactions.growth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-1.5" style={{ width: `${Math.min(Math.max(overview.transactions.growth + 80, 0), 100)}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {overview.transactions.growth.toFixed(1)}% growth from previous period
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Unique Customers</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold">{overview.customers.current}</h3>
                  <Badge className={`ml-2 ${overview.customers.growth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} hover:bg-emerald-100`}>
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {overview.customers.growth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-1.5" style={{ width: `${Math.min(Math.max(overview.customers.growth + 80, 0), 100)}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {overview.customers.growth.toFixed(1)}% growth from previous period
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">QR Code Usage</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold">{overview.qrCodes.usageRate.toFixed(1)}%</h3>
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <QrCode className="h-3 w-3 mr-1" />
                    {overview.qrCodes.used}/{overview.qrCodes.total}
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-1.5" style={{ width: `${overview.qrCodes.usageRate}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {overview.qrCodes.used} used out of {overview.qrCodes.total} total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different analytics views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:w-[300px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Monthly Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
              <CardDescription>Revenue and transactions over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trends.monthly}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="transactions" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* QR Code Usage Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Usage</CardTitle>
                <CardDescription>QR code creation and usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trends.qrUsage}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalCreated" fill="#8884d8" />
                      <Bar dataKey="totalUsed" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Secure Links</CardTitle>
                <CardDescription>Secure link usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Links</span>
                    <span className="font-semibold">{overview.secureLinks.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Used Links</span>
                    <span className="font-semibold">{overview.secureLinks.used}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Links</span>
                    <span className="font-semibold">{overview.secureLinks.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Usage Rate</span>
                    <span className="font-semibold">{overview.secureLinks.usageRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Your highest-value customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.customerInsights.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{customer._id}</h4>
                      <p className="text-sm text-muted-foreground">
                        {customer.totalPurchases} purchases • Last: {new Date(customer.lastPurchase).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${customer.totalSpent.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">total spent</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 