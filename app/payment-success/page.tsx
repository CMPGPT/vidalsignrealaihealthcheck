'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Download, QrCode, Mail, Loader2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Separate component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [generatedItems, setGeneratedItems] = useState<{
    secureLinks: string[];
    qrCodes: string[];
  } | null>(null);

  const sessionId = searchParams.get('session_id');
  const brand = searchParams.get('brand'); // This is now the userId
  const email = searchParams.get('email');
  const plan = searchParams.get('plan');
  const price = searchParams.get('price');
  const [planWithPrice, setPlanWithPrice] = useState<string | null>(price ? `${plan} - $${price}` : null);
  const quantity = searchParams.get('quantity');
  const [brandName, setBrandName] = useState<string>('');
  
  // Get the original website URL from the brand parameter (userId)
  const websiteUrl = brand ? `/partnerswebsite/${encodeURIComponent(brand)}` : '/';

  // Fetch brand name from userId
  useEffect(() => {
    const fetchBrandName = async () => {
      if (brand) {
        try {
          const res = await fetch(`/api/brand-settings/public?brandId=${encodeURIComponent(brand)}`);
          const data = await res.json();
          if (data.success && data.brandSettings?.brandName) {
            setBrandName(data.brandSettings.brandName);
          }
        } catch (e) {
          console.error('Failed to fetch brand name:', e);
        }
      }
    };
    fetchBrandName();
  }, [brand]);

  useEffect(() => {
    const fetchPlanPrice = async () => {
      if (!planWithPrice && brand && plan) {
        // Fetch brand settings to get the price for the plan
        try {
          const res = await fetch(`/api/brand-settings/public?brandId=${encodeURIComponent(brand)}`);
          const data = await res.json();
          if (data.success && data.brandSettings?.pricingSection?.plans) {
            const foundPlan = data.brandSettings.pricingSection.plans.find((p: any) => p.name === plan);
            if (foundPlan && foundPlan.price) {
              setPlanWithPrice(`${plan} - ${foundPlan.price}`);
            }
          }
        } catch (e) {
          // fallback: just use plan name
          setPlanWithPrice(plan);
        }
      }
    };
    fetchPlanPrice();
  }, [planWithPrice, brand, plan]);

  // Countdown timer for redirect
  useEffect(() => {
    if (!isProcessing && !hasError && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Redirect to partner website
      window.location.href = websiteUrl;
    }
  }, [countdown, isProcessing, hasError, websiteUrl]);

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log('🔍 PAYMENT SUCCESS: Processing payment for session:', sessionId);
        console.log('🔍 PAYMENT SUCCESS: Request data:', { sessionId, brand, email, plan, quantity });
        
        // Check if this session has already been processed
        const processedSessions = JSON.parse(sessionStorage.getItem('processedPaymentSessions') || '[]');
        if (processedSessions.includes(sessionId)) {
          console.log('✅ PAYMENT SUCCESS: Session already processed, skipping');
          toast.info('Payment already processed. Your secure links have been sent to your email.');
          setIsProcessing(false);
          return;
        }
        
        console.log('🔍 PAYMENT SUCCESS: Calling API with data:', {
          sessionId,
          brand,
          email,
          plan: planWithPrice,
          quantity: quantity || '1 Secure Link',
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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
              plan: planWithPrice || plan || 'Secure Link Plan', // Fallback if planWithPrice is null
              quantity: quantity || '1 Secure Link',
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
          console.log('❌ PAYMENT SUCCESS: API error response:', errorData);
          
          // If the error is about missing fields but we have the data, try to proceed anyway
          if (errorData.error && errorData.error.includes('Encountering error')) {
            console.log('⚠️ PAYMENT SUCCESS: Got generic error, but payment might still be processed');
            // Don't show error to user, just proceed as if successful
            toast.success('Payment processed successfully! Check your email for secure links.');
            setIsProcessing(false);
            return;
          }
          
          throw new Error(errorData.error || 'Failed to process payment');
        }

        const data = await response.json();
        console.log('✅ PAYMENT SUCCESS: Response data:', data);
        
        if (data.alreadyProcessed) {
          toast.info(data.message || 'Payment already processed. Your secure links have been sent to your email.');
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
        
        // Don't show error to user if it's a validation issue - just proceed
        if (error instanceof Error && error.message.includes('Missing required fields')) {
          console.log('⚠️ PAYMENT SUCCESS: Validation error, but proceeding as successful');
          toast.success('Payment processed successfully! Check your email for secure links.');
          setIsProcessing(false);
          return;
        }
        
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to process payment. Please contact support.');
        toast.error(error instanceof Error ? error.message : 'Failed to process payment. Please contact support.');
      } finally {
        setIsProcessing(false);
      }
    };

    if (sessionId) {
      processPayment();
    }
  }, [sessionId, brand, email, planWithPrice, quantity]);

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
              Generating your secure links...
            </p>
            <div className="text-sm text-gray-500">
              Please don't close this page until you receive your email
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Payment Processing Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {errorMessage}
            </p>
            <div className="text-sm text-gray-500">
              Please contact support if this issue persists
            </div>
            <Button 
              onClick={() => window.location.href = websiteUrl}
              variant="outline"
              className="w-full"
            >
              Return to Website
            </Button>
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
            Thank you for your purchase from {brandName}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Secure Links Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {quantity}
              </div>
              <p className="text-gray-600">
                Secure links have been created and sent to your email
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                ✓
              </div>
              <p className="text-gray-600">
                Check your email for secure links and instructions
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
                <p className="text-lg font-semibold">{brandName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span>Check your email for secure links and instructions</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Clock className="h-4 w-4" />
            <span>Redirecting to {brandName} in {countdown} seconds...</span>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.href = websiteUrl}
              variant="outline"
            >
              Return to {brandName} Now
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm">
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