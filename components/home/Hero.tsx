'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { X, Mail, CheckCircle, ImagePlus } from "lucide-react";

const Hero = () => {
  const router = useRouter();
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);

  const handleUploadClick = () => {
    setIsUploadLoading(true);
    setTimeout(() => {
      setIsUploadLoading(false);
      setShowEmailModal(true);
    }, 1000);
  };

  const handlePartnerClick = () => {
    setIsPartnerLoading(true);
    setTimeout(() => {
      setIsPartnerLoading(false);
      router.push('/partners');
    }, 1000);
  };

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
    <section className="relative pt-28 md:pt-40 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 -right-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 -left-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-[85rem] mx-auto">
          <span className="inline-flex items-center gap-x-2 bg-secondary/50 border border-[hsl(var(--border))] rounded-full py-2 px-4 text-sm text-primary font-medium mb-6 animate-fade-in-up">
            <span className="flex size-2 rounded-full bg-primary"></span>
            HIPAA Compliant Medical Platform
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-6 animate-fade-in-up [animation-delay:200ms]">
            Understand Your Lab Results
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent block pr-1 pb-3 mb-1">
              {" "}In Plain English
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10 animate-fade-in-up [animation-delay:400ms]">
            VidalSigns translates complex lab reports into clear, easy-to-understand explanations using advanced AI technology—no medical knowledge required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:600ms]">
            <Button
              size="lg"
              onClick={handleUploadClick}
              disabled={isUploadLoading}
              className="rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25 hover:transform hover:translate-y-[-2px] transition-all"
            >
              {isUploadLoading ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                'Upload Your Labs'
              )}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handlePartnerClick}
              disabled={isPartnerLoading}
              className="rounded-full px-8 py-6 border-primary text-primary hover:bg-primary/5"
            >
              {isPartnerLoading ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Loading...
                </>
              ) : (
                'Partner With Us'
              )}
            </Button>
          </div>

          <div id="upload-section" className="mt-16 md:mt-24 animate-fade-in-up [animation-delay:800ms]">
            <div
              onClick={handleUploadClick}
              className="max-w-5xl mx-auto p-6 md:p-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-center cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <ImagePlus className="h-10 w-10 text-primary" />
                </div>
                <p className="font-semibold text-primary">Click to upload your lab report</p>
                <p className="text-xs text-muted-foreground">PDF, PNG, or JPG supported. Your data is private.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in-up [animation-delay:1000ms]">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">100K+</span>
              <span className="text-muted-foreground">Healthcare Providers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">500K+</span>
              <span className="text-muted-foreground">Patients Served</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">4.9/5</span>
              <span className="text-muted-foreground">Uptime</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">AI</span>
              <span className="text-muted-foreground">Compliant</span>
            </div>
          </div>
                 </div>
       </div>

       {/* Email Modal */}
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
     </section>
   );
 };

 export default Hero;
