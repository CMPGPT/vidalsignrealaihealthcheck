import { 
  AnalyticsData, 
  AnalyticsMetrics, 
  AnalyticsDemographics, 
  AnalyticsSources,
  DailyStats,
  MonthlyStats,
  PartnerStats,
  UserDemographics,
  RegionStats
} from '@/data/schemas/analyticsSchema';
import { partners } from '@/data/mock/partners';
import { qrActivityData } from '@/data/mock/partnerUsers';

// Mock data for admin overview dashboard
export const adminDashboardMetrics = {
  totalQrCodes: 5280,
  qrRedemptions: 2346,
  activePartners: 124,
  revenue: 23450,
  growthRates: {
    qrCodes: 12,
    redemptions: 8,
    partners: 5,
    revenue: 15
  }
};

// Recent activity data for admin dashboard
export const recentActivityData = [
  { month: 'Jan', scans: 65, redemptions: 45 },
  { month: 'Feb', scans: 72, redemptions: 53 },
  { month: 'Mar', scans: 83, redemptions: 61 },
  { month: 'Apr', scans: 79, redemptions: 60 },
  { month: 'May', scans: 94, redemptions: 75 },
  { month: 'Jun', scans: 102, redemptions: 82 },
];

// Recent QR batches for admin dashboard
export const recentQrBatches = [
  { 
    id: 'B-5001', 
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    totalQrCodes: 87, 
    redemptionPercentage: 32 
  },
  { 
    id: 'B-5002', 
    createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), 
    totalQrCodes: 64, 
    redemptionPercentage: 46 
  },
  { 
    id: 'B-5003', 
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
    totalQrCodes: 92, 
    redemptionPercentage: 28 
  },
  { 
    id: 'B-5004', 
    createdDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), 
    totalQrCodes: 75, 
    redemptionPercentage: 41 
  }
];

// Generate daily stats for the last 7 days
export const dailyData: DailyStats[] = [
  { name: "Monday", redeemed: 120, total: 150, date: "2023-08-14" },
  { name: "Tuesday", redeemed: 145, total: 190, date: "2023-08-15" },
  { name: "Wednesday", redeemed: 135, total: 180, date: "2023-08-16" },
  { name: "Thursday", redeemed: 156, total: 210, date: "2023-08-17" },
  { name: "Friday", redeemed: 180, total: 240, date: "2023-08-18" },
  { name: "Saturday", redeemed: 210, total: 260, date: "2023-08-19" },
  { name: "Sunday", redeemed: 190, total: 230, date: "2023-08-20" }
];

// Generate monthly stats for the year
export const monthlyData: MonthlyStats[] = [
  { name: "Jan", redeemed: 1245, total: 1800, month: 1, year: 2023 },
  { name: "Feb", redeemed: 1435, total: 2100, month: 2, year: 2023 },
  { name: "Mar", redeemed: 1650, total: 2400, month: 3, year: 2023 },
  { name: "Apr", redeemed: 1890, total: 2700, month: 4, year: 2023 },
  { name: "May", redeemed: 2100, total: 3000, month: 5, year: 2023 },
  { name: "Jun", redeemed: 2340, total: 3300, month: 6, year: 2023 },
  { name: "Jul", redeemed: 2580, total: 3600, month: 7, year: 2023 },
  { name: "Aug", redeemed: 2800, total: 3900, month: 8, year: 2023 }
];

// Generate partner stats (top performing partners)
export const partnerData: PartnerStats[] = partners.slice(0, 5).map((partner) => ({
  partnerId: partner.id,
  name: partner.name,
  qrCodes: partner.totalQRCodes,
  redemptions: partner.redeemed,
  redemptionRate: Math.round((partner.redeemed / partner.totalQRCodes) * 100)
}));

// Generate user demographics data
export const userDemographics: UserDemographics[] = [
  { ageGroup: "18-24", count: 432, percentage: 0.12 },
  { ageGroup: "25-34", count: 1250, percentage: 0.35 },
  { ageGroup: "35-44", count: 860, percentage: 0.24 },
  { ageGroup: "45-54", count: 540, percentage: 0.15 },
  { ageGroup: "55-64", count: 360, percentage: 0.10 },
  { ageGroup: "65+", count: 144, percentage: 0.04 }
];

// Generate region stats data
export const regionStats: RegionStats[] = [
  { region: "North America", count: 1800, percentage: 0.45 },
  { region: "Europe", count: 1200, percentage: 0.30 },
  { region: "Asia", count: 600, percentage: 0.15 },
  { region: "South America", count: 240, percentage: 0.06 },
  { region: "Africa", count: 100, percentage: 0.025 },
  { region: "Oceania", count: 60, percentage: 0.015 }
];

// Generate mock analytics data for each partner
export const analyticsData: Record<string, AnalyticsData> = {};

