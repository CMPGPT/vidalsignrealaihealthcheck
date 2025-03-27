import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
// Import centralized data
import { qrPackages } from "@/data/mock/partnerUsers";

interface QRPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (packageName: string | null, count: number, price: number) => void;
}

const QRPurchaseModal = ({ isOpen, onClose, onPurchase }: QRPurchaseModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [customQrCount, setCustomQrCount] = useState(100);
  const [activeTab, setActiveTab] = useState("packages");
  
  // Add style to head for webkit scrollbar
  useEffect(() => {
    // Add style to hide webkit scrollbars
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);

    // Add style for custom scrollbar
    const customStyle = document.createElement('style');
    customStyle.textContent = `
      .custom-scrollbar {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.8) rgba(0, 0, 0, 0.05);
        -ms-overflow-style: none !important;  /* IE and Edge */
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 0 !important;
      }
      
      .custom-scrollbar::-webkit-scrollbar-horizontal {
        height: 0 !important;
        display: none !important;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 3px;
        border: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #ffffff;
      }
      
      html body * ::-webkit-scrollbar-horizontal {
        display: none !important;
        height: 0 !important;
      }
      
      .no-horizontal-scroll {
        overflow-x: hidden !important;
        max-width: 100%;
      }

      .packages-container {
        max-height: calc(70vh - 200px);
        min-height: 0;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .custom-batch-container {
        max-height: calc(70vh - 200px);
        min-height: 0;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        display: flex;
        flex-direction: column;
        width: 100%;
        padding-right: 4px;
      }

      .custom-batch-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        padding: 0;
        align-items: flex-start;
        justify-content: flex-start;
      }

      .packages-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
        padding: 4px;
        width: 100%;
        overflow-x: hidden !important;
      }

      @media (max-height: 700px) {
        .packages-container,
        .custom-batch-container {
          max-height: calc(70vh - 160px);
        }
        .packages-grid {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 10px;
        }
      }

      @media (max-width: 640px) {
        .packages-container,
        .custom-batch-container {
          max-height: calc(60vh - 100px);
        }
        .packages-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }
      }

      .package-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .package-card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    `;
    document.head.appendChild(customStyle);

    return () => {
      document.head.removeChild(style);
      document.head.removeChild(customStyle);
    };
  }, []);

  const calculatePrice = () => {
    if (activeTab === "custom") {
      // Base price of $0.50 per code with volume discount
      const basePrice = customQrCount * 0.5;
      let discount = 0;
      
      if (customQrCount >= 5000) discount = 0.25;
      else if (customQrCount >= 1000) discount = 0.15;
      else if (customQrCount >= 500) discount = 0.10;
      
      return (basePrice * (1 - discount)).toFixed(2);
    } else {
      const pack = qrPackages.find(p => p.name === selectedPackage);
      return pack ? pack.price.toFixed(2) : "0.00";
    }
  };

  const incrementQrCount = () => {
    setCustomQrCount(prev => prev + 50);
  };

  const decrementQrCount = () => {
    setCustomQrCount(prev => Math.max(50, prev - 50));
  };

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(
        selectedPackage, 
        activeTab === "custom" ? customQrCount : qrPackages.find(p => p.name === selectedPackage)?.count || 0,
        parseFloat(calculatePrice())
      );
    }
    onClose();
  };

  // Function to calculate optimal grid columns based on window size
  useEffect(() => {
    const updateDimensions = () => {
      // Just update on resize - we don't need to store dimensions
    };

    // Update dimensions on resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] h-auto rounded-lg shadow-lg flex flex-col overflow-hidden p-0">
        <div className="p-3 sm:p-4 flex-shrink-0">
          <DialogHeader className="space-y-1 mb-2">
            <DialogTitle className="text-lg sm:text-xl">Purchase QR Code Batch</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Select a package or customize your own batch
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="packages" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 sm:px-4 mb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="custom">Custom Batch</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="px-3 sm:px-4 pb-4 flex-1 overflow-hidden">
            <TabsContent 
              value="packages" 
              className="h-full" 
              style={{ display: activeTab === "packages" ? "block" : "none" }}
            >
              <div className="packages-grid overflow-y-auto custom-scrollbar max-h-[calc(70vh-200px)]">
                {qrPackages.map((pkg) => (
                  <Card 
                    key={pkg.name} 
                    className={`package-card cursor-pointer transition-all hover:shadow-md relative ${selectedPackage === pkg.name ? 'border-primary ring-2 ring-primary/20' : ''}`}
                    onClick={() => setSelectedPackage(pkg.name)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 -right-2 z-50">
                        <Badge className="bg-primary shadow-sm">Popular</Badge>
                      </div>
                    )}
                    <CardContent className="package-card-content p-2 sm:p-3">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-base sm:text-lg">{pkg.name}</h3>
                        {pkg.discountPercent > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            {pkg.discountPercent}% OFF
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg sm:text-2xl font-bold">${pkg.price}</p>
                      <p className="text-muted-foreground text-xs sm:text-sm">{pkg.count} QR codes</p>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        ${(pkg.price / pkg.count).toFixed(2)} per code
                      </p>
                      {pkg.description && (
                        <p className="text-xs mt-1 text-muted-foreground">{pkg.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent 
              value="custom" 
              className="h-full"
              style={{ display: activeTab === "custom" ? "block" : "none", paddingTop: 0 }}
            >
              <div className="pt-0 mt-0 custom-scrollbar overflow-y-auto max-h-[calc(70vh-200px)]">
                <div className="space-y-4 pb-2">
                  <div>
                    <h3 className="text-base font-medium">QR Code Details</h3>
                    <p className="text-sm text-muted-foreground">Your QR codes will be generated with high resolution and available for download immediately after purchase.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium">Usage Information</h3>
                    <p className="text-sm text-muted-foreground">All QR codes include unlimited scans, analytics tracking, and are valid for lifetime use with no subscription required.</p>
                  </div>
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-medium">Number of QR Codes</p>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={decrementQrCount}
                        disabled={customQrCount <= 50}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number" 
                        className="w-20 text-center" 
                        value={customQrCount}
                        onChange={(e) => setCustomQrCount(Math.max(50, parseInt(e.target.value) || 50))}
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={incrementQrCount}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <span>Price per QR code:</span>
                      <span>$0.50</span>
                    </div>
                    
                    {customQrCount >= 500 && (
                      <div className="flex justify-between text-green-600 mt-1">
                        <span>Volume discount:</span>
                        <span>-{customQrCount >= 5000 ? "25" : customQrCount >= 1000 ? "15" : "10"}%</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>${calculatePrice()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="border-t flex-shrink-0 p-3 sm:p-4 bg-background/95 backdrop-blur-sm sticky bottom-0">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => alert("Contact support at support@vidalsigns.com")} 
              className="flex items-center gap-1 h-8 text-xs"
              size="sm"
            >
              <HelpCircle className="h-4 w-4" />
              Need Help?
            </Button>
            <div className="text-base sm:text-lg font-bold ml-auto">
              Total: ${calculatePrice()}
            </div>
          </div>
          
          <DialogFooter className="p-0 flex-wrap">
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto justify-end">
              <Button variant="outline" onClick={onClose} size="sm" className="h-9">
                Cancel
              </Button>
              <Button 
                disabled={activeTab === "packages" && !selectedPackage}
                onClick={handlePurchase}
                size="sm"
                className="h-9"
              >
                Proceed to Payment
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRPurchaseModal; 