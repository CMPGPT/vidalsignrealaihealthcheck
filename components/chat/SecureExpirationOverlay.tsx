'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, QrCode, ExternalLink, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function SecureExpirationOverlay() {
  const [isLoading, setIsLoading] = useState(false);

  const handleWait = () => {
    toast.info("Session expired", {
      description: "Your 24-hour secure chat session has ended. Please purchase a new starter plan for immediate access.",
    });
  };

  const handleBuyNow = () => {
    setIsLoading(true);
    // Redirect to home page to purchase another starter plan
    window.location.href = '/';
  };

  const handleContactSupport = () => {
    // Open email client with support email
    const subject = encodeURIComponent('Secure Chat Support Request');
    const body = encodeURIComponent('Hello,\n\nI need assistance with my VidalSigns secure chat session.\n\nThank you.');
    window.open(`mailto:support@vidalsigns.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Session Expired</h2>
              <p className="text-gray-600">
                Your 24-hour secure chat session has ended. Your medical report analysis and chat history are no longer accessible.
              </p>
            </div>

            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 mb-4">Choose your next step:</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Wait Option */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Get New Starter Plan</h3>
                      <p className="text-sm text-gray-600">Purchase another $1 starter plan for immediate access</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleWait}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Wait
                  </Button>
                </div>
              </div>

              {/* Buy Option */}
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Buy New Starter Plan</h3>
                      <p className="text-sm text-gray-600">Get immediate 24-hour access for just $1</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleBuyNow}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                Need immediate assistance? Contact our support team for help.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContactSupport}
                className="text-gray-600 hover:text-gray-800"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 