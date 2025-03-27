// Export all schema types for use in the application
import * as PartnerSchema from './partnerSchema';
import * as QRCodeSchema from './qrCodeSchema';
import * as BillingSchema from './billingSchema';
import * as AnalyticsSchema from './analyticsSchema';
import * as PartnerUserSchema from './partnerUserSchema';

export {
  PartnerSchema,
  QRCodeSchema,
  BillingSchema,
  AnalyticsSchema,
  PartnerUserSchema
};

// Also export types directly to maintain backward compatibility
export * from './partnerSchema';
export * from './qrCodeSchema';
export * from './billingSchema';
export * from './analyticsSchema';
export * from './partnerUserSchema'; 