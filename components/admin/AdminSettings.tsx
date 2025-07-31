'use client';

// AdminSettings component for admin dashboard  
import React, { useState, useEffect } from "react";
import { AdminSettingsProps } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail,
  Lock,
  Globe,
  Key,
  Download,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableHead,
  ResponsiveTableRow,
  ResponsiveTableCell
} from "@/components/ui/responsive-table";
import { toast } from "sonner";

// Import types and mock data
import { BillingRecord } from '@/data/schemas/billingSchema';
import billingData from '@/data/mock/billing';
import { colorThemes } from '@/data/mock/settings';

interface AdminSettingsData {
  email: string;
  password: string;
  openaiApiKey: string;
  mistralApiKey: string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ defaultTab = "account" }) => {
  const [selectedTheme, setSelectedTheme] = useState("blue");
  const [showPassword, setShowPassword] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showMistralKey, setShowMistralKey] = useState(false);
  
  // Settings form state
  const [settingsData, setSettingsData] = useState<AdminSettingsData>({
    email: '',
    password: '',
    openaiApiKey: '',
    mistralApiKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch current settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const result = await response.json();
      
      if (result.success) {
        setSettingsData({
          email: result.data.email,
          password: result.data.password || '', // Show actual password from MongoDB
          openaiApiKey: result.data.openaiApiKey,
          mistralApiKey: result.data.mistralApiKey
        });
      } else {
        toast.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      setSaving(true);
      
      // Prepare update data
      const updateData: any = {
        email: settingsData.email,
        openaiApiKey: settingsData.openaiApiKey,
        mistralApiKey: settingsData.mistralApiKey,
      };

      // Only include password if it's been changed (not empty)
      if (settingsData.password && settingsData.password.trim() !== '') {
        updateData.newPassword = settingsData.password;
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Settings updated successfully');
        // Update with fresh data from API
        setSettingsData(prev => ({
          ...prev,
          password: result.data.password || ''
        }));
      } else {
        toast.error(result.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Manage your account settings and system preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading settings...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="flex">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="email"
                        value={settingsData.email}
                        onChange={(e) => setSettingsData({...settingsData, email: e.target.value})}
                        className="pl-9 py-2 pr-4 bg-background border border-input rounded-md text-sm w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="flex">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                             <input 
                         type={showPassword ? "text" : "password"}
                         value={settingsData.password}
                         onChange={(e) => setSettingsData({...settingsData, password: e.target.value})}
                         placeholder="Enter password (stored as plain text)"
                         className="pl-9 py-2 pr-10 bg-background border border-input rounded-md text-sm w-full"
                       />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">OpenAI API Key</label>
                  <div className="flex">
                    <div className="relative flex-1">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type={showOpenAIKey ? "text" : "password"}
                        placeholder="Enter your OpenAI API key"
                        value={settingsData.openaiApiKey}
                        onChange={(e) => setSettingsData({...settingsData, openaiApiKey: e.target.value})}
                        className="pl-9 py-2 pr-10 bg-background border border-input rounded-md text-sm w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showOpenAIKey ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mistral API Key</label>
                  <div className="flex">
                    <div className="relative flex-1">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type={showMistralKey ? "text" : "password"}
                        placeholder="Enter your Mistral API key"
                        value={settingsData.mistralApiKey}
                        onChange={(e) => setSettingsData({...settingsData, mistralApiKey: e.target.value})}
                        className="pl-9 py-2 pr-10 bg-background border border-input rounded-md text-sm w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMistralKey(!showMistralKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showMistralKey ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSettingsUpdate}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Account'
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="branding" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Name</label>
                <div className="flex">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="text"
                      defaultValue="VidalSigns"
                      className="pl-9 py-2 pr-4 bg-background border border-input rounded-md text-sm w-full"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand ID</label>
                <div className="flex">
                  <input 
                    type="text"
                    defaultValue="vidalsigns"
                    className="py-2 px-4 bg-background border border-input rounded-md text-sm w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Color Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {colorThemes.map((theme) => (
                    <button 
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-3 h-20 rounded-md flex flex-col items-center justify-center hover:border-primary transition-all ${
                        selectedTheme === theme.id ? 'ring-2 ring-primary' : 'border border-border'
                      }`}
                      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                    >
                      <span className="font-medium text-white drop-shadow">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <h3 className="font-medium">Logo Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Main Logo</label>
                    <div className="h-32 bg-muted rounded-md border border-border flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Upload your main logo</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">Upload Logo</Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Favicon</label>
                    <div className="h-32 bg-muted rounded-md border border-border flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Upload your favicon</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">Upload Favicon</Button>
                  </div>
                </div>
              </div>
              
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4">Save Branding</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
            <div className="border rounded-md">
              <div className="overflow-x-auto">
                <ResponsiveTable>
                  <ResponsiveTableHeader>
                    <ResponsiveTableRow>
                      <ResponsiveTableHead>Invoice ID</ResponsiveTableHead>
                      <ResponsiveTableHead>Partner</ResponsiveTableHead>
                      <ResponsiveTableHead>Date</ResponsiveTableHead>
                      <ResponsiveTableHead>Amount</ResponsiveTableHead>
                      <ResponsiveTableHead>Status</ResponsiveTableHead>
                      <ResponsiveTableHead className="text-right">Receipt</ResponsiveTableHead>
                    </ResponsiveTableRow>
                  </ResponsiveTableHeader>
                  <ResponsiveTableBody>
                    {billingData.billingRecords.map((bill: BillingRecord) => (
                      <ResponsiveTableRow key={bill.id}>
                        <ResponsiveTableCell className="font-medium">{bill.id}</ResponsiveTableCell>
                        <ResponsiveTableCell>{bill.partnerId}</ResponsiveTableCell>
                        <ResponsiveTableCell>{bill.createdAt}</ResponsiveTableCell>
                        <ResponsiveTableCell>{bill.amount}</ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                            bill.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                            bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {bill.status}
                          </span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell className="text-right">
                          {bill.paidAt && (
                            <Button variant="outline" size="sm" className="h-8">
                              <Download className="h-3 w-3 mr-1" />
                              Receipt
                            </Button>
                          )}
                        </ResponsiveTableCell>
                      </ResponsiveTableRow>
                    ))}
                  </ResponsiveTableBody>
                </ResponsiveTable>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button>Generate Report</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </>
  );
};

export default AdminSettings; 