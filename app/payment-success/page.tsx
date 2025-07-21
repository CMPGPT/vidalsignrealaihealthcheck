'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Download, QrCode, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Separate component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [generatedItems, setGeneratedItems] = useState<{
    secureLinks: string[];
    qrCodes: string[];
  } | null>(null);

  const sessionId = searchParams.get('session_id');
  const brand = searchParams.get('brand');
  const email = searchParams.get('email');
  const plan = searchParams.get('plan');
  const quantity = searchParams.get('quantity');
  // Try to get the original website path from the URL (brand or id)
  // If brand is a slug or id, use it to construct the return URL
  const websiteUrl = brand ? `/partnerswebsite/${encodeURIComponent(brand)}` : '/';

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log('🔍 PAYMENT SUCCESS: Processing payment for session:', sessionId);
        console.log('🔍 PAYMENT SUCCESS: Request data:', { sessionId, brand, email, plan, quantity });
        
        // Check if this session has already been processed
        const processedSessions = JSON.parse(sessionStorage.getItem('processedPaymentSessions') || '[]');
        if (processedSessions.includes(sessionId)) {
          console.log('✅ PAYMENT SUCCESS: Session already processed, skipping');
          toast.info('Payment already processed. Your QR codes have been sent to your email.');
          setIsProcessing(false);
          return;
        }
        
        console.log('🔍 PAYMENT SUCCESS: Calling API with data:', {
          sessionId,
          brand,
          email,
          plan,
          quantity: quantity || '1 QR Code',
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response: Response;
        try {
          response = await fetch('/api/process-customer-purchase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              brand,
              email,
              plan: plan || '', // Pass the exact plan string with price from URL
              quantity: quantity || '1 QR Code',
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          throw fetchError;
        }

        console.log('🔍 PAYMENT SUCCESS: API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process payment');
        }

        const data = await response.json();
        console.log('✅ PAYMENT SUCCESS: Response data:', data);
        
        if (data.alreadyProcessed) {
          toast.info(data.message || 'Payment already processed. Your QR codes have been sent to your email.');
        } else {
          setGeneratedItems(data.generatedItems);
          toast.success(data.message || 'Payment processed successfully!');
          
          // Mark this session as processed
          processedSessions.push(sessionId);
          sessionStorage.setItem('processedPaymentSessions', JSON.stringify(processedSessions));
        }
        
      } catch (error) {
        console.error('❌ PAYMENT SUCCESS: Payment processing error:', error);
        console.error('❌ PAYMENT SUCCESS: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          sessionId,
          brand,
          email,
          plan,
          quantity
        });
        toast.error(error instanceof Error ? error.message : 'Failed to process payment. Please contact support.');
      } finally {
        setIsProcessing(false);
      }
    };

    if (sessionId) {
      processPayment();
    }
  }, [sessionId, brand, email, plan, quantity]);

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
              Generating your secure links and QR codes...
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
            Thank you for your purchase from {brand}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Codes Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {quantity}
              </div>
              <p className="text-gray-600">
                QR codes have been created and are ready for use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Secure Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {quantity}
              </div>
              <p className="text-gray-600">
                Secure links have been generated and sent to your email
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
                <p className="text-lg font-semibold">{plan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Quantity</p>
                <p className="text-lg font-semibold">{quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg font-semibold">{email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Brand</p>
                <p className="text-lg font-semibold">{brand}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span>Check your email for secure links and QR codes</span>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.href = websiteUrl}
              variant="outline"
            >
              Back to Website
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Loading Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">
            Please wait while we load your payment information...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}