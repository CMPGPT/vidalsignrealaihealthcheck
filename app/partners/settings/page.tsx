'use client';

import React, { useState } from "react";
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
import { CreditCard, FileText, Building, Globe } from "lucide-react";

// Import centralized data
import { partnerBusinessInfo, partnerBillingHistory } from "@/data/mock/partnerUsers";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  
  // Default partner ID - in a real app this would come from auth context
  const partnerId = "P-001";
  
  // Get partner business info from centralized store
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Company Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="contact@example.com" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue={businessInfo.phone || "+1 (555) 123-4567"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue={businessInfo.website || "https://example.com"} />
                </div>
              </div>
              
              <Button>Save Changes</Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" defaultValue={businessInfo.businessName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-type">Business Type</Label>
                  <Input id="business-type" defaultValue={businessInfo.businessType} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue={businessInfo.address} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" defaultValue={businessInfo.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" defaultValue={businessInfo.state} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Postal Code</Label>
                  <Input id="zip" defaultValue={businessInfo.zip} />
                </div>
              </div>
              
              <Button>Save Changes</Button>
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
                Customize your brand appearance for QR codes and customer interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="brand-name" className="pl-10" defaultValue="Your Brand Name" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This name will appear on QR code landing pages
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="brand-website">Brand Website</Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="brand-website" className="pl-10" defaultValue="https://yourbrand.com" />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <Label>Brand Logo</Label>
                  <div className="mt-2 flex items-center">
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center border">
                      <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="ml-4 space-y-2">
                      <Button variant="outline" size="sm">Upload New Logo</Button>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 512x512px. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <Label>Brand Colors</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary" />
                        <Input id="primary-color" defaultValue="#0066FF" className="w-36" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color" className="text-sm">Secondary Color</Label>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-secondary" />
                        <Input id="secondary-color" defaultValue="#6C757D" className="w-36" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="mt-4">Save Brand Settings</Button>
            </CardContent>
          </Card>
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