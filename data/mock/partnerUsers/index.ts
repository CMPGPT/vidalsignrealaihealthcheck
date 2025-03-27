import { 
  PartnerUser, 
  PartnerMetrics, 
  QRActivityData,
  Customer, 
  QRPackage,
  QRPurchase
} from '@/data/schemas/partnerUserSchema';
import { partners } from '@/data/mock/partners';

// Mock partner user accounts
export const partnerUsers: PartnerUser[] = [
  {
    id: "PU-001",
    name: "John Smith",
    email: "john@wellnesscenter.com",
    organization: "Wellness Center",
    role: "admin",
    status: "active",
    createdAt: "2023-01-15",
    lastLogin: "2023-11-12T08:30:45Z",
    avatar: "/avatars/john-smith.jpg",
    phone: "+1 (555) 123-4567",
    address: "123 Fitness Ave, New York, NY 10001",
    partnerId: "P-001"
  },
  {
    id: "PU-002",
    name: "Sarah Johnson",
    email: "sarah@fitnessstudio.com",
    organization: "Fitness Studio",
    role: "admin",
    status: "active",
    createdAt: "2023-02-22",
    lastLogin: "2023-11-10T14:22:15Z",
    avatar: "/avatars/sarah-johnson.jpg",
    phone: "+1 (555) 234-5678",
    address: "456 Health Blvd, Los Angeles, CA 90001",
    partnerId: "P-002"
  },
  {
    id: "PU-003",
    name: "David Miller",
    email: "david@nutritionclinic.com",
    organization: "Nutrition Clinic",
    role: "admin",
    status: "active",
    createdAt: "2023-03-10",
    lastLogin: "2023-11-11T10:15:30Z",
    avatar: "/avatars/david-miller.jpg",
    phone: "+1 (555) 345-6789",
    address: "789 Nutrition St, Chicago, IL 60601",
    partnerId: "P-003"
  },
  {
    id: "PU-004",
    name: "Michael Brown",
    email: "mike@healthpartners.com",
    organization: "Health Partners",
    role: "manager",
    status: "active",
    createdAt: "2023-04-05",
    lastLogin: "2023-11-09T16:45:00Z",
    avatar: "/avatars/michael-brown.jpg",
    phone: "+1 (555) 456-7890",
    partnerId: "P-004"
  },
  {
    id: "PU-005",
    name: "Jennifer Wilson",
    email: "jennifer@medicalcenter.com",
    organization: "Medical Center",
    role: "admin",
    status: "active",
    createdAt: "2023-05-12",
    lastLogin: "2023-11-12T09:20:10Z",
    avatar: "/avatars/jennifer-wilson.jpg",
    partnerId: "P-005"
  }
];

// Generate partner metrics data for each partner
export const partnerMetricsData: Record<string, PartnerMetrics> = {};

// Use the actual data from partners for metrics
partners.forEach(partner => {
  partnerMetricsData[partner.id] = {
    qrCodes: {
      total: partner.totalQRCodes,
      available: partner.totalQRCodes - partner.redeemed,
      used: partner.redeemed,
      growthRate: Math.random() * 20 - 5 // Random growth rate between -5% and 15%
    },
    customers: {
      total: Math.floor(partner.redeemed * (0.8 + Math.random() * 0.4)), // Roughly 0.8-1.2 customers per redemption
      active: Math.floor(partner.redeemed * (0.5 + Math.random() * 0.3)), // Active customers
      new: Math.floor(partner.redeemed * 0.1 * (0.8 + Math.random() * 0.4)), // New customers (about 10% of total)
      growthRate: Math.random() * 25 - 5 // Random growth rate between -5% and 20%
    },
    redemptions: {
      total: partner.redeemed,
      thisMonth: Math.floor(partner.redeemed * (0.05 + Math.random() * 0.05)), // This month's redemptions
      lastMonth: Math.floor(partner.redeemed * (0.04 + Math.random() * 0.05)), // Last month's redemptions
      growthRate: Math.random() * 30 - 10 // Random growth rate between -10% and 20%
    }
  };
});

