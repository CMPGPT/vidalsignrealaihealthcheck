'use client'

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, CheckCircle } from "lucide-react";

const partnerPlans = [
  {
    name: "Starter",
    price: "$1",
    period: "for one QR code",
    description: "Perfect for trying out our service or single patient use.",
    features: [
      "1 QR code",
      "Basic patient portal",
      "Simple analytics",
      "Email support",
      "HIPAA compliant",
      "24 hour access"
    ],
    popular: false,
    buttonText: "Get Started",
    buttonVariant: "outline",
    isStarter: true
  },
  {
    name: "Standard Partner",
    price: "$199",
    period: "per month",
    description: "Ideal for growing clinics and wellness facilities.",
    features: [
      "500 QR codes per month",
      "Custom branded patient portal",
      "Seller website included",
      "Detailed usage analytics",
      "Priority support",
      "Marketing materials",
      "API access for integration",
      "Volume discount eligible"
    ],
    popular: true,
    buttonText: "Become a Partner",
    buttonVariant: "default"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large healthcare networks and hospital systems.",
    features: [
      "Unlimited QR codes",
      "White-label solution",
      "Advanced analytics and reporting",
      "Dedicated account manager",
      "Custom integration services",
      "Bulk generation capabilities",
      "Up to 25% volume discount"
    ],
    popular: false,
    buttonText: "Go as a Partner",
    buttonVariant: "outline"
  }
];

const Pricing = () => {
  const router = useRouter();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStarterClick = () => {
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // Create checkout session for $1 Starter plan
      const response = await fetch('/api/create-starter-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          plan: 'starter',
          amount: 100 // $1.00 in cents
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsSubmitting(false);
      alert('Failed to process payment. Please try again.');
    }
  };

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Partner With VidalSigns
          </h2>
          <p className="text-muted-foreground text-lg">
            Offer AI-powered lab report translations to your clients and patients with our partner program.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {partnerPlans.map((plan, index) => (
            <GlassCard 
              key={index}
              className={`p-8 flex flex-col h-full ${plan.popular ? 'border-primary ring-1 ring-primary relative' : ''}`}
              opacity={plan.popular ? "medium" : "light"}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white text-sm font-medium py-1 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                {plan.isStarter ? (
                  <Button 
                    variant={plan.buttonVariant as "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"}
                    className={`w-full rounded-full py-6 ${
                      plan.buttonVariant === "outline" 
                        ? "hover:bg-primary/10 hover:text-primary" 
                        : "bg-primary hover:bg-primary/90"
                    }`}
                    onClick={handleStarterClick}
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <Link href="/partners/qrcodes">
                    <Button 
                      variant={plan.buttonVariant as "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"}
                      className={`w-full rounded-full py-6 ${
                        plan.buttonVariant === "outline" 
                          ? "hover:bg-primary/10 hover:text-primary" 
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            All partner plans include a 14-day trial period and dedicated onboarding support.
          </p>
          <p className="text-sm text-muted-foreground">
            Starter plan is perfect for testing. Upgrade to Standard Partner for full features and seller website.
          </p>
        </div>
      </div>

      {/* Email Modal for Starter Plan */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmail('');
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Get Your Starter Plan
              </h2>
              <p className="text-gray-600">
                Enter your email to proceed with the $1 payment for your QR code.
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
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment ($1)'
                )}
              </Button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              You'll be redirected to our secure payment processor.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;
