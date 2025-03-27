'use client';

import GlassCard from "@/components/ui/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  BarChart3,
  Users,
  TrendingUp,
  File,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportsList from "@/components/dashboard/ReportsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useState } from "react";

export default function DashboardPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      setFiles(fileArray);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setFiles([]);
        setUploadProgress(0);
        setIsUploadDialogOpen(false);
        // Here you would typically handle the successful upload
      }
    }, 200);
  };

  const handleCancel = () => {
    setFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
    setIsUploadDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold py-4 sm:py-3">Dashboard</h1>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Report</DialogTitle>
            <DialogDescription>
              Upload PDF or image files of lab reports to share with patients.
            </DialogDescription>
          </DialogHeader>
          
          <div 
            className={`mt-4 border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here or click to browse
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label htmlFor="file-upload">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mx-auto"
                  disabled={isUploading}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Select Files
                </Button>
              </label>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Selected Files ({files.length})</p>
              <div className="max-h-[150px] overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2 flex-shrink-0" />
                      <p className="text-sm truncate max-w-[180px]">{file.name}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="mt-4">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isUploading}
            >
              {isUploading ? "Cancel" : "Discard"}
            </Button>
            <Button 
              type="button" 
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Reports Sent</span>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">124</span>
                <span className="text-sm text-emerald-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 12% from last month
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Patients Reached</span>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">98</span>
                <span className="text-sm text-emerald-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 8% from last month
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">View Rate</span>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">79%</span>
                <span className="text-sm text-emerald-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 4% from last month
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="reports" className="space-y-4">
        <div className="overflow-x-auto overflow-y-visible w-full pb-2 sm:pb-3 no-scrollbar pl-2">
          <TabsList className="bg-background/50 backdrop-blur-sm border border-border h-12 flex flex-nowrap w-max min-w-full sm:min-w-fit mx-auto gap-1">
            <TabsTrigger 
              className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none" 
              value="reports"
            >
              Recent Reports
            </TabsTrigger>
            <TabsTrigger 
              className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none" 
              value="upload"
            >
              Upload Reports
            </TabsTrigger>
            <TabsTrigger 
              className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none" 
              value="templates"
            >
              Email Templates
            </TabsTrigger>
            <TabsTrigger 
              className="px-3 md:px-4 py-2 flex-shrink-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none" 
              value="analytics"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="reports" className="space-y-4">
          <ReportsList />
        </TabsContent>
        
        <TabsContent value="upload">
          <GlassCard className="p-4 sm:p-8">
            <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Upload Lab Reports</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Drag and drop PDFs or images of lab results, or click to browse files from your computer
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>Select Files</Button>
            </div>
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="templates">
          <GlassCard className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-4">Email Templates</h3>
            <p className="text-muted-foreground mb-6">
              Customize how emails appear to your patients when sending lab results. The template will be used for all outgoing emails.
            </p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Email Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  defaultValue="Your Lab Results from [Clinic Name]"
                />
              </div>
              
              <div>
                <label htmlFor="template" className="block text-sm font-medium mb-2">
                  Email Template
                </label>
                <textarea
                  id="template"
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  defaultValue="Dear [Patient Name],

Your recent lab results are ready for your review. Your doctor has provided this service to help you better understand your results.

Please click the secure link below to view your results:
[SECURE_LINK]

This link will expire in 72 hours for your security.

Best regards,
[Clinic Name] Team"
                ></textarea>
              </div>
              
              <Button>Save Template</Button>
            </div>
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Patient Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 