// Mock QR code activity data for charts
export const qrActivityData: Record<string, QRActivityData[]> = {
  "P-001": [
    { month: 'Jan', scans: 45, redemptions: 35, date: '2023-01-01' },
    { month: 'Feb', scans: 52, redemptions: 42, date: '2023-02-01' },
    { month: 'Mar', scans: 65, redemptions: 53, date: '2023-03-01' },
    { month: 'Apr', scans: 59, redemptions: 49, date: '2023-04-01' },
    { month: 'May', scans: 75, redemptions: 64, date: '2023-05-01' },
    { month: 'Jun', scans: 85, redemptions: 72, date: '2023-06-01' },
    { month: 'Jul', scans: 92, redemptions: 78, date: '2023-07-01' },
    { month: 'Aug', scans: 88, redemptions: 74, date: '2023-08-01' },
    { month: 'Sep', scans: 95, redemptions: 80, date: '2023-09-01' },
    { month: 'Oct', scans: 102, redemptions: 86, date: '2023-10-01' },
    { month: 'Nov', scans: 110, redemptions: 90, date: '2023-11-01' },
    { month: 'Dec', scans: 105, redemptions: 88, date: '2023-12-01' }
  ],
  "P-002": [
    { month: 'Jan', scans: 32, redemptions: 24, date: '2023-01-01' },
    { month: 'Feb', scans: 38, redemptions: 30, date: '2023-02-01' },
    { month: 'Mar', scans: 42, redemptions: 36, date: '2023-03-01' },
    { month: 'Apr', scans: 40, redemptions: 32, date: '2023-04-01' },
    { month: 'May', scans: 45, redemptions: 38, date: '2023-05-01' },
    { month: 'Jun', scans: 50, redemptions: 42, date: '2023-06-01' }
  ],
  "P-003": [
    { month: 'Jul', scans: 25, redemptions: 19, date: '2023-07-01' },
    { month: 'Aug', scans: 28, redemptions: 22, date: '2023-08-01' },
    { month: 'Sep', scans: 30, redemptions: 24, date: '2023-09-01' },
    { month: 'Oct', scans: 34, redemptions: 27, date: '2023-10-01' },
    { month: 'Nov', scans: 38, redemptions: 31, date: '2023-11-01' }
  ]
};

// Generate mock customers for each partner
export const customers: Record<string, Customer[]> = {};

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

