// Define partner user account schema
export interface PartnerUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  partnerId: string;
}

// Define partner dashboard metrics schema
export interface PartnerMetrics {
  qrCodes: {
    total: number;
    available: number;
    used: number;
    growthRate: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
    growthRate: number;
  };
  redemptions: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
}

// Define QR code activity chart data schema
export interface QRActivityData {
  month: string;
  scans: number;
  redemptions: number;
  date: string;
}

// Define customer data schema
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  joinedDate: string;
  lastActive: string;
  redemptions: number;
  partnerId: string;
}

// Define QR purchase package schema
export interface QRPackage {
  id: string;
  name: string;
  count: number;
  price: number;
  discountPercent: number;
  popular?: boolean;
  description?: string;
}

// Define QR purchase history schema
export interface QRPurchase {
  id: string;
  partnerId: string;
  packageName: string | null;
  count: number;
  price: number;
  purchaseDate: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  batchId?: string;
} 