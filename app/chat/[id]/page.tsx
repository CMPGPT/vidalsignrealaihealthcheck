'use client';

import { useState, useEffect } from "react";
import Header from "@/components/chat/Header";
import ReportSummary from "@/components/chat/ReportSummary";
import ChatInterface from "@/components/chat/ChatInterface";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import React from 'react';
import { Poppins } from "next/font/google";

interface ReportData {
  id: string;
  title: string;
  date: string;
  summary: string;
  expiryTime: Date;
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // You can add more weights if needed
  variable: '--font-poppins',
});

export default function Page() {
  const params = useParams();
  const chatId = params?.id as string;

  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [suggestedQuestions, setSuggestedQuestions] = useState([
  ]);

  const handleAskQuestion = (question: string) => {
    console.log("Question asked:", question);
  };

  const handleDeleteReport = () => {
    setReport(null);
    toast("Report deleted", {
      description: "Your report has been permanently deleted.",
    });
  };

  // ✅ Load report on first load
  useEffect(() => {
    const getExistingReport = async () => {
      if (!chatId) return;

      try {
        // Send the chatId to the backend via POST request
        const res = await fetch('/api/findReport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId }),
        });

        const data = await res.json();

        if (data.found) {
          setReport({
            ...data.report,
            expiryTime: new Date(data.report.expiryTime),
          });
        }
      } catch (err) {
        console.error("Failed to load existing report:", err);
      }
    };

    getExistingReport();
  }, [chatId]);


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const fileType = file.type;
      const isValidFileType =
        fileType === 'application/pdf' ||
        fileType === 'image/jpeg' ||
        fileType === 'image/png';

      if (!isValidFileType) {
        throw new Error('Please upload a PDF or image (JPEG/PNG).');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 10MB.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);

      const response = await fetch('/api/reportsummary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze the document');
      }

      const reportData = await response.json();

      setReport({
        ...reportData,
        expiryTime: new Date(reportData.expiryTime),
      });

      toast.success("Analysis complete", {
        description: "Your medical report has been analyzed successfully.",
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during file processing');
      toast.error("Upload failed", {
        description: err.message || 'Failed to analyze the document',
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  return (
    <div className={`min-h-screen bg-teal-100 flex flex-col bg-gradient-to-b from-background to-muted/30 backdrop-blur-xs ${poppins.className}`}>
      <Header />

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left column - Report summary or upload */}
          <div className="space-y-6 lg:max-h-[calc(100vh-12rem)] overflow-y-auto animate-fade-in animate-in-delay-1">
            {isProcessing ? (
              <Card className="w-full overflow-hidden backdrop-blur-sm bg-card/90 transition-all duration-300 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-muted-foreground">Analyzing your document with AI...</p>
                  <p className="text-xs text-muted-foreground">This may take up to 40 seconds</p>
                </div>
              </Card>
            ) : report ? (
              <ReportSummary
                report={report}
                onDelete={handleDeleteReport}
              />
            ) : (
              <Card className="w-full overflow-hidden backdrop-blur-sm bg-card/90 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <UploadCloud className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium">Upload your medical report</h3>
                    <p className="text-center text-muted-foreground max-w-md">
                      Upload your medical document and our AI will analyze it and provide you with a summary and insights.
                    </p>
                    <div className="pt-4">
                      <Button
                        className="relative overflow-hidden"
                        size="lg"
                      >
                        <input
                          type="file"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                        />
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive mt-2">{error}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, JPEG, PNG (Max: 10MB)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Chat interface */}
          <div className="lg:h-[calc(100vh-12rem)] animate-fade-in animate-in-delay-2">
            <ChatInterface
              suggestedQuestions={suggestedQuestions}
              onAskQuestion={handleAskQuestion}
              report={report}
            />
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
}
