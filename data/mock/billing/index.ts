import { BillingRecord, BillingItem, PaymentMethod } from '@/data/schemas/billingSchema';
import { partners } from '@/data/mock/partners';
import { qrPurchases } from '@/data/mock/partnerUsers';

// Generate mock billing records
export const billingRecords: BillingRecord[] = [
  {
    id: "BILL-001",
    partnerId: "P-001",
    invoiceNumber: "INV-2023-001",
    amount: 999,
    currency: "USD",
    status: "paid",
    dueDate: "2023-01-22",
    createdAt: "2023-01-15",
    paidAt: "2023-01-18",
    items: [
      {
        id: "ITEM-001",
        description: "Enterprise QR Code Package",
        quantity: 1,
        unitPrice: 999,
        amount: 999,
        type: "qr_codes"
      }
    ],
    paymentMethod: "Credit Card",
    billingAddress: "123 Fitness Ave, New York, NY 10001"
  },
  {
    id: "BILL-002",
    partnerId: "P-001",
    invoiceNumber: "INV-2023-002",
    amount: 49,
    currency: "USD",
    status: "paid",
    dueDate: "2023-06-29",
    createdAt: "2023-06-22",
    paidAt: "2023-06-22",
    items: [
      {
        id: "ITEM-002",
        description: "Basic QR Code Package",
        quantity: 1,
        unitPrice: 49,
        amount: 49,
        type: "qr_codes"
      }
    ],
    paymentMethod: "PayPal",
    billingAddress: "123 Fitness Ave, New York, NY 10001"
  },
  {
    id: "BILL-003",
    partnerId: "P-002",
    invoiceNumber: "INV-2023-003",
    amount: 199,
    currency: "USD",
    status: "paid",
    dueDate: "2023-07-17",
    createdAt: "2023-07-10",
    paidAt: "2023-07-12",
    items: [
      {
        id: "ITEM-003",
        description: "Standard QR Code Package",
        quantity: 1,
        unitPrice: 199,
        amount: 199,
        type: "qr_codes"
      }
    ],
    paymentMethod: "Credit Card",
    billingAddress: "456 Health Blvd, Los Angeles, CA 90001"
  },
  {
    id: "BILL-004",
    partnerId: "P-003",
    invoiceNumber: "INV-2023-004",
    amount: 349,
    currency: "USD",
    status: "paid",
    dueDate: "2023-08-12",
    createdAt: "2023-08-05",
    paidAt: "2023-08-05",
    items: [
      {
        id: "ITEM-004",
        description: "Professional QR Code Package",
        quantity: 1,
        unitPrice: 349,
        amount: 349,
        type: "qr_codes"
      }
    ],
    paymentMethod: "Bank Transfer",
    billingAddress: "789 Nutrition St, Chicago, IL 60601"
  },
  {
    id: "BILL-005",
    partnerId: "P-004",
    invoiceNumber: "INV-2023-005",
    amount: 999,
    currency: "USD",
    status: "paid",
    dueDate: "2023-09-25",
    createdAt: "2023-09-18",
    paidAt: "2023-09-20",
    items: [
      {
        id: "ITEM-005",
        description: "Enterprise QR Code Package",
        quantity: 1,
        unitPrice: 999,
        amount: 999,
        type: "qr_codes"
      }
    ],
    paymentMethod: "Credit Card",
    billingAddress: "101 Medical Drive, Boston, MA 02115"
  },
  {
    id: "BILL-006",
    partnerId: "P-001",
    invoiceNumber: "INV-2023-006",
    amount: 68.25,
    currency: "USD",
    status: "pending",
    dueDate: "2023-11-12",
    createdAt: "2023-11-05",
    items: [
      {
        id: "ITEM-006",
        description: "Custom QR Code Batch",
        quantity: 150,
        unitPrice: 0.455,
        amount: 68.25,
        type: "qr_codes"
      }
    ],
    paymentMethod: "PayPal",
    billingAddress: "123 Fitness Ave, New York, NY 10001"
  }
];

// Generate mock payment methods
export const paymentMethods: PaymentMethod[] = [
  {
    id: "PM-001",
    partnerId: "P-001",
    type: "credit_card",
    isDefault: true,
    lastFour: "4242",
    expiryDate: "12/25",
    holderName: "John Smith"
  },
  {
    id: "PM-002",
    partnerId: "P-001",
    type: "paypal",
    isDefault: false,
    holderName: "John Smith"
  },
  {
    id: "PM-003",
    partnerId: "P-002",
    type: "credit_card",
    isDefault: true,
    lastFour: "1234",
    expiryDate: "10/24",
    holderName: "Sarah Johnson"
  },
  {
    id: "PM-004",
    partnerId: "P-003",
    type: "bank_transfer",
    isDefault: true,
    holderName: "David Miller"
  },
  {
    id: "PM-005",
    partnerId: "P-004",
    type: "credit_card",
    isDefault: true,
    lastFour: "5678",
    expiryDate: "08/26",
    holderName: "Michael Brown"
  }
];

// Export all billing data
export default {
  billingRecords,
  paymentMethods
}; 