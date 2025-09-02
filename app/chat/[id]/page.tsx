'use client';

import { useState, useEffect } from "react";
import Header from "@/components/chat/Header";
import ReportSummary from "@/components/chat/ReportSummary";
import ChatInterface from "@/components/chat/ChatInterface";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { UploadCloud, Menu, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import React from 'react';
import { Poppins } from "next/font/google";
import { UploadButton } from "@/components/upload/UploadButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CountdownTimer from "@/components/chat/CountdownTimer";
import ExpirationOverlay from "@/components/chat/ExpirationOverlay";

interface ReportData {
  id: string;
  title: string;
  date: string;
  summary: string;
  expiryTime: Date;
  suggestedQuestions?: string[];
  recommendationQuestions?: string[];
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function Page() {
  const params = useParams();
  const chatId = params?.id as string;

  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [databaseExpiryTime, setDatabaseExpiryTime] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
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
    toast.error("Session expired", {
      description: "Your session has expired. Please wait 14 days or purchase a QR code for immediate access.",
    });
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

  // Load public link on first load
  useEffect(() => {
    const getPublicLink = async () => {
      if (!chatId) return;

      try {
        const res = await fetch('/api/public-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId }),
        });

        const data = await res.json();

        if (data.success) {
          // Set the expiry time from database for the timer
          const dbExpiryTime = new Date(data.data.validTo);
          setDatabaseExpiryTime(dbExpiryTime);
          setExpiryTime(dbExpiryTime);
          
          // Load existing report if any
          await loadExistingReport(chatId);
        } else {
          // If link is expired, show the overlay
          if (data.error === 'Link has expired or is closed') {
            setIsExpired(true);
          } else {
            setError(data.error || 'Failed to load session');
          }
        }
      } catch (error) {
        console.error('Error loading public link:', error);
        setError('Failed to load session');
      }
    };

    getPublicLink();
  }, [chatId]);

  const loadExistingReport = async (currentChatId: string) => {
    setIsSearchingReport(true);
    try {
      console.log('🔍 CHAT: Searching for existing report with chatId:', currentChatId);
      const res = await fetch('/api/findReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: currentChatId }),
      });

      const data = await res.json();
      console.log('🔍 CHAT: Find report response:', data);

      if (data.found) {
        console.log('🔍 CHAT: Found existing report:', data.report);
        setReport({
          ...data.report,
          expiryTime: new Date(data.report.expiryTime),
        });
        
        if (data.report.suggestedQuestions) {
          setSuggestedQuestions(data.report.suggestedQuestions);
        }
      } else {
        console.log('🔍 CHAT: No existing report found');
      }
    } catch (err) {
      console.error("Failed to load existing report:", err);
    } finally {
      setIsSearchingReport(false);
    }
  };

  const handleUploadComplete = async (data: { fileUrl: string; fileType: string; fileName: string }) => {
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

      // Only increment upload count after successful validation and analysis
      await fetch('/api/increment-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });

      // Only set report if we have database expiry time
      if (databaseExpiryTime) {
        setReport({
          ...reportData,
          // Always use database expiry time - no fallback to report time
          expiryTime: databaseExpiryTime,
        });
      } else {
        console.warn('Database expiry time not available, skipping report creation');
      }

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

  return (
    <div className={`h-screen w-screen flex flex-col ${poppins.className} overflow-hidden`} style={{ backgroundColor: '#F9FAFB' }}>
      {/* Top logo section - 7% */}
      <div className="h-[7%] min-h-[50px] w-full flex items-center justify-center border-b relative" style={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}>
        <div className="text-2xl font-bold" style={{ color: '#2563eb' }}>Vidal Chat</div>
        
        {/* Countdown Timer */}
        {expiryTime && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
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
      <main className="h-[93%] relative container max-w-7xl mx-auto px-0 lg:px-4 py-0 lg:py-6 flex flex-col" style={{ backgroundColor: '#F9FAFB' }}>
        {/* Show expiration overlay if session has expired */}
        {isExpired && (
          <ExpirationOverlay />
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
            "transform shadow-xl",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "flex flex-col"
          )}
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
            <h2 className="font-semibold" style={{ color: '#111827' }}>Medical Report</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {isProcessing ? (
              <Card className="w-full overflow-hidden transition-all duration-300 flex items-center justify-center p-8" style={{ backgroundColor: '#ffffff' }}>
                <div className="text-center space-y-4">
                  <div className="animate-spin w-12 h-12 border-4 rounded-full mx-auto" style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}></div>
                  <p style={{ color: '#6B7280' }}>Analyzing your document with AI...</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>This may take up to 40 seconds</p>
                </div>
              </Card>
            ) : isSearchingReport ? (
              <Card className="w-full overflow-hidden transition-all duration-300 flex items-center justify-center p-8" style={{ backgroundColor: '#ffffff' }}>
                <div className="text-center space-y-4">
                  <div className="animate-spin w-12 h-12 border-4 rounded-full mx-auto" style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}></div>
                  <p style={{ color: '#6B7280' }}>Searching for existing reports...</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Checking database for previous uploads</p>
                </div>
              </Card>
            ) : report ? (
              <ReportSummary
                report={report}
                onDelete={handleDeleteReport}
                onExpire={handleExpire}
                databaseExpiryTime={databaseExpiryTime || undefined}
              />
            ) : (
              <Card className="w-full overflow-hidden transition-all duration-300" style={{ backgroundColor: '#ffffff' }}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 rounded-full" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                      <UploadCloud className="h-10 w-10" style={{ color: '#2563eb' }} />
                    </div>
                    <h3 className="text-xl font-medium" style={{ color: '#111827' }}>Upload your medical report</h3>
                    <p className="text-center max-w-md" style={{ color: '#6B7280' }}>
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
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive mt-2">{error}</p>
                    )}
                    <p className="text-xs text-black!important">
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
              <Card className="w-full overflow-hidden transition-all duration-300 flex items-center justify-center p-8" style={{ backgroundColor: '#ffffff' }}>
                <div className="text-center space-y-4">
                  <div className="animate-spin w-12 h-12 border-4 rounded-full mx-auto" style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}></div>
                  <p style={{ color: '#6B7280' }}>Analyzing your document with AI...</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>This may take up to 40 seconds</p>
                </div>
              </Card>
            ) : isSearchingReport ? (
              <Card className="w-full overflow-hidden transition-all duration-300 flex items-center justify-center p-8" style={{ backgroundColor: '#ffffff' }}>
                <div className="text-center space-y-4">
                  <div className="animate-spin w-12 h-12 border-4 rounded-full mx-auto" style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}></div>
                  <p style={{ color: '#6B7280' }}>Searching for existing reports...</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Checking database for previous uploads</p>
                </div>
              </Card>
            ) : report ? (
              <ReportSummary
                report={report}
                onDelete={handleDeleteReport}
                onExpire={handleExpire}
                databaseExpiryTime={databaseExpiryTime || undefined}
              />
            ) : (
              <Card className="w-full overflow-hidden transition-all duration-300" style={{ backgroundColor: '#ffffff' }}>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 rounded-full" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                      <UploadCloud className="h-12 w-12" style={{ color: '#2563eb' }} />
                    </div>
                    <h3 className="text-xl font-medium" style={{ color: '#111827' }}>Upload your medical report</h3>
                    <p className="text-center max-w-md" style={{ color: '#6B7280' }}>
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
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive mt-2">{error}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
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
              <UploadCloud className="h-6 w-6" />
            </Button>
          )}

          {/* Right column - Chat interface (Full width on mobile) */}
          <div className="flex-1 h-full lg:h-[calc(100vh-12rem)] lg:col-span-1 col-span-2 animate-fade-in animate-in-delay-2">
            <ChatInterface
              suggestedQuestions={suggestedQuestions}
              onAskQuestion={handleAskQuestion}
              report={report}
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