// Export all mock data
export * from './partners';
export * from './qrcodes';
export * from './billing';
export * from './analytics';
export * from './partnerUsers';
export * from './settings';
export * from './reports';

// Default export for easy import
import partners from './partners';
import qrCodes from './qrcodes';
import billing from './billing';
import analytics from './analytics';
import partnerUsers from './partnerUsers';
import settings from './settings';
import reports from './reports';

export default {
  partners,
  qrCodes,
  billing,
  analytics,
  partnerUsers,
  settings,
  reports
}; 