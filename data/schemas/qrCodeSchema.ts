// Define QR code schema
export interface QRCode {
  id: string;
  partnerId: string;
  batchId: string;
  createdAt: string;
  expiresAt?: string;
  url: string;
  assigned: boolean;
  customerName?: string;
  customerId?: string;
  assignedDate?: string;
  scanned: boolean;
  scanDate?: string;
  redeemed: boolean;
  redemptionDate?: string;
  metadata?: Record<string, unknown>;
  used?: boolean;
  usedDate?: string;
  usedBy?: string;
  generated?: string;
}

// Define QR code batch schema
export interface QRCodeBatch {
  id: string;
  partnerId: string;
  name: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
  totalCodes: number;
  assignedCodes: number;
  scannedCodes: number;
  redeemedCodes: number;
  purchaseId?: string;
  packageName?: string;
  status?: 'active' | 'pending' | 'completed' | 'expired';
  total?: number;
  used?: number;
  partnerName?: string;
  created?: string;
}

// Define the status options for batches
export const BATCH_STATUS_OPTIONS = [
  'active',
  'pending',
  'completed',
  'expired'
]; 