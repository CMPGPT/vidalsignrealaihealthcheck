'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, FileText, Building, Globe, Loader2, Upload, Palette, Rocket, ExternalLink, Image, TrendingUp, Users, DollarSign, RefreshCw } from "lucide-react";
import { useSession } from 'next-auth/react';
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing-hooks";
import BrandingEditor from "@/components/partners/BrandingEditor";

// Import centralized data
import { partnerBusinessInfo, partnerBillingHistory } from "@/data/mock/partnerUsers";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  organizationName: string;
  businessAddress: string;
  city: string;
  state: string;
  zip: string;
  businessType: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
}

interface BrandSettings {
  brandName: string;
  logoUrl: string;
  selectedTheme: string;
  websiteStyle: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  heroSection: {
    headline: string;
    subheadline: string;
    ctaText: string;
    secondaryCtaText: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  featuresSection: {
    title: string;
    subtitle: string;
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  pricingSection: {
    enabled: boolean;
    title: string;
    subtitle: string;
    plans: Array<{
      name: string;
      price: string;
      quantity: string;
      description: string;
      features: string[];
      popular: boolean;
      buttonText: string;
    }>;
  };
  isDeployed: boolean;
  websiteUrl: string;
  lastDeployedAt?: Date;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    website: '',
    organizationName: '',
    businessAddress: '',
    city: '',
    state: '',
    zip: '',
    businessType: ''
  });
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    brandName: '',
    logoUrl: '',
    selectedTheme: 'medical',
    websiteStyle: 'classic',
    customColors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#06b6d4'
    },
    heroSection: {
      headline: 'Understand Your Lab Results In Plain English',
      subheadline: 'Translate complex lab reports into clear, easy-to-understand explanations using advanced AI technology—no medical knowledge required.',
      ctaText: 'Upload Your Labs',
      secondaryCtaText: 'Learn More',
      stats: [
        { value: '100K+', label: 'Healthcare Providers' },
        { value: '500K+', label: 'Patients Served' },
        { value: '4.9/5', label: 'Satisfaction Score' },
        { value: 'HIPAA', label: 'Compliant' }
      ]
    },
    featuresSection: {
      title: 'Two Simple Ways to Access',
      subtitle: 'Flexible access options for individuals and businesses, with no complex dashboards or management required.',
      features: [
        {
          title: 'Simple Upload Process',
          description: 'Upload your lab reports as PDFs or images in seconds. Our AI automatically recognizes test results.',
          icon: 'upload'
        },
        {
          title: 'AI-Powered Explanations', 
          description: 'Receive clear explanations of your lab results with actionable insights in plain language.',
          icon: 'brain'
        },
        {
          title: 'HIPAA Compliant',
          description: 'All data is processed securely with full HIPAA compliance and encryption standards.',
          icon: 'shield'
        }
      ]
    },
    pricingSection: {
      enabled: true,
      title: 'QR Codes & Secure Links',
      subtitle: 'Purchase QR codes and secure links to share lab reports with your patients.',
      plans: [
        {
          name: 'Starter Pack',
          price: '$29',
          quantity: '10 QR Codes',
          description: 'Perfect for small practices',
          features: [
            '10 QR Codes',
            'Secure link generation',
            'Basic support',
            '24-hour expiry'
          ],
          popular: false,
          buttonText: 'Purchase Now'
        }
      ]
    },
    isDeployed: false,
    websiteUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('all');
  
  const { data: session, status } = useSession();
  
  // UploadThing hook for brand logo upload
  const { startUpload: startLogoUpload, isUploading: isUploadingLogo } = useUploadThing("brandLogoUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        console.log('✅ LOGO UPLOAD: Upload completed:', res[0]);
        setBrandSettings(prev => ({
          ...prev,
          logoUrl: res[0].url
        }));
        toast.success('Logo uploaded successfully!');
      }
    },
    onUploadError: (error) => {
      console.error('❌ LOGO UPLOAD: Upload failed:', error);
      toast.error('Logo upload failed. Please try again.');
    },
  });
  
  // Get partner ID from session (MongoDB _id)
  const partnerId = (session?.user as any)?.partnerId || null;

  // Fetch billing history
  const fetchBillingHistory = async (period: string = 'all') => {
    setBillingLoading(true);
    try {
      console.log('🔍 BILLING: Fetching billing history for partnerId:', partnerId);
      const response = await fetch(`/api/partner-billing-history?partnerId=${partnerId}&period=${period}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ BILLING: Billing data received:', data.data);
        setBillingData(data.data);
      } else {
        console.error('❌ BILLING: Failed to fetch billing history:', data.error);
        toast.error('Failed to load billing history');
      }
    } catch (error) {
      console.error('❌ BILLING: Error fetching billing history:', error);
      toast.error('Failed to load billing history');
    } finally {
      setBillingLoading(false);
    }
  };
  
  // Get partner business info from centralized store (fallback)
  const businessInfo = partnerBusinessInfo["P-001"] || {
    businessName: '',
    businessType: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  };
  
  // Get partner billing history from centralized store
  const billingHistory = partnerBillingHistory["P-001"] || [];

  // Fetch user profile data and brand settings
  useEffect(() => {
    const fetchData = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 SETTINGS: Fetching profile and brand data...');
        
        // Fetch profile data
        const profileResponse = await fetch('/api/get-profile');
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          console.log('✅ SETTINGS: Profile data received:', profileData.profile);
          setProfileData(profileData.profile);
        } else {
          console.log('❌ SETTINGS: Failed to fetch profile:', profileData.message);
          toast.error('Failed to load profile data');
        }
        
        // Fetch brand settings
        const brandResponse = await fetch('/api/brand-settings');
        
        if (!brandResponse.ok) {
          throw new Error('Failed to fetch brand settings');
        }

        const brandData = await brandResponse.json();
        
        if (brandData.success) {
          console.log('✅ SETTINGS: Brand settings received:', brandData.brandSettings);
          setBrandSettings(prev => ({
            ...prev,
            brandName: brandData.brandSettings.brandName || '',
            logoUrl: brandData.brandSettings.logoUrl || '',
            selectedTheme: brandData.brandSettings.selectedTheme || 'medical',
            websiteStyle: brandData.brandSettings.websiteStyle || 'classic',
            customColors: brandData.brandSettings.customColors || prev.customColors,
            heroSection: brandData.brandSettings.heroSection || prev.heroSection,
            featuresSection: brandData.brandSettings.featuresSection || prev.featuresSection,
            pricingSection: brandData.brandSettings.pricingSection || prev.pricingSection,
            isDeployed: brandData.brandSettings.isDeployed || false,
            websiteUrl: brandData.brandSettings.websiteUrl || '',
            lastDeployedAt: brandData.brandSettings.lastDeployedAt ? new Date(brandData.brandSettings.lastDeployedAt) : undefined
          }));
        } else {
          console.log('🔍 SETTINGS: No brand settings found, using defaults');
        }
        
      } catch (error) {
        console.error('❌ SETTINGS: Error fetching data:', error);
        toast.error('Failed to load settings data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchBillingHistory();
  }, [session, status, partnerId]);

  // Handle form input changes
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle brand settings update
  const updateBrandSettings = (settings: BrandSettings) => {
    setBrandSettings(settings);
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('🔍 SETTINGS: Submitting profile update...');
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ SETTINGS: Profile updated successfully');
        toast.success('Profile updated successfully!');
      } else {
        console.log('❌ SETTINGS: Profile update failed:', data.message);
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ SETTINGS: Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle business info form submission
  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('🔍 SETTINGS: Submitting business info update...');
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationName: profileData.organizationName,
          businessType: profileData.businessType,
          businessAddress: profileData.businessAddress,
          city: profileData.city,
          state: profileData.state,
          zip: profileData.zip,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ SETTINGS: Business info updated successfully');
        toast.success('Business information updated successfully!');
      } else {
        console.log('❌ SETTINGS: Business info update failed:', data.message);
        toast.error(data.message || 'Failed to update business information');
      }
    } catch (error) {
      console.error('❌ SETTINGS: Error updating business info:', error);
      toast.error('Failed to update business information');
    } finally {
      setSaving(false);
    }
  };

  // Handle brand settings form submission
  const handleBrandSubmit = async (e: React.FormEvent, settingsToSave?: BrandSettings) => {
    e.preventDefault();
    setSaving(true);

    // Use passed settings or current brandSettings
    const settingsData = settingsToSave || brandSettings;

    try {
      console.log('🔍 SETTINGS: Submitting brand settings update...', settingsData);
      const response = await fetch('/api/brand-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ SETTINGS: Brand settings updated successfully');
        toast.success('Brand settings saved successfully!');
        
        // Update local state with the response
        setBrandSettings(prev => ({
          ...prev,
          ...data.brandSettings
        }));
      } else {
        console.log('❌ SETTINGS: Brand settings update failed:', data.message);
        toast.error(data.message || 'Failed to save brand settings');
      }
    } catch (error) {
      console.error('❌ SETTINGS: Error updating brand settings:', error);
      toast.error('Failed to save brand settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle website deployment
  const handleDeploy = async () => {
    if (!brandSettings.brandName) {
      toast.error('Please set a brand name before deploying');
      return;
    }

    setDeploying(true);

    try {
      console.log('🔍 SETTINGS: Starting website deployment...');
      const response = await fetch('/api/deploy-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ SETTINGS: Website deployed successfully');
        
        // Update local state with deployment info
        setBrandSettings(prev => ({
          ...prev,
          isDeployed: true,
          websiteUrl: data.websiteUrl,
          lastDeployedAt: new Date(data.deployedAt)
        }));
        
        // Show deployment success message
        toast.success(`Website deployed successfully! Visit: ${data.partnerUrl}`);
      } else {
        console.log('❌ SETTINGS: Website deployment failed:', data.message);
        toast.error(data.message || 'Failed to deploy website');
      }
    } catch (error) {
      console.error('❌ SETTINGS: Error deploying website:', error);
      toast.error('Failed to deploy website');
    } finally {
      setDeploying(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('File size must be less than 4MB');
      return;
    }

    try {
      console.log('🔍 SETTINGS: Starting logo upload...');
      await startLogoUpload([file]);
    } catch (error) {
      console.error('❌ SETTINGS: Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleStripeCredentialsSave = async () => {
    setSaving(true);
    try {
      console.log('🔍 STRIPE SAVE: Saving credentials:', {
        stripePublishableKey: profileData.stripePublishableKey ? '***' : 'empty',
        stripeSecretKey: profileData.stripeSecretKey ? '***' : 'empty',
        stripeWebhookSecret: profileData.stripeWebhookSecret ? '***' : 'empty',
      });

      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripePublishableKey: profileData.stripePublishableKey,
          stripeSecretKey: profileData.stripeSecretKey,
          stripeWebhookSecret: profileData.stripeWebhookSecret,
        }),
      });

      const data = await response.json();
      console.log('🔍 STRIPE SAVE: Response:', data);

      if (response.ok && data.success) {
        toast.success('Stripe credentials saved successfully!');
        console.log('✅ STRIPE SAVE: Credentials saved successfully');
      } else {
        console.log('❌ STRIPE SAVE: Failed to save:', data.error || data.message);
        toast.error(data.error || data.message || 'Failed to save Stripe credentials');
      }
    } catch (error) {
      console.error('❌ STRIPE SAVE: Error saving Stripe credentials:', error);
      toast.error('Failed to save Stripe credentials');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* <h2 className="text-xl font-semibold mb-6">Account Settings</h2> */}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="overflow-x-auto whitespace-nowrap w-full pl-[30px] sm:pl-0">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBusinessSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input 
                      id="business-name" 
                      value={profileData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-type">Business Type</Label>
                    <Input 
                      id="business-type" 
                      value={profileData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      placeholder="e.g., Healthcare, Technology, Retail"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={profileData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="Enter your business address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input 
                      id="state" 
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state/province"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Postal Code</Label>
                    <Input 
                      id="zip" 
                      value={profileData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Integration</CardTitle>
              <CardDescription>
                Configure your Stripe credentials to receive payments from your website customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Stripe Account Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {profileData.stripePublishableKey && profileData.stripeSecretKey 
                        ? '✅ Connected' 
                        : '❌ Not configured'}
                    </p>
                  </div>
                  <Button variant="outline">Test Connection</Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Stripe Credentials</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
                    <Input 
                      id="stripe-publishable-key"
                      type="password"
                      value={profileData.stripePublishableKey || ''}
                      onChange={(e) => handleInputChange('stripePublishableKey', e.target.value)}
                      placeholder="pk_test_..."
                    />
                    <p className="text-xs text-muted-foreground">Your Stripe publishable key (starts with pk_)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret-key">Secret Key</Label>
                    <Input 
                      id="stripe-secret-key"
                      type="password"
                      value={profileData.stripeSecretKey || ''}
                      onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                      placeholder="sk_test_..."
                    />
                    <p className="text-xs text-muted-foreground">Your Stripe secret key (starts with sk_)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripe-webhook-secret">Webhook Secret (Optional)</Label>
                    <Input 
                      id="stripe-webhook-secret"
                      type="password"
                      value={profileData.stripeWebhookSecret || ''}
                      onChange={(e) => handleInputChange('stripeWebhookSecret', e.target.value)}
                      placeholder="whsec_..."
                    />
                    <p className="text-xs text-muted-foreground">Webhook secret for payment confirmations</p>
                  </div>
                  
                  <Button onClick={handleStripeCredentialsSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Stripe Credentials
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Revenue & Sales Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 border border-border rounded-lg bg-background">
                    <div className="text-2xl font-bold text-green-600">
                      ${billingData?.statistics?.totalRevenue?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-background">
                    <div className="text-2xl font-bold text-blue-600">
                      {billingData?.statistics?.totalSales || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-background">
                    <div className="text-2xl font-bold text-purple-600">
                      {billingData?.statistics?.totalCustomers || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Unique Customers</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-background">
                    <div className="text-2xl font-bold text-orange-600">
                      ${billingData?.statistics?.totalSpent?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Transaction History</h3>
                  <div className="flex items-center gap-2">
                    <select 
                      value={billingPeriod} 
                      onChange={(e) => {
                        setBillingPeriod(e.target.value);
                        fetchBillingHistory(e.target.value);
                      }}
                      className="px-3 py-1 border border-border rounded-md text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        setBillingLoading(true);
                        try {
                          const response = await fetch(`/api/refresh-billing-data?partnerId=${partnerId}`);
                          if (response.ok) {
                            toast.success('Billing data refreshed successfully');
                            // Refetch billing history after refresh
                            fetchBillingHistory(billingPeriod);
                          } else {
                            toast.error('Failed to refresh billing data');
                          }
                        } catch (error) {
                          console.error('Error refreshing billing data:', error);
                          toast.error('Failed to refresh billing data');
                        } finally {
                          setBillingLoading(false);
                        }
                      }}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                {billingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Customer/Plan</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingData?.transactions?.length > 0 ? (
                          billingData.transactions.map((transaction: any) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {new Date(transaction.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.type === 'sale' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {transaction.type === 'sale' ? 'Sale' : 'Purchase'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {transaction.type === 'sale' 
                                  ? transaction.customerEmail 
                                  : transaction.planName
                                }
                              </TableCell>
                              <TableCell>
                                {transaction.type === 'sale' 
                                  ? transaction.quantity 
                                  : '-'
                                }
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                <span className={transaction.type === 'sale' ? 'text-green-600' : 'text-blue-600'}>
                                  ${transaction.amount?.toFixed(2) || '0.00'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No transactions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              
              {/* Monthly Revenue Chart */}
              {billingData?.monthlyStats?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Monthly Revenue Trend</h3>
                  <div className="border border-border rounded-lg p-4 bg-background">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {billingData.monthlyStats.slice(0, 6).map((stat: any, index: number) => {
                        const monthNames = [
                          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                        ];
                        const monthName = monthNames[stat._id.month - 1];
                        const year = stat._id.year;
                        
                        return (
                          <div key={index} className="p-3 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                {monthName} {year}
                              </span>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              ${stat.revenue?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stat.count} sales
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Customer Insights */}
              {billingData?.statistics?.totalCustomers > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Customer Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-lg p-4 bg-background">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">Customer Overview</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Customers:</span>
                          <span className="font-medium">{billingData.statistics.totalCustomers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Average Revenue per Customer:</span>
                          <span className="font-medium">
                            ${(billingData.statistics.totalRevenue / billingData.statistics.totalCustomers).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Sales:</span>
                          <span className="font-medium">{billingData.statistics.totalSales}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-lg p-4 bg-background">
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium">Revenue Summary</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Revenue:</span>
                          <span className="font-medium text-green-600">
                            ${billingData.statistics.totalRevenue?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Spent:</span>
                          <span className="font-medium text-orange-600">
                            ${billingData.statistics.totalSpent?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Net Profit:</span>
                          <span className="font-medium text-blue-600">
                            ${(billingData.statistics.totalRevenue - billingData.statistics.totalSpent).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <BrandingEditor
            initialSettings={brandSettings}
            onSave={async (settings) => {
              console.log('🔍 PARENT: Received settings from BrandingEditor:', JSON.stringify(settings, null, 2));
              setBrandSettings(settings);
              const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
              await handleBrandSubmit(fakeEvent, settings);
            }}
            onDeploy={handleDeploy}
            isLoading={saving}
            isDeploying={deploying}
          />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password. We recommend using a strong, unique password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              
              <Button>Update Password</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Enable two-factor authentication for enhanced security.</p>
                </div>
                <Switch />
              </div>
              
              <Button variant="outline">Setup Two-Factor Authentication</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 