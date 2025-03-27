import React, { useState } from "react";
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
  BarChart3
} from "lucide-react";
// Import centralized data
import { 
  qrActivityData, 
  partnerMetricsData, 
  daysOfWeekData, 
  timeOfDayData, 
  channelData, 
  CHART_COLORS,
  performanceData
} from "@/data/mock/partnerUsers";

// Default partner ID - in a real app this would come from auth context
const DEFAULT_PARTNER_ID = "P-001";

interface AnalyticsDashboardProps {
  className?: string;
  partnerId?: string;
}

export function AnalyticsDashboard({ className, partnerId = DEFAULT_PARTNER_ID }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("last30days");
  const [activeTab, setActiveTab] = useState("overview");

  // Get partner-specific data
  const monthlyData = qrActivityData[partnerId] || [];
  const metrics = partnerMetricsData[partnerId] || {
    qrCodes: { total: 0, available: 0, used: 0, growthRate: 0 },
    customers: { total: 0, active: 0, new: 0, growthRate: 0 },
    redemptions: { total: 0, thisMonth: 0, lastMonth: 0, growthRate: 0 }
  };

  // Calculate summary stats
  const totalScans = monthlyData.reduce((sum, month) => sum + month.scans, 0);
  const totalRedemptions = metrics.redemptions.total;
  const activeUsers = metrics.customers.active;
  const conversionRate = totalScans > 0 ? parseFloat((totalRedemptions / totalScans * 100).toFixed(1)) : 0;

  // Growth rates from metrics
  const scanGrowth = monthlyData.length >= 2 ? 
    parseFloat(((monthlyData[monthlyData.length-1].scans / monthlyData[monthlyData.length-2].scans - 1) * 100).toFixed(1)) : 
    parseFloat(metrics.qrCodes.growthRate.toFixed(1));
  const redemptionGrowth = parseFloat(metrics.redemptions.growthRate.toFixed(1));
  const userGrowth = parseFloat(metrics.customers.growthRate.toFixed(1));

  // String versions for template literals
  const scanGrowthStr = scanGrowth.toString();
  const redemptionGrowthStr = redemptionGrowth.toString();
  const userGrowthStr = userGrowth.toString();

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
        
     
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Redemptions</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold">{totalRedemptions.toLocaleString()}</h3>
                  <Badge className={`ml-2 ${redemptionGrowth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} hover:bg-emerald-100`}>
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {redemptionGrowth}%
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-1.5" style={{ width: `${Math.min(Math.max(parseFloat(redemptionGrowthStr) + 80, 0), 100)}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {redemptionGrowth}% growth from previous period
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Users</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold">{activeUsers.toLocaleString()}</h3>
                  <Badge className={`ml-2 ${userGrowth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} hover:bg-emerald-100`}>
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {userGrowth}%
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-1.5" style={{ width: `${Math.min(Math.max(parseFloat(userGrowthStr) + 80, 0), 100)}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {userGrowth}% growth from previous period
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold">{conversionRate}%</h3>
                  <Badge className="ml-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    2.4%
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-1.5" style={{ width: `${Math.min(conversionRate, 100)}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                2.4% increase from previous period
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different analytics views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>QR scans and redemptions over the past months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="scans" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="redemptions" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Day of Week & Time of Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity by Day of Week</CardTitle>
                <CardDescription>When your users are most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={daysOfWeekData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="scans" fill="#8884d8" />
                      <Bar dataKey="redemptions" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity by Time of Day</CardTitle>
                <CardDescription>Hourly distribution of activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeOfDayData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="scans" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your QR scans are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="hidden md:block w-1/2">
                  <div className="space-y-2">
                    {channelData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-sm">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* More performance metrics would go here */}
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          {/* Customer Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Demographics</CardTitle>
              <CardDescription>Breakdown of your customer base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {/* Demographics chart would go here */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Customer demographic data visualizations coming soon.
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* More customer analytics would go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
} 