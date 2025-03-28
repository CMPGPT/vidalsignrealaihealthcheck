'use client'

import { useState } from "react";
import Header from "@/components/chat/Header";
import ReportSummary from "@/components/chat/ReportSummary";
import ChatInterface from "@/components/chat/ChatInterface";
import { Toaster } from "@/components/ui/sonner";
import React from 'react'

// Next.js functional component
export default function page() {
  // Sample report data
  const [report, setReport] = useState({
    id: "REP-2023-001",
    title: "Comprehensive Health Assessment",
    date: "October 15, 2023",
    summary: `Your recent laboratory results show normal complete blood count (CBC) values. White blood cells, red blood cells, and platelets are all within expected ranges.

    Your cholesterol profile shows slightly elevated LDL levels (130 mg/dL), while HDL remains optimal. Your doctor recommends dietary adjustments to improve these values.

    Blood pressure reading of 128/82 mmHg indicates pre-hypertension. Regular monitoring is advised with lifestyle modifications including reduced sodium intake and regular exercise.

    Glucose levels are normal at 92 mg/dL, showing no signs of diabetes or pre-diabetic condition.`,
    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  });

  // Sample suggested questions
  const suggestedQuestions = [
    "What do my cholesterol levels mean?",
    "Should I be concerned about my blood pressure?",
    "What dietary changes are recommended?",
  ];

  const handleAskQuestion = (question: string) => {
    console.log("Question asked:", question);
    // Handle the question (would connect to AI backend in a real app)
  };

  const handleDeleteReport = () => {
    // In a real app, you would call an API to delete the report
    // For demo purposes, we'll just clear the report
    setReport({
      id: "",
      title: "",
      date: "",
      summary: "",
      expiryTime: new Date(),
    });
  };

  return (
    <div className="min-h-screen bg-teal-100 flex flex-col bg-gradient-to-b from-background to-muted/30 backdrop-blur-xs">
      <Header />

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left column - Report summary */}
          <div className="space-y-6 lg:max-h-[calc(100vh-12rem)] overflow-y-auto animate-fade-in animate-in-delay-1">
            {report.id ? (
              <ReportSummary
                report={report}
                onDelete={handleDeleteReport}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Report has been deleted</p>
              </div>
            )}
          </div>

          {/* Right column - Chat interface */}
          <div className="lg:h-[calc(100vh-12rem)] animate-fade-in animate-in-delay-2">
            <ChatInterface
              suggestedQuestions={suggestedQuestions}
              onAskQuestion={handleAskQuestion}
            />
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
};

