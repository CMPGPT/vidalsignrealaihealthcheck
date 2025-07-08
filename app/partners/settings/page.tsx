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
import { CreditCard, FileText, Building, Globe, Loader2, Upload, Palette, Rocket, ExternalLink, Image } from "lucide-react";
import { useSession } from 'next-auth/react';
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing-hooks";

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
}

interface BrandSettings {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
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
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    isDeployed: false,
    websiteUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  
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
  
  // Default partner ID - in a real app this would come from auth context
  const partnerId = "P-001";
  
  // Get partner business info from centralized store (fallback)
  const businessInfo = partnerBusinessInfo[partnerId] || {
    businessName: '',
    businessType: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  };
  
  // Get partner billing history from centralized store
  const billingHistory = partnerBillingHistory[partnerId] || [];

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
          setBrandSettings({
            brandName: brandData.brandSettings.brandName || '',
            logoUrl: brandData.brandSettings.logoUrl || '',
            primaryColor: brandData.brandSettings.primaryColor || '#3B82F6',
            secondaryColor: brandData.brandSettings.secondaryColor || '#10B981',
            isDeployed: brandData.brandSettings.isDeployed || false,
            websiteUrl: brandData.brandSettings.websiteUrl || '',
            lastDeployedAt: brandData.brandSettings.lastDeployedAt ? new Date(brandData.brandSettings.lastDeployedAt) : undefined
          });
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
  }, [session, status]);

  // Handle form input changes
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle brand settings input changes
  const handleBrandInputChange = (field: keyof BrandSettings, value: string) => {
    setBrandSettings(prev => ({
      ...prev,
      [field]: value
    }));
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
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('🔍 SETTINGS: Submitting brand settings update...');
      const response = await fetch('/api/brand-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName: brandSettings.brandName,
          logoUrl: brandSettings.logoUrl,
          primaryColor: brandSettings.primaryColor,
          secondaryColor: brandSettings.secondaryColor,
        }),
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
              <CardTitle>Billing and Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Current Plan: Business</h3>
                    <p className="text-sm text-muted-foreground">$79/month, billed monthly</p>
                  </div>
                  <Button variant="outline">Change Plan</Button>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Your next billing date is July 15, 2023</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Payment Method</h3>
                <div className="p-4 border border-border rounded-lg bg-background flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Billing History</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.description}</TableCell>
                          <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
              <CardDescription>
                Customize your brand appearance and deploy your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleBrandSubmit}>
                <div className="space-y-6">
                  {/* Brand Name */}
                  <div>
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="brand-name" 
                        className="pl-10" 
                        value={brandSettings.brandName}
                        onChange={(e) => handleBrandInputChange('brandName', e.target.value)}
                        placeholder="Enter your brand name"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      This name will appear on your website and QR code landing pages
                    </p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Brand Logo */}
                  <div>
                    <Label>Brand Logo</Label>
                    <div className="mt-2 flex items-center">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center border overflow-hidden">
                        {brandSettings.logoUrl ? (
                          <img 
                            src={brandSettings.logoUrl} 
                            alt="Brand Logo" 
                            className="w-full h-full object-cover"
                          />
                        ) : brandSettings.brandName ? (
                          <div className="text-xs font-bold text-center p-1 leading-tight">
                            {brandSettings.brandName.substring(0, 8)}
                          </div>
                        ) : (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="ml-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            disabled={isUploadingLogo}
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            {isUploadingLogo ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                              </>
                            )}
                          </Button>
                          {brandSettings.logoUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              type="button"
                              onClick={() => handleBrandInputChange('logoUrl', '')}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              handleLogoUpload(Array.from(files));
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 512x512px. Max 4MB.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Brand Colors */}
                  <div>
                    <Label>Brand Colors</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full border" 
                            style={{ backgroundColor: brandSettings.primaryColor }}
                          />
                          <Input 
                            id="primary-color" 
                            value={brandSettings.primaryColor}
                            onChange={(e) => handleBrandInputChange('primaryColor', e.target.value)}
                            className="w-36"
                            placeholder="#3B82F6"
                          />
                          <input
                            type="color"
                            value={brandSettings.primaryColor}
                            onChange={(e) => handleBrandInputChange('primaryColor', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondary-color" className="text-sm">Secondary Color</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full border" 
                            style={{ backgroundColor: brandSettings.secondaryColor }}
                          />
                          <Input 
                            id="secondary-color" 
                            value={brandSettings.secondaryColor}
                            onChange={(e) => handleBrandInputChange('secondaryColor', e.target.value)}
                            className="w-36"
                            placeholder="#10B981"
                          />
                          <input
                            type="color"
                            value={brandSettings.secondaryColor}
                            onChange={(e) => handleBrandInputChange('secondaryColor', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" disabled={saving || deploying}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Palette className="mr-2 h-4 w-4" />
                          Save Brand Settings
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={saving || deploying || !brandSettings.brandName}
                      onClick={handleDeploy}
                    >
                      {deploying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-4 w-4" />
                          Deploy Website
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Deployment Status */}
          {brandSettings.isDeployed && brandSettings.websiteUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Website Deployment</CardTitle>
                <CardDescription>
                  Your website is live and accessible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Website URL:</p>
                    <p className="text-sm text-muted-foreground">{brandSettings.websiteUrl}</p>
                    {brandSettings.lastDeployedAt && (
                      <p className="text-xs text-muted-foreground">
                        Last deployed: {brandSettings.lastDeployedAt.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Extract the partner path from the full URL
                      const url = brandSettings.websiteUrl;
                      if (url.includes('/partners/')) {
                        const partnerPath = url.substring(url.indexOf('/partners/'));
                        window.open(`http://localhost:3001${partnerPath}`, '_blank');
                      } else {
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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