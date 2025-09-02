'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function StarterPaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const email = searchParams.get('email');
  const plan = searchParams.get('plan');
  const quantity = searchParams.get('quantity');

  useEffect(() => {
    // Ensure backend generates secure links and sends email (works even without webhooks)
    const handlePaymentSuccess = async () => {
      try {
        console.log('🔍 STARTER PAYMENT SUCCESS: Displaying success for session:', sessionId);
        console.log('🔍 STARTER PAYMENT SUCCESS: Plan data:', { plan, email, quantity });
        
        // Call backend to generate secure links and send email
        try {
          const response = await fetch('/api/process-starter-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              email,
              plan,
              quantity
            })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            console.error('❌ STARTER PAYMENT SUCCESS: process-starter-payment error:', data);
          } else {
            console.log('✅ STARTER PAYMENT SUCCESS: process-starter-payment success:', data);
          }
        } catch (apiErr) {
          console.error('❌ STARTER PAYMENT SUCCESS: Failed to call process-starter-payment:', apiErr);
        }

        // Extract quantity number from the quantity parameter
        const qrQuantity = quantity ? parseInt(quantity) : 1;
        
        // Extract price from plan name if it contains a price
        let planPrice = '$1.00'; // default
        if (plan?.includes('$')) {
          const priceMatch = plan.match(/\$(\d+)/);
          if (priceMatch) {
            planPrice = `$${priceMatch[1]}.00`;
          }
        } else {
          // If no price in plan name, calculate based on quantity
          const prices = { 1: '$29', 2: '$49', 3: '$79' };
          planPrice = prices[qrQuantity as keyof typeof prices] || '$29.00';
        }
        
        setPaymentDetails({
          sessionId,
          email,
          plan: plan || 'VidalSigns Plan',
          amount: planPrice,
          qrCodes: qrQuantity,
          accessDuration: '24 hours',
          secureLink: 'processed-by-server'
        });
        
        toast.success(`Payment processed successfully! Your ${qrQuantity} QR code${qrQuantity > 1 ? 's have' : ' has'} been generated and sent to your email.`);
        
      } catch (error) {
        console.error('❌ STARTER PAYMENT SUCCESS: Error displaying success:', error);
        toast.error('Failed to display payment details. Please contact support.');
      } finally {
        setIsProcessing(false);
      }
    };

    if (sessionId) {
      // Add a small delay to allow webhook processing to complete
      setTimeout(() => {
        handlePaymentSuccess();
      }, 2000);
    }
  }, [sessionId, email, plan, quantity]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm">
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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for purchasing {plan || 'the VidalSigns Plan'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                QR Code Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {quantity ? parseInt(quantity) : 1} QR Code{quantity && parseInt(quantity) > 1 ? 's' : ''}
              </div>
              <p className="text-gray-600">
                Your QR code{quantity && parseInt(quantity) > 1 ? 's have' : ' has'} been created and {quantity && parseInt(quantity) > 1 ? 'are' : 'is'} ready for use
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
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

        <Card className="mb-8 bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p className="text-lg font-semibold">{plan || 'VidalSigns Plan'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-lg font-semibold">
                  {(() => {
                    if (plan?.includes('$')) {
                      const priceMatch = plan.match(/\$(\d+)/);
                      return priceMatch ? `$${priceMatch[1]}.00` : '$29.00';
                    }
                    const qty = quantity ? parseInt(quantity) : 1;
                    const prices = { 1: '$29.00', 2: '$49.00', 3: '$79.00' };
                    return prices[qty as keyof typeof prices] || '$29.00';
                  })()}
                </p>
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
            <span>Check your email for your secure link{quantity && parseInt(quantity) > 1 ? 's' : ''} and QR code{quantity && parseInt(quantity) > 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className='bg-[#2563eb] hover:bg-[#2563eb]/90 border-none text-white'
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => window.location.href = 'http://partner.vidalsigns.com'}
              className="bg-[#2563eb] hover:bg-[#2563eb]/90 border-none text-white"
            >
              Upgrade to Partner Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StarterPaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-green-600" />
            <p className="text-gray-600">
              Loading payment details...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <StarterPaymentSuccessContent />
    </Suspense>
  );
} 