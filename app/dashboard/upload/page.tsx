'use client';

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, FilePlus, X, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

type UploadFormData = {
  patientName: string;
  patientEmail: string;
  additionalNotes: string;
};

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const form = useForm<UploadFormData>({
    defaultValues: {
      patientName: "",
      patientEmail: "",
      additionalNotes: "",
    },
  });
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const onSubmit: SubmitHandler<UploadFormData> = (data) => {
    console.log("Form data:", data);
    console.log("Files:", files);
    // Here you would process the files and send the email
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold py-1 sm:py-0">Upload Reports</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Drag & Drop Files Here</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload PDFs or images of lab results. You can upload multiple files at once.
              </p>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                multiple 
                onChange={handleFileSelect}
              />
              <Button onClick={() => document.getElementById("file-upload")?.click()}>
                <FileUp className="mr-2 h-4 w-4" />
                Select Files
              </Button>
            </div>
            
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2 py-4 sm:py-3">Uploaded Files</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FilePlus className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
        
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="patientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="patient@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional information..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={files.length === 0}>
                    <Check className="mr-2 h-4 w-4" />
                    Process and Send
                  </Button>
                </div>
              </form>
            </Form>
            
            {files.length === 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Please upload at least one file before processing
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
} 