// Define partner schema
export interface Partner {
  id: string;
  name: string;
  email: string;
  logo?: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  totalQRCodes: number;
  redeemed: number;
  description?: string;
  websiteUrl?: string;
  address?: string;
  phone?: string;
  industry?: string;
  tier: 'basic' | 'premium' | 'enterprise';
  contactPerson?: string;
  type?: string;
}

// Define partner types for the system
export const PARTNER_TYPES = [
  "Gym", 
  "Fitness Center", 
  "Healthcare", 
  "Clinic", 
  "Wellness Center", 
  "Nutrition", 
  "Sports Center", 
  "Physical Therapy", 
  "Medical Center", 
  "Others"
]; 