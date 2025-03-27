'use client';

import React, { FC } from "react";
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
  PieChart,
  Pie,
  Cell
} from "recharts";

// Import types and mock data
import { 
  UserDemographics,
  RegionStats
} from "@/data/schemas/analyticsSchema";
import { 
  dailyData, 
  monthlyData, 
  partnerData,
  userDemographics,
  regionStats
} from "@/data/mock/analytics";

interface ChartWrapperProps {
  children: React.ReactElement;
  title: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ children, title }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">{title}</h3>
    <div className="h-[350px] md:h-[400px] mt-4 border border-border rounded-md p-4">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminAnalytics: FC = () => {
  const [activeChart, setActiveChart] = React.useState<'daily' | 'monthly' | 'partners' | 'demographics' | 'regions'>('daily');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveChart('daily')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeChart === 'daily' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Daily
          </button>
          <button 
            onClick={() => setActiveChart('monthly')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeChart === 'monthly' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setActiveChart('partners')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeChart === 'partners' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            By Partner
          </button>
          <button 
            onClick={() => setActiveChart('demographics')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeChart === 'demographics' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Demographics
          </button>
          <button 
            onClick={() => setActiveChart('regions')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeChart === 'regions' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Regions
          </button>
        </div>
        
        {activeChart === 'daily' && (
          <ChartWrapper title="QR Code Redemptions (Last 7 Days)">
            <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          <ChartWrapper title="QR Code Redemptions (Yearly Overview)">
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          <ChartWrapper title="Top Performing Partners">
            <BarChart data={partnerData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
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

        {activeChart === 'demographics' && (
          <ChartWrapper title="User Demographics by Age">
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <Pie
                data={userDemographics}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="ageGroup"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {userDemographics.map((entry: UserDemographics, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ChartWrapper>
        )}

        {activeChart === 'regions' && (
          <ChartWrapper title="Usage by Region">
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <Pie
                data={regionStats}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="region"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {regionStats.map((entry: RegionStats, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ChartWrapper>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAnalytics; 