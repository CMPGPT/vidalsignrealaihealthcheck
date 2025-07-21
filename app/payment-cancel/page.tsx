'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, Loader2 } from 'lucide-react';

// Separate component that uses useSearchParams
function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const brand = searchParams.get('brand');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600">
            Your payment was cancelled. No charges were made.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You cancelled the payment process before it was completed. 
              No charges were made to your account.
            </p>
            <p className="text-gray-600">
              If you'd like to complete your purchase, you can return to the website 
              and try again.
            </p>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {brand || 'Website'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function PaymentCancelLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Loading...
          </h1>
          <p className="text-lg text-gray-600">
            Please wait while we load the page details.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<PaymentCancelLoading />}>
      <PaymentCancelContent />
    </Suspense>
  );
}