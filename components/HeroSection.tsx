"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Sparkles, Mail, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onFileUpload: (file: File) => void;
}

export const HeroSection = ({ onFileUpload }: HeroSectionProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Email modal states (preserved from existing Hero.tsx)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        // Instead of directly uploading, show email modal first
        setShowEmailModal(true);
      } else {
        alert("Please upload a PDF or image file.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUploadClick = () => {
    setShowEmailModal(true);
  };

  // Email submission logic (preserved from existing Hero.tsx)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setLimitReached(false);
    
    try {
      const response = await fetch('/api/send-chat-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmail('');
          setIsSuccess(false);
        }, 3000);
      } else {
        // Handle limit reached case
        if (data.limitReached) {
          setLimitReached(true);
          setRemainingDays(data.remainingDays);
          setIsSubmitting(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to send chat link');
      }
    } catch (error) {
      console.error('Error sending chat link:', error);
      setIsSubmitting(false);
      
      // Get specific error message
      let errorMessage = 'Failed to send chat link. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show error in modal instead of alert
      setEmail('');
      alert(errorMessage);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary-glow/20 rounded-full animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Text */}
            <div className="animate-slide-up">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Understand Your Lab Results
                <span className="block gradient-text mt-4">In Plain English.</span>
              </h1>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
                Stop guessing what your health reports mean. Upload your file securely and get instant, 
                easy-to-understand insights from our AI powered by medical literature.
              </p>
            </div>

            {/* Upload Section */}
            <div className="mt-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div
                className={`relative group hover-lift ${isDragOver ? 'scale-105' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                
                <div 
                  className={`glass-card p-12 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${
                    isDragOver ? 'border-blue-600 bg-blue-50' : 'border-blue-300'
                  }`}
                  onClick={handleUploadClick}
                >
                  <div className="flex flex-col items-center space-y-6">
                    <div className="p-6 rounded-full bg-gradient-primary animate-pulse-slow">
                      <Upload className="h-12 w-12 text-white" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-blue-600 mb-2">
                        Click to upload your lab report
                      </h3>
                      <p className="text-gray-600">
                        PDF, PNG, or JPG supported. Your data is private and secure.
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-teal-600" />
                        <span>AI-Powered</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-teal-600" />
                        <span>Instant Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex justify-center items-center space-x-8 text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.9s' }}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Evidence-Based</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Modal (preserved from existing Hero.tsx) */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowEmailModal(false);
                setLimitReached(false);
                setEmail('');
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {!isSuccess && !limitReached ? (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Get Your Chat Link
                  </h2>
                  <p className="text-gray-600">
                    Enter your email to receive a secure link for uploading and analyzing your lab results.
                  </p>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Sending...
                      </>
                    ) : (
                      'Get Chat Link'
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  We'll send you a secure link to upload and analyze your lab results.
                </p>
              </>
            ) : limitReached ? (
              <>
                {/* Limit Reached State */}
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Limit Reached
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You have already used your limit for this email address.
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <p className="text-orange-800 font-medium">
                      Please wait <strong>{remainingDays} more day{remainingDays !== 1 ? 's' : ''}</strong> before requesting another link.
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    This helps us maintain service quality and prevent abuse.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Check Your Email!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We've sent a secure chat link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    The link will expire in 30 minutes for your security.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
