// Define billing record schema
export interface BillingRecord {
  id: string;
  partnerId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  items: BillingItem[];
  paymentMethod?: string;
  billingAddress?: string;
}

// Define billing item schema
export interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: 'qr_codes' | 'subscription' | 'service' | 'other';
}

// Define payment method schema
export interface PaymentMethod {
  id: string;
  partnerId: string;
  type: 'credit_card' | 'bank_transfer' | 'paypal' | 'other';
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
  holderName?: string;
}

// Define billing status options
export const BILLING_STATUS_OPTIONS = [
  'paid',
  'pending',
  'overdue',
  'cancelled'
];

// Define payment methods
export const PAYMENT_METHODS = [
  'Credit Card',
  'Bank Transfer',
  'PayPal',
  'Check',
  'Cash',
  'Other'
]; 