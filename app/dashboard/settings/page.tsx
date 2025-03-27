'use client';

import { useForm } from "react-hook-form";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  CreditCard,
  FileText,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "billing", "email", "notifications", "security"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const profileForm = useForm({
    defaultValues: {
      clinicName: "VidalSigns Medical Center",
      contactName: "Dr. Alex Johnson",
      email: "contact@vidalsigns.com",
      phone: "(555) 123-4567",
      address: "123 Health Avenue, Suite 101, Medical City, CA 94105",
      website: "https://vidalsigns.com"
    }
  });
  
  const emailForm = useForm({
    defaultValues: {
      emailSubject: "Your Lab Results from [Clinic Name]",
      emailTemplate: `Dear [Patient Name],

Your recent lab results are ready for your review. Your doctor has provided this service to help you better understand your results.

Please click the secure link below to view your results:
[SECURE_LINK]

This link will expire in 72 hours for your security.

Best regards,
[Clinic Name] Team`,
      emailFooter: "© 2023 VidalSigns Medical Center. All rights reserved."
    }
  });
  
  const notificationForm = useForm({
    defaultValues: {
      emailNotifications: true,
      reportOpened: true,
      reportExpired: true,
      weeklyDigest: false,
      dailyDigest: false
    }
  });
  
  const securityForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const passwordChangeForm = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onPasswordChangeSubmit = (data: { newPassword: string, confirmPassword: string }) => {
    // Here you would implement the password change logic
    console.log("Password change data:", data);
    setPasswordDialogOpen(false);
    // Reset the form
    passwordChangeForm.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold py-4 sm:py-3">Settings</h1>
      </div>
      
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="profile" className="space-y-6">
          <div className="overflow-x-auto overflow-y-visible w-full pb-2 sm:pb-3 no-scrollbar pl-2">
            <TabsList className="bg-background/50 backdrop-blur-sm border border-border h-12 flex flex-nowrap w-max min-w-full sm:min-w-fit mx-auto gap-1">
              <TabsTrigger 
                className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none" 
                value="profile"
              >
                Clinic Profile
              </TabsTrigger>
              <TabsTrigger 
                className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] md:max-w-none" 
                value="billing"
              >
                Billing
              </TabsTrigger>
              <TabsTrigger 
                className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none" 
                value="email"
              >
                Email Templates
              </TabsTrigger>
              <TabsTrigger 
                className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none" 
                value="notifications"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] md:max-w-none" 
                value="security"
              >
                Security
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Clinic Profile Tab */}
          <TabsContent value="profile">
            <GlassCard className="p-6">
              <Form {...profileForm}>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h2 className="text-xl font-semibold">Clinic Information</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Update your clinic profile information and contact details
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="clinicName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clinic Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="email" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                                <Textarea className="pl-10 min-h-[80px]" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </Form>
            </GlassCard>
          </TabsContent>
          
          {/* Billing Tab */}
          <TabsContent value="billing">
            <GlassCard className="p-6">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold">Billing and Subscription</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your subscription plan and payment methods
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 border border-border rounded-lg bg-background">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Current Plan: Pro</h3>
                        <p className="text-sm text-muted-foreground">$99/month, billed monthly</p>
                      </div>
                      <Button variant="outline">Change Plan</Button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Your next billing date is June 15, 2023</p>
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
                          <TableRow>
                            <TableCell>May 15, 2023</TableCell>
                            <TableCell>Pro Plan - Monthly</TableCell>
                            <TableCell>$99.00</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Apr 15, 2023</TableCell>
                            <TableCell>Pro Plan - Monthly</TableCell>
                            <TableCell>$99.00</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Mar 15, 2023</TableCell>
                            <TableCell>Pro Plan - Monthly</TableCell>
                            <TableCell>$99.00</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
          
          {/* Email Templates Tab */}
          <TabsContent value="email">
            <GlassCard className="p-6">
              <Form {...emailForm}>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h2 className="text-xl font-semibold">Email Templates</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customize the email templates sent to patients
                      </p>
                    </div>
                    
                    <FormField
                      control={emailForm.control}
                      name="emailSubject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Use [Clinic Name] and [Patient Name] as placeholders
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="emailTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Body</FormLabel>
                          <FormControl>
                            <Textarea rows={8} {...field} />
                          </FormControl>
                          <FormDescription>
                            Available placeholders: [Patient Name], [Clinic Name], [SECURE_LINK]
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="emailFooter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Footer</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" type="button">
                      Preview Email
                    </Button>
                    <Button type="submit">Save Template</Button>
                  </div>
                </form>
              </Form>
            </GlassCard>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <GlassCard className="p-6">
              <Form {...notificationForm}>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h2 className="text-xl font-semibold">Notification Preferences</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Control which notifications you receive
                      </p>
                    </div>
                    
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive all notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="reportOpened"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Report Opened Alerts</FormLabel>
                            <FormDescription>
                              Get notified when a patient opens a report
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="reportExpired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Report Expired Alerts</FormLabel>
                            <FormDescription>
                              Get notified when a report link expires
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="weeklyDigest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekly Summary</FormLabel>
                            <FormDescription>
                              Receive a weekly summary of all reports
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="dailyDigest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Daily Summary</FormLabel>
                            <FormDescription>
                              Receive a daily summary of all reports
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Preferences</Button>
                  </div>
                </form>
              </Form>
            </GlassCard>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <GlassCard className="p-6">
              <Form {...securityForm}>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h2 className="text-xl font-semibold">Security Settings</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Update your password and security preferences
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Use at least 8 characters with a mix of letters, numbers & symbols
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an extra layer of security to your account by enabling two-factor authentication
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setPasswordDialogOpen(true)}
                    >
                      Change Password
                    </Button>
                    <Button type="submit">Update Password</Button>
                  </div>
                </form>
              </Form>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below. Password must be at least 8 characters.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordChangeForm}>
            <form onSubmit={passwordChangeForm.handleSubmit(onPasswordChangeSubmit)} className="space-y-4">
              <FormField
                control={passwordChangeForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showNewPassword ? "text" : "password"} 
                          className="pr-10" 
                          {...field} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-0 top-0 h-full px-3"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormDescription>
                      Use at least 8 characters with a mix of letters, numbers & symbols
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={passwordChangeForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          className="pr-10" 
                          {...field} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-0 h-full px-3"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Password</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 