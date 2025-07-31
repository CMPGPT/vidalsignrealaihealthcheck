import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, QrCode, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";

interface ExpirationOverlayProps {
  className?: string;
  onClose?: () => void;
}

const ExpirationOverlay = ({ className, onClose }: ExpirationOverlayProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyQR = () => {
    setIsLoading(true);
    toast.info("Redirecting to QR purchase...", {
      description: "You'll be taken to our QR code purchase page.",
    });
    
    setTimeout(() => {
      window.open('/partners/qrcodes', '_blank');
      setIsLoading(false);
    }, 1000);
  };

  const handleWait14Days = () => {
    toast.info("Session expired", {
      description: "Please wait 14 days before trying again, or purchase a QR code for immediate access.",
    });
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-black/50 backdrop-blur- transition-all duration-300",
      className
    )}>

      {/* Main content */}
      <div className="w-full max-w-md mx-4">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Session Expired
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Your chat session has expired. You've used up your allocated time.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 font-medium mb-4">
                Choose your next step:
              </p>
            </div>

            {/* Option 1: Wait 14 days */}
            <div className="group cursor-pointer" onClick={handleWait14Days}>
              <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">Wait 14 Days</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Free access will be available again in 14 days
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white hover:bg-gray-50"
                  >
                    Wait
                  </Button>
                </div>
              </div>
            </div>

            {/* Option 2: Buy QR Code */}
            <div className="group cursor-pointer" onClick={handleBuyQR}>
              <div className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <QrCode className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">Buy QR Code</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Get immediate access with a QR code purchase
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={handleBuyQR}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-3 w-3" />
                        <span>Buy Now</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Need immediate assistance? Contact our support team for help.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpirationOverlay; 