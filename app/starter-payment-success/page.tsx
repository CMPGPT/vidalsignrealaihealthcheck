'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StarterPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const email = searchParams.get('email');
  const plan = searchParams.get('plan');

  useEffect(() => {
    const processStarterPayment = async () => {
      try {
        console.log('🔍 STARTER PAYMENT SUCCESS: Processing payment for session:', sessionId);
        console.log('🔍 STARTER PAYMENT SUCCESS: Request data:', { sessionId, email, plan });
        
        // Check if this session has already been processed
        const processedSessions = JSON.parse(sessionStorage.getItem('processedStarterSessions') || '[]');
        if (processedSessions.includes(sessionId)) {
          console.log('✅ STARTER PAYMENT SUCCESS: Session already processed, skipping');
          toast.info('Payment already processed. Your QR code has been sent to your email.');
          setIsProcessing(false);
          return;
        }
        
        // Process the payment and generate secure link
        const response = await fetch('/api/process-starter-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            email
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ STARTER PAYMENT SUCCESS: API Error:', errorData);
          throw new Error(errorData.error || 'Failed to process payment');
        }

        const data = await response.json();
        
        setPaymentDetails({
          sessionId,
          email,
          plan: 'Starter Plan',
          amount: '$1.00',
          qrCodes: 1,
          accessDuration: '24 hours',
          secureLink: data.secureLink
        });
        
        toast.success('Payment processed successfully! Your QR code has been generated and sent to your email.');
        
        // Mark this session as processed
        processedSessions.push(sessionId);
        sessionStorage.setItem('processedStarterSessions', JSON.stringify(processedSessions));
        
      } catch (error) {
        console.error('❌ STARTER PAYMENT SUCCESS: Payment processing error:', error);
        toast.error('Failed to process payment. Please contact support.');
      } finally {
        setIsProcessing(false);
      }
    };

    if (sessionId) {
      processStarterPayment();
    }
  }, [sessionId, email, plan]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Processing Your Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-green-600" />
            <p className="text-gray-600">
              Generating your QR code and secure link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for purchasing the VidalSigns Starter Plan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                QR Code Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                1 QR Code
              </div>
              <p className="text-gray-600">
                Your QR code has been created and is ready for use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Secure Link Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                Email Sent
              </div>
              <p className="text-gray-600">
                Secure link has been sent to your email address
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p className="text-lg font-semibold">Starter Plan</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-lg font-semibold">$1.00</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg font-semibold">{email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Access Duration</p>
                <p className="text-lg font-semibold">24 Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span>Check your email for your secure link and QR code</span>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => window.location.href = '/partners'}
              className="bg-primary hover:bg-primary/90"
            >
              Upgrade to Partner Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 