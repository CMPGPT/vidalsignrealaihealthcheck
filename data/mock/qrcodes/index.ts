import { QRCodeBatch, QRCode, BATCH_STATUS_OPTIONS } from '../../schemas/qrCodeSchema';
import { partners } from '@/data/mock/partners';

// Generate mock QR code batches
export const qrCodeBatches: QRCodeBatch[] = [
  {
    id: "BAT-1234",
    partnerId: "P-001",
    name: "January Wellness Campaign",
    description: "QR codes for the January wellness promotion",
    createdAt: "2023-01-15",
    totalCodes: 5000,
    assignedCodes: 3200,
    scannedCodes: 2900,
    redeemedCodes: 2400,
    purchaseId: "PURCH-001",
    // Add properties required by QRCodeManager
    status: "active",
    total: 5000,
    used: 3200,
    partnerName: "Wellness Center",
    created: "2023-01-15"
  },
  {
    id: "BAT-1245",
    partnerId: "P-001",
    name: "Summer Health Drive",
    description: "QR codes for summer health initiative",
    createdAt: "2023-06-22",
    totalCodes: 100,
    assignedCodes: 80,
    scannedCodes: 65,
    redeemedCodes: 50,
    purchaseId: "PURCH-002",
    // Add properties required by QRCodeManager
    status: "active",
    total: 100, 
    used: 80,
    partnerName: "Wellness Center",
    created: "2023-06-22"
  },
  {
    id: "BAT-1235",
    partnerId: "P-002",
    name: "Fitness Challenge",
    description: "QR codes for quarterly fitness challenge",
    createdAt: "2023-07-10",
    totalCodes: 500,
    assignedCodes: 425,
    scannedCodes: 380,
    redeemedCodes: 320,
    purchaseId: "PURCH-003",
    // Add properties required by QRCodeManager
    status: "active", 
    total: 500,
    used: 425,
    partnerName: "Fitness Studio",
    created: "2023-07-10"
  },
  {
    id: "BAT-1236",
    partnerId: "P-003",
    name: "Nutrition Consultation",
    description: "QR codes for nutrition consultation services",
    createdAt: "2023-08-05",
    totalCodes: 1000,
    assignedCodes: 700,
    scannedCodes: 580,
    redeemedCodes: 490,
    purchaseId: "PURCH-004",
    // Add properties required by QRCodeManager
    status: "pending",
    total: 1000,
    used: 700,
    partnerName: "Nutrition Clinic",
    created: "2023-08-05"
  },
  {
    id: "BAT-1237",
    partnerId: "P-004",
    name: "Health Assessment",
    description: "QR codes for free health assessments",
    createdAt: "2023-09-18",
    totalCodes: 5000,
    assignedCodes: 3500,
    scannedCodes: 2800,
    redeemedCodes: 2100,
    purchaseId: "PURCH-005",
    // Add properties required by QRCodeManager
    status: "completed",
    total: 5000, 
    used: 3500,
    partnerName: "Health Partners",
    created: "2023-09-18"
  }
];

// Generate mock QR codes
const mockQRCodes: QRCode[] = [];

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

// Generate QR codes for each batch
qrCodeBatches.forEach(batch => {
  const batchDate = new Date(batch.createdAt);
  
  // Generate some assigned QR codes (with customer info)
  for (let i = 0; i < batch.assignedCodes; i++) {
    const isScanned = i < batch.scannedCodes;
    const isRedeemed = i < batch.redeemedCodes;
    const assignedDate = randomDate(batchDate, new Date());
    const scanDate = isScanned ? randomDate(new Date(assignedDate), new Date()) : undefined;
    const redemptionDate = isRedeemed ? randomDate(scanDate ? new Date(scanDate) : new Date(assignedDate), new Date()) : undefined;
    
    mockQRCodes.push({
      id: `QR-${batch.id}-${(i + 1).toString().padStart(5, '0')}`,
      partnerId: batch.partnerId,
      batchId: batch.id,
      createdAt: batch.createdAt,
      url: `https://vidalsigns.com/qr/${batch.id}/${(i + 1).toString().padStart(5, '0')}`,
      assigned: true,
      customerName: `Customer ${(i + 1).toString().padStart(3, '0')}`,
      customerId: `CUST-${batch.partnerId.substring(2)}-${(i + 1).toString().padStart(3, '0')}`,
      assignedDate,
      scanned: isScanned,
      scanDate,
      redeemed: isRedeemed,
      redemptionDate,
      metadata: {
        campaign: batch.name,
        location: i % 3 === 0 ? "In-store" : i % 3 === 1 ? "Online" : "Event",
        tags: i % 2 === 0 ? ["promotion", "wellness"] : ["health", "discount"]
      },
      // Additional properties required by QRCodeManager
      used: isScanned,
      usedDate: scanDate,
      usedBy: isScanned ? `User-${(i + 1).toString().padStart(3, '0')}` : undefined,
      generated: batch.createdAt
    });
  }
  
  // Generate some unassigned QR codes
  for (let i = batch.assignedCodes; i < batch.totalCodes; i++) {
    mockQRCodes.push({
      id: `QR-${batch.id}-${(i + 1).toString().padStart(5, '0')}`,
      partnerId: batch.partnerId,
      batchId: batch.id,
      createdAt: batch.createdAt,
      url: `https://vidalsigns.com/qr/${batch.id}/${(i + 1).toString().padStart(5, '0')}`,
      assigned: false,
      scanned: false,
      redeemed: false,
      // Additional properties required by QRCodeManager
      used: false,
      generated: batch.createdAt
    });
  }
});

// Export QR codes and batches
export const qrCodes = mockQRCodes;

// Organize QR codes by batch ID for easier lookup
export const qrCodesData: Record<string, QRCode[]> = {};
mockQRCodes.forEach(qrCode => {
  if (!qrCodesData[qrCode.batchId]) {
    qrCodesData[qrCode.batchId] = [];
  }
  qrCodesData[qrCode.batchId].push(qrCode);
});

// Export partners for the dropdown in QR code manager
export const partnersForQRCode = qrCodeBatches.map(batch => ({
  id: batch.partnerId,
  name: batch.name
})).filter((partner, index, self) => 
  self.findIndex(p => p.id === partner.id) === index
);

// Export as default
export default {
  qrCodeBatches,
  qrCodes,
  qrCodesData,
  partnersForQRCode
}; 