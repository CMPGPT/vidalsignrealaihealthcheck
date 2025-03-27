// Define analytics data types

// Daily statistics 
export interface DailyStats {
  name: string;
  redeemed: number;
  total: number;
  date: string;
}

// Monthly statistics
export interface MonthlyStats {
  name: string;
  redeemed: number;
  total: number;
  month: number;
  year: number;
}

// Partner statistics
export interface PartnerStats {
  partnerId: string;
  name: string;
  qrCodes: number;
  redemptions: number;
  redemptionRate: number;
}

// User demographics
export interface UserDemographics {
  ageGroup: string;
  count: number;
  percentage: number;
}

// Region statistics
export interface RegionStats {
  region: string;
  count: number;
  percentage: number;
}

// Define analytics data schema
export interface AnalyticsData {
  id: string;
  partnerId: string;
  period: string;
  startDate: string;
  endDate: string;
  metrics: AnalyticsMetrics;
  demographics?: AnalyticsDemographics;
  sources?: AnalyticsSources;
  hourlyActivity?: AnalyticsHourlyActivity[];
  weeklyActivity?: AnalyticsWeeklyActivity[];
  dailyStats: DailyStats[];
  monthlyStats: MonthlyStats[];
  partnerStats: PartnerStats[];
  userDemographics?: UserDemographics[];
  regionStats?: RegionStats[];
}

// Define metrics schema
export interface AnalyticsMetrics {
  totalScans: number;
  totalRedemptions: number;
  uniqueUsers: number;
  conversionRate: number;
  averageTimeToRedeem: number;
  growthRate: number;
}

// Define demographics schema
export interface AnalyticsDemographics {
  ageGroups: {
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45-54': number;
    '55-64': number;
    '65+': number;
  };
  gender: {
    male: number;
    female: number;
    other: number;
    unknown: number;
  };
  locations: Record<string, number>;
}

// Define sources schema
export interface AnalyticsSources {
  direct: number;
  social: number;
  email: number;
  referral: number;
  other: number;
}

// Define hourly activity schema
export interface AnalyticsHourlyActivity {
  hour: string;
  scans: number;
  redemptions: number;
}

// Define weekly activity schema
export interface AnalyticsWeeklyActivity {
  day: string;
  scans: number;
  redemptions: number;
} 