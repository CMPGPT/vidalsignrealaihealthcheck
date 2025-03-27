// Define color theme schema
export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

// Define application settings schema
export interface AppSettings {
  id: string;
  theme: string;
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  dateFormat: string;
  timezone: string;
  updatedAt: string;
}

// Define settings categories
export const SETTING_CATEGORIES = [
  'general',
  'appearance',
  'notifications',
  'security',
  'billing',
  'integrations'
];

// Define date formats
export const DATE_FORMATS = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY-MM-DD',
  'DD.MM.YYYY',
  'MMMM D, YYYY'
];

// Define timezone options (abbreviated list)
export const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
]; 