// components/upload/UploadButton.tsx
"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface UploadButtonProps {
    chatId: string;
    onUploadComplete: (data: {
        fileUrl: string;
        fileType: string;
        fileName: string;
    }) => void;
    onUploadError: (error: Error) => void;
    onUploadStart: () => void;
}

export function UploadButton({
    chatId,
    onUploadComplete,
    onUploadError,
    onUploadStart,
}: UploadButtonProps) {
    const [isUploading, setIsUploading] = useState(false);

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
                    fileUrl: res[0].url,
                    fileType: res[0].type || "",
                    fileName: res[0].name,
                });
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            console.log("No file selected");
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

    return (
        <Button className="relative overflow-hidden" size="lg" disabled={isUploading || isUploadingInternal}>
            <input
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={isUploading || isUploadingInternal}
            />
            <UploadCloud className="h-4 w-4 mr-2" />
            {isUploading || isUploadingInternal ? "Uploading..." : "Upload Document"}
        </Button>
    );
}