// Generate customers for each partner
partners.forEach(partner => {
  const partnerCustomers: Customer[] = [];
  const customerCount = Math.floor(partner.redeemed * (0.8 + Math.random() * 0.4));
  
  for (let i = 0; i < customerCount; i++) {
    const joinedDate = randomDate(new Date('2023-01-01'), new Date());
    const lastActive = randomDate(new Date(joinedDate), new Date());
    const redemptions = Math.floor(Math.random() * 5) + 1; // 1 to 5 redemptions per customer
    
    partnerCustomers.push({
      id: `CUST-${partner.id.substring(2)}-${(i + 1).toString().padStart(3, '0')}`,
      name: `Customer ${(i + 1).toString().padStart(3, '0')}`,
      email: i % 3 === 0 ? `customer${i+1}@example.com` : undefined, // Only some customers provide email
      phone: i % 2 === 0 ? `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      joinedDate,
      lastActive,
      redemptions,
      partnerId: partner.id
    });
  }
  
  customers[partner.id] = partnerCustomers;
});

// Define QR purchase packages
export const qrPackages: QRPackage[] = [
  { 
    id: "PKG-001", 
    name: "Basic", 
    count: 100, 
    price: 49, 
    discountPercent: 0,
    description: "Basic package for small businesses"
  },
  { 
    id: "PKG-002", 
    name: "Standard", 
    count: 500, 
    price: 199, 
    discountPercent: 10,
    popular: true,
    description: "Our most popular package for growing businesses"
  },
  { 
    id: "PKG-003", 
    name: "Professional", 
    count: 1000, 
    price: 349, 
    discountPercent: 15,
    description: "Professional package for established businesses"
  },
  { 
    id: "PKG-004", 
    name: "Enterprise", 
    count: 5000, 
    price: 999, 
    discountPercent: 25,
    description: "Enterprise solution for large organizations"
  }
];

// Generate purchase history for each partner
export const qrPurchases: QRPurchase[] = [
  {
    id: "PURCH-001",
    partnerId: "P-001",
    packageName: "Enterprise",
    count: 5000,
    price: 999,
    purchaseDate: "2023-01-15",
    status: "completed",
    paymentMethod: "Credit Card",
    batchId: "BAT-1234"
  },
  {
    id: "PURCH-002",
    partnerId: "P-001",
    packageName: "Basic",
    count: 100,
    price: 49,
    purchaseDate: "2023-06-22",
    status: "completed",
    paymentMethod: "PayPal",
    batchId: "BAT-1245"
  },
  {
    id: "PURCH-003",
    partnerId: "P-002",
    packageName: "Standard",
    count: 500,
    price: 199,
    purchaseDate: "2023-07-10",
    status: "completed",
    paymentMethod: "Credit Card",
    batchId: "BAT-1235"
  },
  {
    id: "PURCH-004",
    partnerId: "P-003",
    packageName: "Professional",
    count: 1000,
    price: 349,
    purchaseDate: "2023-08-05",
    status: "completed",
    paymentMethod: "Bank Transfer",
    batchId: "BAT-1236"
  },
  {
    id: "PURCH-005",
    partnerId: "P-004",
    packageName: "Enterprise",
    count: 5000,
    price: 999,
    purchaseDate: "2023-09-18",
    status: "completed",
    paymentMethod: "Credit Card",
    batchId: "BAT-1237"
  },
  {
    id: "PURCH-006",
    partnerId: "P-001",
    packageName: null,
    count: 150,
    price: 68.25,
    purchaseDate: "2023-11-05",
    status: "pending",
    paymentMethod: "PayPal"
  }
];

// Export all data for easy import
export default {
  partnerUsers,
  partnerMetricsData,
  qrActivityData,
  customers,
  qrPackages,
  qrPurchases
};

// Partner business information
export const partnerBusinessInfo = {
  'P-001': {
    businessName: 'Example Corporation',
    businessType: 'Corporation',
    address: '123 Business Ave, Suite 100',
    city: 'Metropolis',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    phone: '(555) 123-4567',
    website: 'https://example.com',
    taxId: '12-3456789'
  }
};

// Partner billing history
export const partnerBillingHistory = {
  'P-001': [
    {
      id: 'INV-2023-06-15',
      date: '2023-06-15',
      description: 'Business Plan - Monthly',
      amount: 79.00,
      status: 'paid'
    },
    {
      id: 'INV-2023-05-15',
      date: '2023-05-15',
      description: 'Business Plan - Monthly',
      amount: 79.00,
      status: 'paid'
    },
    {
      id: 'INV-2023-04-15',
      date: '2023-04-15',
      description: 'Business Plan - Monthly',
      amount: 79.00,
      status: 'paid'
    }
  ]
};

// Add these additional analytics data exports:

// Days of week data for analytics
export const daysOfWeekData = [
  { name: 'Mon', scans: 350, redemptions: 250 },
  { name: 'Tue', scans: 420, redemptions: 300 },
  { name: 'Wed', scans: 500, redemptions: 380 },
  { name: 'Thu', scans: 480, redemptions: 360 },
  { name: 'Fri', scans: 600, redemptions: 450 },
  { name: 'Sat', scans: 750, redemptions: 550 },
  { name: 'Sun', scans: 400, redemptions: 300 },
];

// Time of day data for analytics
export const timeOfDayData = [
  { name: '06:00', scans: 120 },
  { name: '08:00', scans: 260 },
  { name: '10:00', scans: 380 },
  { name: '12:00', scans: 520 },
  { name: '14:00', scans: 450 },
  { name: '16:00', scans: 380 },
  { name: '18:00', scans: 420 },
  { name: '20:00', scans: 280 },
  { name: '22:00', scans: 180 },
];

// Channel data for analytics
export const channelData = [
  { name: 'Direct', value: 45 },
  { name: 'Social', value: 25 },
  { name: 'Email', value: 15 },
  { name: 'Referral', value: 10 },
  { name: 'Other', value: 5 },
];

// Chart colors
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Performance data
export const performanceData = [
  { metric: 'Scans', value: 89 },
  { metric: 'Redemptions', value: 78 },
  { metric: 'Retention', value: 65 },
  { metric: 'Engagement', value: 82 },
  { metric: 'Conversion', value: 70 },
]; 