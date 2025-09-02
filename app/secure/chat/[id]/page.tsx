'use client';

import { useState, useEffect } from "react";
import Header from "@/components/chat/Header";
import ReportSummary from "@/components/chat/ReportSummary";
import ChatInterface from "@/components/chat/ChatInterface";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { UploadCloud, Menu, X, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import React from 'react';
import { Poppins } from "next/font/google";
import { UploadButton } from "@/components/upload/UploadButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CountdownTimer from "@/components/chat/CountdownTimer";
import SecureExpirationOverlay from "@/components/chat/SecureExpirationOverlay";

interface ReportData {
  id: string;
  title: string;
  date: string;
  summary: string;
  expiryTime: Date;
  suggestedQuestions?: string[];
  recommendationQuestions?: string[];
}

interface BrandSettings {
  brandName: string;
  logoUrl?: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function SecureChatPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params?.id as string;

  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [databaseExpiryTime, setDatabaseExpiryTime] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isSearchingReport, setIsSearchingReport] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAskQuestion = (question: string) => {
    console.log("Question asked:", question);
    // Implement your chat functionality here
    
    // Close sidebar on mobile when user asks a question
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!chatId) {
      toast.error("Error", {
        description: "Unable to delete report - chat ID not found.",
      });
      return;
    }

    try {
      // Delete from database
      const response = await fetch('/api/delete-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete report from database');
      }

      // Clear local states
      setReport(null);
      setSuggestedQuestions([]);
      setError(null);
      
      toast.success("Report deleted", {
        description: "Your report has been permanently deleted from the database.",
      });
    } catch (error) {
      console.error('Delete report error:', error);
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : 'Failed to delete report',
      });
    }
  };

  const handleExpire = () => {
    setIsExpired(true);
    // Don't show toast here since the overlay will handle the messaging
  };

  // Listen for toggleSidebar events from the ChatInterface
  useEffect(() => {
    const handleToggleSidebar = () => {
      toggleSidebar();
    };
    
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, []);

  // Validate the secure link on component mount
  useEffect(() => {
    const validateLink = async () => {
      if (!linkId) {
        setValidationError("Invalid link");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch('/api/validate-secure-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ linkId }),
        });

        const data = await response.json();

        if (!response.ok) {
          // For starter users, if link is expired, show the overlay instead of error
          if (data.error === 'Link has expired') {
            setIsExpired(true);
            setIsValidating(false);
            return;
          }
          setValidationError(data.error || 'Link validation failed');
          setIsValidating(false);
          return;
        }

        // Link is valid, set the chat ID and expiry time
        setChatId(data.chatId);
        console.log('🔍 SECURE CHAT: Validation response:', data);
        
        // Set partner ID
        setPartnerId(data.partnerId);
        console.log('🔍 SECURE CHAT: Partner ID:', data.partnerId);
        
        // Set brand settings if available
        if (data.brandSettings) {
          setBrandSettings(data.brandSettings);
          console.log('🔍 SECURE CHAT: Brand settings loaded:', data.brandSettings);
        }
        
        // Set the expiry time from database for the timer
        if (data.expiresAt) {
          const dbExpiryTime = new Date(data.expiresAt);
          setDatabaseExpiryTime(dbExpiryTime);
          setExpiryTime(dbExpiryTime);
          console.log('🔍 SECURE CHAT: Set database expiry time:', dbExpiryTime);
          console.log('🔍 SECURE CHAT: Current time:', new Date());
          console.log('🔍 SECURE CHAT: Time difference (ms):', dbExpiryTime.getTime() - new Date().getTime());
          
          // Check if the link has expired and show overlay for starter users
          if (new Date() > dbExpiryTime) {
            console.log('🔍 SECURE CHAT: Link has expired, showing overlay');
            setIsExpired(true);
            setIsValidating(false);
            return;
          }
        } else {
          console.warn('🔍 SECURE CHAT: No expiry time in validation response');
        }
        
        setIsValidating(false);

        // Load existing report if any
        await loadExistingReport(data.chatId);

      } catch (err) {
        console.error("Failed to validate link:", err);
        setValidationError("Failed to validate link");
        setIsValidating(false);
      }
    };

    validateLink();
  }, [linkId]);

  const loadExistingReport = async (currentChatId: string) => {
    setIsSearchingReport(true);
    try {
      console.log('🔍 SECURE CHAT: Searching for existing report with chatId:', currentChatId);
      const res = await fetch('/api/findReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: currentChatId }),
      });

      const data = await res.json();
      console.log('🔍 SECURE CHAT: Find report response:', data);

      if (data.found) {
        console.log('🔍 SECURE CHAT: Found existing report:', data.report);
        setReport({
          ...data.report,
          expiryTime: new Date(data.report.expiryTime),
        });
        
        if (data.report.suggestedQuestions) {
          setSuggestedQuestions(data.report.suggestedQuestions);
        }
      } else {
        console.log('🔍 SECURE CHAT: No existing report found');
      }
    } catch (err) {
      console.error("Failed to load existing report:", err);
    } finally {
      setIsSearchingReport(false);
    }
  };

  const handleUploadComplete = async (data: { fileUrl: string; fileType: string; fileName: string }) => {
    if (!chatId) return;

    setError(null);
    setIsProcessing(true);

    try {
      // Route to different APIs based on file type
      const isPDF = data.fileType === 'application/pdf';
      const apiEndpoint = isPDF ? '/api/ocr-v3' : '/api/reportsummary';

      // Send the file data to the appropriate API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
          chatId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze the document');
      }

      const reportData = await response.json();
      console.log('🔍 SECURE CHAT: Report data received:', reportData);

      // Only increment upload count after successful validation and analysis
      await fetch('/api/increment-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });

      // Set report with database expiry time if available, otherwise use report time
      const finalExpiryTime = databaseExpiryTime || new Date(reportData.expiryTime);
      console.log('🔍 SECURE CHAT: Using expiry time:', finalExpiryTime);
      
      setReport({
        ...reportData,
        expiryTime: finalExpiryTime,
      });
      console.log('🔍 SECURE CHAT: Report state set successfully');

      if (reportData.suggestedQuestions) {
        setSuggestedQuestions(reportData.suggestedQuestions);
      }

      toast.success("Analysis complete", {
        description: "Your medical report has been analyzed successfully.",
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during file processing');
      toast.error("Analysis failed", {
        description: err.message || 'Failed to analyze the document',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center bg-white ${poppins.className}`}>
        <div className="text-center space-y-4">
          <div 
            className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto"
            style={{
              borderColor: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                ? `${brandSettings.customColors.primary} ${brandSettings.customColors.primary} ${brandSettings.customColors.primary} transparent`
                : 'var(--primary) var(--primary) var(--primary) transparent'
            }}
          ></div>
          <p className="text-black">Validating secure link...</p>
        </div>
      </div>
    );
  }

  // Show error state if validation failed
  if (validationError) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center bg-slate-100 backdrop-blur-xs ${poppins.className}`}>
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Link Error</h2>
              <Alert>
                <AlertDescription>
                  {validationError === "Link has expired" && "This secure link has expired and is no longer valid."}
                  {validationError === "Link not found" && "The requested secure link was not found."}
                  {validationError !== "Link has expired" && validationError !== "Link not found" && validationError}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Please contact your healthcare provider for a new secure link.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col bg-slate-100 backdrop-blur-xs ${poppins.className} overflow-hidden`}>
      {/* Top logo section - 7% */}
      <div className="h-[7%] min-h-[50px] w-full bg-background flex items-center justify-center border-b relative">
        <Header brandSettings={brandSettings} partnerId={partnerId} />
        
        {/* Countdown Timer */}
        {expiryTime && (
          <div className="absolute right-4 top-1/2 text-black transform -translate-y-1/2">
            <CountdownTimer 
              expiryTime={expiryTime} 
              onExpire={handleExpire}
            />
          </div>
        )}
        
        {/* Menu button for sidebar */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden absolute left-4 top-1/2 transform -translate-y-1/2" 
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

              {/* Main content area - 93% */}
        <main className="h-[93%] relative container max-w-7xl mx-auto px-0 lg:px-4 py-0 lg:py-6 flex flex-col">
          {/* Show expiration overlay if session has expired */}
          {isExpired && (
            <SecureExpirationOverlay />
          )}
        {/* Don't show main content if session is expired */}
        {!isExpired && (
          <>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={toggleSidebar}
              />
            )}

        {/* Sidebar for upload/report on mobile */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 w-full md:w-80 z-50 transition-transform duration-300 lg:hidden",
            "transform bg-background shadow-xl",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "flex flex-col"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <h2 className="font-semibold">Medical Report</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {isProcessing ? (
              <Card className="w-full overflow-hidden bg-white transition-all duration-300 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div 
                    className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto"
                    style={{
                      borderColor: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                        ? `${brandSettings.customColors.primary} ${brandSettings.customColors.primary} ${brandSettings.customColors.primary} transparent`
                        : 'var(--primary) var(--primary) var(--primary) transparent'
                    }}
                  ></div>
                  <p className="text-black">Analyzing your document with AI...</p>
                  <p className="text-xs text-black">This may take up to 40 seconds</p>
                </div>
              </Card>
            ) : isSearchingReport ? (
              <Card className="w-full overflow-hidden bg-white transition-all duration-300 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div 
                    className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto"
                    style={{
                      borderColor: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                        ? `${brandSettings.customColors.primary} ${brandSettings.customColors.primary} ${brandSettings.customColors.primary} transparent`
                        : 'var(--primary) var(--primary) var(--primary) transparent'
                    }}
                  ></div>
                  <p className="text-black">Searching for existing reports...</p>
                  <p className="text-xs text-black">Checking database for previous uploads</p>
                </div>
              </Card>
            ) : report ? (
              <ReportSummary
                report={report}
                onDelete={handleDeleteReport}
                onExpire={handleExpire}
                databaseExpiryTime={databaseExpiryTime || undefined}
                brandSettings={brandSettings}
                partnerId={partnerId}
              />
            ) : (
              <Card className="w-full overflow-hidden backdrop-blur-sm bg-white transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div 
                      className="p-4 rounded-full"
                      style={{
                        backgroundColor: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                          ? `${brandSettings.customColors.primary}20` 
                          : 'var(--primary-10)'
                      }}
                    >
                      <UploadCloud 
                        className="h-10 w-10" 
                        style={{
                          color: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                            ? brandSettings.customColors.primary 
                            : 'var(--primary)'
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-medium">Upload your medical report</h3>
                    <p className="text-center text-black max-w-md">
                      Upload your medical document and our AI will analyze it and provide you with a summary and insights.
                    </p>
                    <div className="pt-4">
                      <UploadButton
                        chatId={chatId || "default-chat-id"}
                        onUploadComplete={(data) => {
                          handleUploadComplete(data);
                          // Don't auto-close sidebar during processing
                        }}
                        onUploadError={(err) => {
                          console.error("Upload error:", err);
                          setError(err.message);
                        }}
                        onUploadStart={() => {
                          console.log("Upload starting with chatId:", chatId);
                          setError(null);
                        }}
                        brandSettings={brandSettings}
                        partnerId={partnerId}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive mt-2">{error}</p>
                    )}
                    <p className="text-xs text-black">
                      Supported formats: PDF, JPEG, PNG (Max: 8MB)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6 h-full flex-1">
          {/* Left column - Report summary or upload (visible on desktop) */}
          <div className="hidden lg:block space-y-6 lg:max-h-[calc(100vh-12rem)] overflow-y-auto animate-fade-in animate-in-delay-1">
            {isProcessing ? (
              <Card className="w-full overflow-hidden bg-white transition-all duration-300 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div 
                    className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto"
                    style={{
                      borderColor: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                        ? `${brandSettings.customColors.primary} ${brandSettings.customColors.primary} ${brandSettings.customColors.primary} transparent`
                        : 'var(--primary) var(--primary) var(--primary) transparent'
                    }}
                  ></div>
                  <p className="text-muted-foreground">Analyzing your document with AI...</p>
                  <p className="text-xs text-muted-foreground">This may take up to 40 seconds</p>
                </div>
              </Card>
            ) : isSearchingReport ? (
              <Card className="w-full overflow-hidden bg-white transition-all duration-300 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div 
                    className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto"
                    style={{
                      borderColor: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                        ? `${brandSettings.customColors.primary} ${brandSettings.customColors.primary} ${brandSettings.customColors.primary} transparent`
                        : 'var(--primary) var(--primary) var(--primary) transparent'
                    }}
                  ></div>
                  <p className="text-muted-foreground">Searching for existing reports...</p>
                  <p className="text-xs text-muted-foreground">Checking database for previous uploads</p>
                </div>
              </Card>
            ) : report ? (
              <ReportSummary
                report={report}
                onDelete={handleDeleteReport}
                onExpire={handleExpire}
                databaseExpiryTime={databaseExpiryTime || undefined}
                brandSettings={brandSettings}
                partnerId={partnerId}
              />
            ) : (
              <Card className="w-full overflow-hidden backdrop-blur-sm bg-white transition-all text-black duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div 
                      className="p-4 rounded-full"
                      style={{
                        backgroundColor: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                          ? `${brandSettings.customColors.primary}20` 
                          : 'var(--primary-10)'
                      }}
                    >
                      <UploadCloud 
                        className="h-12 w-12" 
                        style={{
                          color: partnerId && partnerId !== 'starter-user' && brandSettings?.customColors?.primary 
                            ? brandSettings.customColors.primary 
                            : 'var(--primary)'
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-medium">Upload your medical report</h3>
                    <p className="text-center max-w-md text-slate-500">
                      Upload your medical document and our AI will analyze it and provide you with a summary and insights.
                    </p>
                    <div className="pt-4">
                      <UploadButton
                        chatId={chatId || "default-chat-id"}
                        onUploadComplete={handleUploadComplete}
                        onUploadError={(err) => {
                          console.error("Upload error:", err);
                          setError(err.message);
                        }}
                        onUploadStart={() => {
                          console.log("Upload starting with chatId:", chatId);
                          setError(null);
                        }}
                        brandSettings={brandSettings}
                        partnerId={partnerId}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive mt-2">{error}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      Supported formats: PDF, JPEG, PNG (Max: 8MB)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upload button when no report exists (for non-mobile only) */}
          {!sidebarOpen && !report && !isProcessing && !isSearchingReport && (
            <Button 
              onClick={toggleSidebar}
              className="lg:hidden fixed right-4 top-20 z-50 rounded-full h-12 w-12 p-0 shadow-lg"
              size="icon"
              aria-label="Upload Report"
            >
              <UploadCloud className="h-6 w-6 text-black" />
            </Button>
          )}

          {/* Right column - Chat interface (Full width on mobile) */}
          <div className="flex-1 h-full lg:h-[calc(100vh-12rem)] lg:col-span-1 col-span-2 animate-fade-in animate-in-delay-2">
            <ChatInterface
              suggestedQuestions={suggestedQuestions}
              onAskQuestion={handleAskQuestion}
              report={report}
              brandSettings={brandSettings}
              partnerId={partnerId}
            />
          </div>
        </div>
          </>
        )}
      </main>

      <Toaster />
    </div>
  );
} 