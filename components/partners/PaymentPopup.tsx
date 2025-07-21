'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentPlan {
  name: string;
  price: string;
  quantity: string;
  description: string;
  features: string[];
  popular: boolean;
  buttonText: string;
}

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PaymentPlan;
  brandName: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export default function PaymentPopup({ 
  isOpen, 
  onClose, 
  plan, 
  brandName, 
  brandColors 
}: PaymentPopupProps) {
  const [step, setStep] = useState<'email' | 'payment' | 'processing' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 PAYMENT: Creating checkout session for:', {
        plan: plan.name,
        price: plan.price,
        quantity: plan.quantity,
        email: email,
        brandName: brandName,
      });

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan.name,
          price: plan.price,
          quantity: plan.quantity,
          email: email,
          brandName: brandName,
          source: 'website', // Add this flag
        }),
      });

      const data = await response.json();
      console.log('🔍 PAYMENT: Response:', data);

      if (!response.ok) {
        console.error('❌ PAYMENT: Response error:', data);
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.sessionUrl) {
        throw new Error('No checkout URL received');
      }

      console.log('✅ PAYMENT: Redirecting to Stripe checkout');
      // Redirect to Stripe checkout
      window.location.href = data.sessionUrl;
      
    } catch (error) {
      console.error('❌ PAYMENT: Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      console.error('❌ PAYMENT: Error message:', errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'email' && 'Enter Your Email'}
            {step === 'payment' && 'Complete Purchase'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Payment Successful!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'email' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>
                  {plan.price}
                </div>
                <div className="text-sm text-gray-600 mb-4">for {plan.quantity}</div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Continue to Payment
                </Button>
              </form>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>{plan.name}</span>
                    <span className="font-semibold">{plan.price}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {plan.quantity} • {plan.description}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{plan.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">What's included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full"
                style={{ backgroundColor: brandColors.primary }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {plan.price}
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto" style={{ color: brandColors.primary }} />
              <p>Processing your payment...</p>
              <p className="text-sm text-gray-600">Please don't close this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p className="text-sm text-gray-600">
                Your secure links and QR codes will be generated and sent to your email shortly.
              </p>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 