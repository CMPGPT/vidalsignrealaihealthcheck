'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Download, QrCode, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
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

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log('🔍 PAYMENT SUCCESS: Processing payment for session:', sessionId);
        console.log('🔍 PAYMENT SUCCESS: Request data:', { sessionId, brand, email, plan, quantity });
        
        const response = await fetch('/api/process-customer-purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            brand,
            email,
            plan,
            quantity: parseInt(quantity || '1'),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process payment');
        }

        const data = await response.json();
        console.log('✅ PAYMENT SUCCESS: Response data:', data);
        setGeneratedItems(data.generatedItems);
        toast.success(data.message || 'Payment processed successfully!');
        
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
          
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
          >
            Back to Website
          </Button>
        </div>
      </div>
    </div>
  );
} 