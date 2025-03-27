'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, Eye, Trash2, Plus, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QRPurchaseModal from "@/components/partners/QRPurchaseModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Import centralized data
import { qrPurchases } from "@/data/mock/partnerUsers";
import { qrCodes } from "@/data/mock/qrcodes";

export default function QRCodesPage() {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Default partner ID - in a real app this would come from auth context
  const partnerId = "P-001";

  // Get QR codes assigned to customers for this partner
  const partnerQrCodes = qrCodes
    .filter(code => code.partnerId === partnerId && code.assigned)
    .slice(0, 8); // Show only first few for demo

  const handlePurchase = (packageName: string | null, count: number, price: number) => {
    // Here you would implement the actual purchase logic
    console.log(`Purchased: ${packageName || 'Custom'} - ${count} QR codes for $${price}`);
    // Add API call or other logic as needed
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex justify-end mb-4 gap-2">
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsHistoryOpen(true)}
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Purchase History</span>
        </Button>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsPurchaseOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Buy New Batch</span>
        </Button>
      </div>
     
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your QR Code Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR Code ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerQrCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.id}</TableCell>
                    <TableCell>{code.customerName}</TableCell>
                    <TableCell>{code.assignedDate ? new Date(code.assignedDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          code.redeemed ? "secondary" : 
                          code.scanned ? "default" : 
                          "outline"
                        }
                        className={
                          code.redeemed ? "bg-gray-200 text-gray-700" : 
                          !code.scanned ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""
                        }
                      >
                        {code.redeemed ? "Redeemed" : code.scanned ? "Scanned" : "Not Used"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      <QRPurchaseModal 
        isOpen={isPurchaseOpen} 
        onClose={() => setIsPurchaseOpen(false)}
        onPurchase={handlePurchase}
      />

      {/* Purchase History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Purchase History</DialogTitle>
            <DialogDescription>
              Your QR code purchase history and transactions
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrPurchases
                  .filter(purchase => purchase.partnerId === partnerId)
                  .map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.id}</TableCell>
                    <TableCell>{purchase.packageName || "Custom"}</TableCell>
                    <TableCell>{purchase.count.toLocaleString()}</TableCell>
                    <TableCell>${purchase.price.toLocaleString()}</TableCell>
                    <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={purchase.status === "completed" ? "default" : "outline"}
                        className={purchase.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                      >
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 