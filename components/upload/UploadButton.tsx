// components/upload/UploadButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useUploadThing } from "@/lib/uploadthing-hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface BrandSettings {
  brandName: string;
  logoUrl?: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface UploadButtonProps {
    chatId: string;
    onUploadComplete: (data: {
        fileUrl: string;
        fileType: string;
        fileName: string;
    }) => void;
    onUploadError: (error: Error) => void;
    onUploadStart: () => void;
    brandSettings?: BrandSettings | null;
    partnerId?: string | null;
}

export function UploadButton({
    chatId,
    onUploadComplete,
    onUploadError,
    onUploadStart,
    brandSettings,
    partnerId,
}: UploadButtonProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCount, setUploadCount] = useState(0);
    const [maxUploads, setMaxUploads] = useState(2);
    const [canUpload, setCanUpload] = useState(true);

    // Log and prepare metadata before using it
    const uploadMetadata = { chatId };
    console.log("Preparing upload with metadata:", uploadMetadata);
    // @ts-ignore
    const { startUpload, isUploading: isUploadingInternal, permissionsMeta } = useUploadThing("medicalReportUploader", {
        onClientUploadComplete: (res) => {
            console.log("Upload completed successfully", res);
            setIsUploading(false);
            if (res && res.length > 0 && res[0]) {
                onUploadComplete({
                    fileUrl: res[0].ufsUrl || res[0].url, // Use ufsUrl if available, fallback to url
                    fileType: res[0].type || "",
                    fileName: res[0].name,
                });
                // Update upload count after successful upload
                handleUploadSuccess();
            } else {
                console.error("Upload response is empty or invalid", res);
                toast.error("Upload failed", {
                    description: "Received an invalid response from the upload service",
                });
            }
        },
        onUploadError: (error) => {
            console.error("Upload error:", error);
            setIsUploading(false);
            toast.error("Upload failed", {
                description: error.message || "Failed to upload file",
            });
            onUploadError(error);
        },
        onUploadBegin: () => {
            console.log("Upload starting");
            setIsUploading(true);
            onUploadStart();
        },
        // @ts-ignore
        metadata: uploadMetadata
    });

    console.log("UploadButton rendered with chatId:", chatId);
    console.log("UploadThing permissions meta:", permissionsMeta);

    // Check upload count on component mount
    useEffect(() => {
        const checkUploadCount = async () => {
            try {
                const response = await fetch('/api/check-upload-count', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ chatId }),
                });

                const data = await response.json();
                if (data.success) {
                    setUploadCount(data.fileUploadCount);
                    setMaxUploads(data.maxUploads);
                    setCanUpload(data.canUpload);
                }
            } catch (error) {
                console.error('Error checking upload count:', error);
            }
        };

        checkUploadCount();
    }, [chatId]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            console.log("No file selected");
            return;
        }

        // Check upload limit
        if (!canUpload) {
            toast.error("Upload limit reached", {
                description: `Maximum ${maxUploads} files allowed per session.`,
            });
            return;
        }

        console.log("File selected:", file.name, file.type, file.size);

        // Add validation here
        const isValidFileType =
            file.type === "application/pdf" ||
            file.type === "image/jpeg" ||
            file.type === "image/png";

        if (!isValidFileType) {
            console.error("Invalid file type:", file.type);
            toast.error("Invalid file type", {
                description: "Please upload a PDF or image (JPEG/PNG).",
            });
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            console.error("File too large:", file.size);
            toast.error("File too large", {
                description: "Maximum size is 8MB.",
            });
            return;
        }

        try {
            console.log("Starting upload with metadata:", { chatId });
            // Start upload
            await startUpload([file]);
        } catch (error) {
            console.error("Error starting upload:", error);
            toast.error("Upload error", {
                description: "Failed to start the upload process",
            });
            onUploadError(error instanceof Error ? error : new Error(String(error)));
        }
    };

    // Update upload count after successful upload
    const handleUploadSuccess = async () => {
        try {
            const response = await fetch('/api/check-upload-count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId }),
            });

            const data = await response.json();
            if (data.success) {
                setUploadCount(data.fileUploadCount);
                setCanUpload(data.canUpload);
            }
        } catch (error) {
            console.error('Error updating upload count:', error);
        }
    };

    // Use partner's primary color only if it's not a starter user
    const shouldUsePartnerColor = partnerId && partnerId !== 'starter-user';
    const buttonColor = shouldUsePartnerColor && brandSettings?.customColors?.primary 
        ? brandSettings.customColors.primary 
        : '#2563eb';

    return (
        <div className="space-y-2">
            <Button 
                className="relative overflow-hidden text-white" 
                size="lg" 
                disabled={isUploading || isUploadingInternal || !canUpload}
                style={{
                    backgroundColor: buttonColor,
                    borderColor: buttonColor,
                }}
            >
                <input
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={isUploading || isUploadingInternal || !canUpload}
                />
                <UploadCloud className="h-4 w-4 mr-2" style={{ color: 'white' }} />
                {isUploading || isUploadingInternal ? "Uploading..." : "Upload Document"}
            </Button>
            <div className="text-xs text-center" style={{ color: '#111827' }}>
                {uploadCount}/{maxUploads} files uploaded
                {!canUpload && (
                    <div className="text-destructive mt-1">
                        Upload limit reached
                    </div>
                )}
            </div>
        </div>
    );
}