// Helper function to generate hourly activity data
const generateHourlyActivity = (averageScans: number) => {
  const hours = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  );
  
  return hours.map(hour => {
    // More activity during business hours
    const hourNum = parseInt(hour.split(':')[0]);
    const isBusyHour = hourNum >= 9 && hourNum <= 18;
    const multiplier = isBusyHour ? 1 + Math.random() * 1.5 : Math.random() * 0.5;
    const scans = Math.floor(averageScans * multiplier);
    
    return {
      hour,
      scans,
      redemptions: Math.floor(scans * (0.6 + Math.random() * 0.3)) // 60-90% redemption rate
    };
  });
};

// Helper function to generate weekly activity data
const generateWeeklyActivity = (averageScans: number) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return days.map(day => {
    // More activity on weekends
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const multiplier = isWeekend ? 1.5 + Math.random() * 0.5 : 0.8 + Math.random() * 0.5;
    const scans = Math.floor(averageScans * multiplier);
    
    return {
      day,
      scans,
      redemptions: Math.floor(scans * (0.6 + Math.random() * 0.3)) // 60-90% redemption rate
    };
  });
};

// Generate analytics data for each partner
partners.forEach(partner => {
  const partnerActivity = qrActivityData[partner.id] || [];
  
  if (partnerActivity.length === 0) {
    return; // Skip partners with no activity data
  }
  
  // Calculate total scans and redemptions
  const totalScans = partnerActivity.reduce((sum, month) => sum + month.scans, 0);
  const totalRedemptions = partnerActivity.reduce((sum, month) => sum + month.redemptions, 0);
  
  // Calculate averages for hourly and weekly data
  const averageScansPerDay = Math.ceil(totalScans / (partnerActivity.length * 30)); // Assuming 30 days per month
  const averageScansPerHour = Math.ceil(averageScansPerDay / 24);
  
  // Generate metrics
  const metrics: AnalyticsMetrics = {
    totalScans,
    totalRedemptions,
    uniqueUsers: Math.floor(totalRedemptions * (0.8 + Math.random() * 0.4)), // Each user may have multiple redemptions
    conversionRate: totalScans > 0 ? (totalRedemptions / totalScans * 100) : 0,
    averageTimeToRedeem: Math.floor(0.5 * 60 * 60 + Math.random() * 48 * 60 * 60), // 30 mins to 48 hours in seconds
    growthRate: partnerActivity.length >= 2 
      ? ((partnerActivity[partnerActivity.length - 1].scans / partnerActivity[partnerActivity.length - 2].scans - 1) * 100)
      : 0
  };
  
  // Generate demographics
  const demographics: AnalyticsDemographics = {
    ageGroups: {
      '18-24': Math.floor(Math.random() * 20),
      '25-34': Math.floor(15 + Math.random() * 25),
      '35-44': Math.floor(20 + Math.random() * 25),
      '45-54': Math.floor(10 + Math.random() * 20),
      '55-64': Math.floor(5 + Math.random() * 15),
      '65+': Math.floor(Math.random() * 10)
    },
    gender: {
      male: Math.floor(35 + Math.random() * 25),
      female: Math.floor(35 + Math.random() * 25),
      other: Math.floor(Math.random() * 5),
      unknown: Math.floor(5 + Math.random() * 10)
    },
    locations: {
      'New York': Math.floor(10 + Math.random() * 20),
      'Los Angeles': Math.floor(5 + Math.random() * 15),
      'Chicago': Math.floor(5 + Math.random() * 15),
      'Houston': Math.floor(5 + Math.random() * 15),
      'Miami': Math.floor(5 + Math.random() * 15),
      'Other': Math.floor(10 + Math.random() * 30)
    }
  };
  
  // Generate sources
  const sources: AnalyticsSources = {
    direct: Math.floor(35 + Math.random() * 25),
    social: Math.floor(15 + Math.random() * 20),
    email: Math.floor(10 + Math.random() * 15),
    referral: Math.floor(5 + Math.random() * 10),
    other: Math.floor(5 + Math.random() * 10)
  };
  
  // Create the analytics data object
  analyticsData[partner.id] = {
    id: `AN-${partner.id}`,
    partnerId: partner.id,
    period: 'all-time',
    startDate: partnerActivity[0].date,
    endDate: partnerActivity[partnerActivity.length - 1].date,
    metrics,
    demographics,
    sources,
    hourlyActivity: generateHourlyActivity(averageScansPerHour),
    weeklyActivity: generateWeeklyActivity(averageScansPerDay),
    // Add properties required by AdminAnalytics.tsx
    dailyStats: [...dailyData],
    monthlyStats: [...monthlyData],
    partnerStats: [...partnerData],
    userDemographics: [...userDemographics],
    regionStats: [...regionStats]
  };
});

// Export analytics data
export default {
  analyticsData,
  dailyData,
  monthlyData,
  partnerData,
  userDemographics,
  regionStats,
  adminDashboardMetrics,
  recentActivityData,
  recentQrBatches
}; 