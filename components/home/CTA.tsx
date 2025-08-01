'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, CheckCircle, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const CTA = () => {
  const router = useRouter();
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  
  // Contact form states
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [isContactSuccess, setIsContactSuccess] = useState(false);

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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all required fields", {
        description: "Name, email, and message are required."
      });
      return;
    }

    setIsContactSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        setIsContactSuccess(true);
        setContactForm({ name: '', email: '', organization: '', message: '' });
        toast.success("Message sent successfully!", {
          description: "We'll get back to you soon."
        });
        
        // Reset success state after 3 seconds
        setTimeout(() => {
          setIsContactSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "Please try again later."
      });
    } finally {
      setIsContactSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 -right-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to understand your lab results?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Whether you&apos;re an individual seeking clarity or a business looking to offer added value to your clients, VidalSigns makes lab interpretation simple.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25 hover:transform hover:translate-y-[-2px] transition-all"
              onClick={handleUploadClick}
              disabled={isUploadLoading}
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
          
          <div className="bg-secondary/50 border border-[hsl(var(--border))] rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-medium mb-6">Contact Us</h3>
            {isContactSuccess ? (
              <div className="max-w-xl mx-auto text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-green-800 mb-2">Message Sent Successfully!</h4>
                <p className="text-green-600">Thank you for contacting us. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="max-w-xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Name *</label>
                    <input
                      type="text"
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      type="email"
                      id="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">Organization</label>
                  <input
                    type="text"
                    id="organization"
                    value={contactForm.organization}
                    onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Your gym, wellness center, or business name"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Message *</label>
                  <textarea
                    id="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isContactSubmitting}
                  className="w-full rounded-lg py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isContactSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
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
      
      <Toaster />
    </section>
  );
};

export default CTA;
