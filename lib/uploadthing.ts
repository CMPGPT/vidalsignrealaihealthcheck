// lib/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();

// Error handling utility
const handleError = (err: Error) => {
  console.error("UploadThing error:", err);
  throw new Error(`File upload failed: ${err.message}`);
};
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route key
  medicalReportUploader: f({ pdf: { maxFileSize: "8MB" }, image: { maxFileSize: "8MB" } })
    // @ts-ignore
    .middleware(async ({ metadata }) => {
      try {
        // This code runs on your server before upload
        console.log("Upload middleware running with metadata:", metadata);
        
        // Handle different possible metadata formats
        let chatId: string;
        
        if (metadata && typeof metadata === 'object') {
          if ('chatId' in metadata && metadata.chatId) {
            chatId = String(metadata.chatId);
          } else {
            // If no chatId in metadata, use a default value for development
            console.warn("No chatId found in metadata, using default");
            chatId = "default-chat-id";
          }
        } else {
          console.warn("Metadata is not an object, using default chatId");
          chatId = "default-chat-id";
        }
        
        console.log("Using chatId:", chatId);
    
        // Whatever is returned here is accessible in onUploadComplete as `metadata`
        return { chatId };
      } catch (err) {
        console.error("UploadThing middleware error:", err);
        // Instead of throwing, return a default
        return { chatId: "error-fallback-chat-id" };
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // This code RUNS ON YOUR SERVER after upload
        console.log("Upload complete for chatId:", metadata.chatId);
        console.log("File details:", {
          url: file.url,
          name: file.name,
          size: file.size,
          key: file.key,
          type: file.type
        });
        
        return { uploadedBy: metadata.chatId };
      } catch (err) {
        handleError(err as Error);
      }
    }),
    
  // Brand logo uploader
  brandLogoUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // @ts-ignore
    .middleware(async ({ metadata }) => {
      try {
        console.log("Brand logo upload middleware running with metadata:", metadata);
        
        // Handle different possible metadata formats
        let userId: string;
        
        if (metadata && typeof metadata === 'object') {
          if ('userId' in metadata && metadata.userId) {
            userId = String(metadata.userId);
          } else {
            console.warn("No userId found in metadata for brand logo upload");
            userId = "default-user-id";
          }
        } else {
          console.warn("Metadata is not an object for brand logo upload");
          userId = "default-user-id";
        }
        
        console.log("Brand logo upload for userId:", userId);
    
        return { userId };
      } catch (err) {
        console.error("Brand logo upload middleware error:", err);
        return { userId: "error-fallback-user-id" };
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Brand logo upload complete for userId:", metadata.userId);
        console.log("Brand logo file details:", {
          url: file.url,
          name: file.name,
          size: file.size,
          key: file.key,
          type: file.type
        });
        
        return { uploadedBy: metadata.userId, logoUrl: file.url, logoKey: file.key };
      } catch (err) {
        handleError(err as Error);
      }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;