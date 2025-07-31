'use client';

import React, { FC, useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  Download,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ChartWrapperProps {
  children: React.ReactElement;
  title: string;
  subtitle?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ children, title, subtitle }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    <div className="h-[350px] md:h-[400px] mt-4 border border-border rounded-md p-4">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

interface AnalyticsData {
  daily: any[];
  monthly: any[];
  partners: any[];
  partnerPerformance: any[];
}

const AdminAnalytics: FC = () => {
  const [activeChart, setActiveChart] = useState<'daily' | 'monthly' | 'partners' | 'revenue'>('daily');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setExporting(true);
      const response = await fetch(`/api/admin/analytics/export?format=${format}&period=${period}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${period}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const result = await response.json();
        if (result.success) {
          const dataStr = JSON.stringify(result.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = window.URL.createObjectURL(dataBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-export-${period}-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export analytics data');
    } finally {
      setExporting(false);
    }
  };

  // Helper function to check if data has any non-zero values
  const hasData = (data: any[]) => {
    return data && data.length > 0 && data.some(item => 
      item.redeemed > 0 || item.total > 0 || item.redemptions > 0 || item.qrCodes > 0 || item.totalSales > 0
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={exporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>Error loading analytics: {error}</p>
              <Button onClick={fetchAnalyticsData} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No analytics data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={exporting}>
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activeChart === 'daily' ? 'default' : 'outline'}
          onClick={() => setActiveChart('daily')}
          size="sm"
        >
          Daily
        </Button>
        <Button 
          variant={activeChart === 'monthly' ? 'default' : 'outline'}
          onClick={() => setActiveChart('monthly')}
          size="sm"
        >
          Monthly
        </Button>
        <Button 
          variant={activeChart === 'partners' ? 'default' : 'outline'}
          onClick={() => setActiveChart('partners')}
          size="sm"
        >
          Partners
        </Button>
        <Button 
          variant={activeChart === 'revenue' ? 'default' : 'outline'}
          onClick={() => setActiveChart('revenue')}
          size="sm"
        >
          Revenue
        </Button>
      </div>

      {/* Charts */}
      <Card>
        <CardContent className="pt-6">
          {activeChart === 'daily' && (
            <ChartWrapper 
              title="QR Code Redemptions (Last 7 Days)" 
              subtitle={!hasData(analyticsData.daily) ? "No data available for the selected period" : "Daily redemption trends"}
            >
              <BarChart data={analyticsData.daily} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="redeemed" name="Redeemed" fill="hsl(var(--primary))" />
                <Bar dataKey="total" name="Total QR Codes" fill="hsl(var(--muted))" />
              </BarChart>
            </ChartWrapper>
          )}

          {activeChart === 'monthly' && (
            <ChartWrapper 
              title="QR Code Redemptions (Yearly Overview)" 
              subtitle={!hasData(analyticsData.monthly) ? "No data available for the selected period" : "Monthly trends"}
            >
              <LineChart data={analyticsData.monthly} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="redeemed" name="Redeemed" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="total" name="Total QR Codes" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
              </LineChart>
            </ChartWrapper>
          )}

          {activeChart === 'partners' && (
            <ChartWrapper 
              title="Top Performing Partners" 
              subtitle={!hasData(analyticsData.partners) ? "No partner data available" : "Partner performance comparison"}
            >
              <BarChart data={analyticsData.partners} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="redemptions" name="Redemptions" fill="hsl(var(--primary))" />
                <Bar dataKey="qrCodes" name="Total QR Codes" fill="hsl(var(--muted))" />
              </BarChart>
            </ChartWrapper>
          )}

          {activeChart === 'revenue' && (
            <ChartWrapper 
              title="Revenue Analytics" 
              subtitle={!hasData(analyticsData.partnerPerformance) ? "No revenue data available" : "Revenue and transaction trends"}
            >
              <AreaChart data={analyticsData.partnerPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="partnerId" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Area type="monotone" dataKey="totalSales" name="Total Sales" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" />
              </AreaChart>
            </ChartWrapper>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics; 