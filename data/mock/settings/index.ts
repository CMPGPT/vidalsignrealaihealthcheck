import { AppSettings, ColorTheme } from '@/data/schemas/settingsSchema';

// API Keys as variables
const PROD_API_KEY = process.env.NEXT_PUBLIC_PROD_API_KEY || 'vid_prod_3a7c9b2e8f1d5e4a6b3c7d9e';
const DEV_API_KEY = process.env.NEXT_PUBLIC_DEV_API_KEY || 'vid_dev_5e8f7a6b9c3d1e4f7a2b5c8d';
const ANALYTICS_API_KEY = process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || 'vid_analytics_2d4f6a8b9c1e3d5f7a2b4c6e';
const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GA_ID || 'UA-123456789-1';
const MAILCHIMP_API_KEY = process.env.NEXT_PUBLIC_MAILCHIMP_KEY || '';
const SLACK_TOKEN = process.env.NEXT_PUBLIC_SLACK_TOKEN || 'MockToken';

// Color themes for the application
export const colorThemes: ColorTheme[] = [
  { id: "blue", name: "Blue", primary: "#3b82f6", secondary: "#93c5fd" },
  { id: "green", name: "Green", primary: "#10b981", secondary: "#6ee7b7" },
  { id: "purple", name: "Purple", primary: "#8b5cf6", secondary: "#c4b5fd" },
  { id: "red", name: "Red", primary: "#ef4444", secondary: "#fca5a5" },
  { id: "orange", name: "Orange", primary: "#f97316", secondary: "#fdba74" }
];

// Default app settings
export const defaultSettings: AppSettings = {
  id: 'settings-001',
  theme: 'blue',
  language: 'en',
  notificationsEnabled: true,
  emailNotifications: true,
  twoFactorAuth: false,
  dateFormat: 'MM/DD/YYYY',
  timezone: 'UTC',
  updatedAt: new Date().toISOString()
};

// API key mock data
export const apiKeys = [
  {
    id: 'key-001',
    name: 'Production API Key',
    key: PROD_API_KEY,
    createdAt: '2023-06-15T10:30:00Z',
    lastUsed: '2023-08-20T15:45:30Z',
    permissions: ['read', 'write']
  },
  {
    id: 'key-002',
    name: 'Development API Key',
    key: DEV_API_KEY,
    createdAt: '2023-07-10T09:15:00Z',
    lastUsed: '2023-08-19T12:20:15Z',
    permissions: ['read', 'write', 'delete']
  },
  {
    id: 'key-003',
    name: 'Analytics API Key',
    key: ANALYTICS_API_KEY,
    createdAt: '2023-08-05T14:45:00Z',
    lastUsed: '2023-08-18T10:10:45Z',
    permissions: ['read']
  }
];

// App integration settings
export const integrations = [
  {
    id: 'integration-001',
    name: 'Google Analytics',
    enabled: true,
    apiKey: GOOGLE_ANALYTICS_ID,
    lastSynced: '2023-08-19T08:30:00Z'
  },
  {
    id: 'integration-002',
    name: 'Mailchimp',
    enabled: false,
    apiKey: MAILCHIMP_API_KEY,
    lastSynced: null
  },
  {
    id: 'integration-003',
    name: 'Slack',
    enabled: true,
    apiKey: SLACK_TOKEN,
    lastSynced: '2023-08-20T13:15:00Z'
  }
];

export default {
  colorThemes,
  defaultSettings,
  apiKeys,
  integrations
}; 