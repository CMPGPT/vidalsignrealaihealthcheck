import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, QrCode, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ExpirationMessageProps {
  className?: string;
  onRetry?: () => void;
}

const ExpirationMessage = ({ className, onRetry }: ExpirationMessageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyQR = () => {
    setIsLoading(true);
    // Redirect to QR purchase page or open modal
    toast.info("Redirecting to QR purchase...", {
      description: "You'll be taken to our QR code purchase page.",
    });
    
    // Simulate redirect (replace with actual redirect)
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
    <Card className={cn("w-full bg-destructive/5 border-destructive/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive text-lg">Session Expired</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Your chat session has expired. You've used up your allocated time for this session.
          </p>
          <p className="font-medium text-foreground">
            You have two options to continue:
          </p>
        </div>

        <div className="space-y-3">
          {/* Option 1: Wait 14 days */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Wait 14 Days</p>
                <p className="text-xs text-muted-foreground">
                  Free access will be available again in 14 days
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleWait14Days}
            >
              Wait
            </Button>
          </div>

          {/* Option 2: Buy QR Code */}
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <QrCode className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-sm">Buy QR Code</p>
                <p className="text-xs text-muted-foreground">
                  Get immediate access with a QR code purchase
                </p>
              </div>
            </div>
            <Button 
              size="sm"
              onClick={handleBuyQR}
              disabled={isLoading}
              className="flex items-center space-x-1"
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

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <p>
            Need immediate assistance? Contact our support team for help.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpirationMessage; 