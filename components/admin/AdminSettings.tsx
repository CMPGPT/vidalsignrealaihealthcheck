'use client';

// AdminSettings component for admin dashboard  
import React, { useState } from "react";
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
  User,
  Mail,
  Lock,
  Globe,
  Key,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableHead,
  ResponsiveTableRow,
  ResponsiveTableCell
} from "@/components/ui/responsive-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import types and mock data
import { BillingRecord } from '@/data/schemas/billingSchema';
import billingData from '@/data/mock/billing';
import { colorThemes } from '@/data/mock/settings';

const AdminSettings: React.FC<AdminSettingsProps> = ({ defaultTab = "account" }) => {
  const [selectedTheme, setSelectedTheme] = useState("blue");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = () => {
    // Here you would implement password change logic
    console.log("Password change:", { newPassword, confirmPassword });
    setPasswordDialogOpen(false);
    // Reset form
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="flex">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="text"
                        value="Admin User"
                        className="pl-9 py-2 pr-4 bg-background border border-input rounded-md text-sm w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="flex">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="email"
                        value="admin@vidalsigns.com"
                        className="pl-9 py-2 pr-4 bg-background border border-input rounded-md text-sm w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="password"
                      value="••••••••••••"
                      className="pl-9 py-2 pr-4 bg-background border border-input rounded-md text-sm w-full"
                      readOnly
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPasswordDialogOpen(true)} 
                    className="whitespace-nowrap"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">OpenAI API Key</label>
                <div className="flex">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="password"
                      placeholder="Enter your OpenAI API key"
                      className="pl-9 py-2 pr-4 bg-background border border-input rounded-md text-sm w-full"
                    />
                  </div>
                </div>
              </div>
              
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Update Account</Button>
            </div>
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
    
    {/* Password Change Dialog */}
    <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your new password below. Password must be at least 8 characters.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-9 py-2 pr-10 bg-background border border-input rounded-md text-sm w-full"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9 py-2 pr-10 bg-background border border-input rounded-md text-sm w-full"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePasswordChange}>
            Change Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AdminSettings; 