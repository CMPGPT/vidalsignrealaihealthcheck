// components/upload/DirectUploadButton.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface DirectUploadButtonProps {
  chatId: string;
  onUploadComplete: (data: {
    fileUrl: string;
    fileType: string;
    fileName: string;
  }) => void;
  onUploadError: (error: Error) => void;
  onUploadStart: () => void;
}

export function DirectUploadButton({
  chatId,
  onUploadComplete,
  onUploadError,
  onUploadStart,
}: DirectUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Add validation here
    const isValidFileType =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png";

    if (!isValidFileType) {
      toast.error("Invalid file type", {
        description: "Please upload a PDF or image (JPEG/PNG).",
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum size is 8MB.",
      });
      return;
    }

    setIsUploading(true);
    onUploadStart();

    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);

      // Use your original direct upload endpoint
      const response = await fetch('/api/reportsummary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze the document');
      }

      const reportData = await response.json();

      // Simulate the same response structure as the UploadThing flow
      onUploadComplete({
        fileUrl: 'local://file', // This is a placeholder
        fileType: file.type,
        fileName: file.name
      });

      toast.success("Upload successful", {
        description: "Your file has been uploaded and processed.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error : new Error(String(error)));
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button className="relative overflow-hidden" size="lg" disabled={isUploading}>
      <input
        type="file"
        className="absolute inset-0 cursor-pointer opacity-0"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <UploadCloud className="h-4 w-4 mr-2" />
      {isUploading ? "Processing..." : "Upload Document (Direct)"}
    </Button>
  );
}