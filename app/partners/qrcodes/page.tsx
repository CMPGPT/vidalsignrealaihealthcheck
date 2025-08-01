'use client';

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
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
import { MoreHorizontal, Download, Eye, Trash2, Plus, History, Link, Copy, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QRPurchaseModal from "@/components/partners/QRPurchaseModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import { QRCodeCanvas } from 'qrcode.react';

const TABS = [
  { key: 'all', label: 'All QR Codes' },
  { key: 'used', label: 'Used QR' },
  { key: 'unused', label: 'Unused QR' },
  { key: 'sold', label: 'Sold' },
  { key: 'unsold', label: 'Unsold' },
];

interface Statistics {
  total: number;
  used: number;
  unused: number;
  sold: number;
  unsold: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function QRCodesPage() {
  const { data: session, status } = useSession();
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [secureLinks, setSecureLinks] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [statistics, setStatistics] = useState<Statistics>({ total: 0, used: 0, unused: 0, sold: 0, unsold: 0 });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Get partner ID from session (MongoDB _id)
  const partnerId = (session?.user as any)?.partnerId || null;

  // Function to fetch secure links with pagination
  const fetchSecureLinks = async (page: number = 1, status: string = 'all', showLoading: boolean = true) => {
    if (!partnerId) return;
    
    if (showLoading) setLoading(true);
    
    try {
      const params = new URLSearchParams({
        partnerId,
        page: page.toString(),
        limit: '10',
        status
      });
      
      const res = await fetch(`/api/securelinks?${params}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch secure links');
      
      setSecureLinks(data.secureLinks || []);
      setStatistics(data.statistics || { total: 0, used: 0, unused: 0, sold: 0, unsold: 0 });
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      });
    } catch (err) {
      console.error('Error fetching secure links:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  
  // Function to fetch payment history
  const fetchPaymentHistory = async () => {
    if (!partnerId) return;
    
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/payment-history?partnerId=${partnerId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch payment history');
      setPaymentHistory(data.payments || []);
    } catch (err) {
      console.error('Error fetching payment history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchSecureLinks(1, tab, true);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchSecureLinks(newPage, activeTab, false);
    }
  };

  // Load data when partnerId is available
  useEffect(() => {
    if (partnerId && status === 'authenticated') {
      fetchSecureLinks(1, activeTab, true);
      fetchPaymentHistory();
    }
  }, [partnerId, status]);

  // Check for payment success and generate QR codes
  useEffect(() => {
    if (!partnerId) return;
    
    const url = new URL(window.location.href);
    const qrSuccess = url.searchParams.get('qrsuccess');
    const count = url.searchParams.get('count');
    const packageName = url.searchParams.get('package');
    const transactionId = url.searchParams.get('transaction') || Date.now().toString();
    const amount = url.searchParams.get('amount');
    
    // Clean up URL parameters
    if (qrSuccess || count || packageName || url.searchParams.get('transaction') || amount) {
      url.searchParams.delete('qrsuccess');
      url.searchParams.delete('count');
      url.searchParams.delete('package');
      url.searchParams.delete('transaction');
      url.searchParams.delete('amount');
      window.history.replaceState({}, '', url.toString());
    }
    
    // Check if this transaction has already been processed
    const processedTransactions = JSON.parse(sessionStorage.getItem('processedQrTransactions') || '[]');
    
    if (qrSuccess === '1' && count && packageName && !processedTransactions.includes(transactionId)) {
      // Generate secure links after successful payment
      const generateSecureLinksBatch = async () => {
        try {
          const response = await fetch('/api/generate-secure-links-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              partnerId,
              count: parseInt(count),
              transactionId,
              packageName,
              amount: amount ? parseFloat(amount) : undefined
            }),
          });

          const data = await response.json();

          if (response.ok) {
            // Add this transaction to processed list to prevent duplicate generation
            processedTransactions.push(transactionId);
            sessionStorage.setItem('processedQrTransactions', JSON.stringify(processedTransactions));
            
            if (data.alreadyProcessed) {
              toast.info('Transaction already processed', {
                description: data.message,
              });
            } else {
              toast.success(`Payment successful!`, {
                description: `${data.count} QR codes have been generated for the ${packageName} package.`,
              });
            }
            
            // Refresh the links list
            fetchSecureLinks(1, activeTab, true);
            
            // Also fetch payment history
            fetchPaymentHistory();
          } else {
            toast.error('Failed to generate secure links', {
              description: data.error || 'An error occurred during link generation',
            });
          }
        } catch (error) {
          console.error('Error generating secure links batch:', error);
          toast.error('Failed to generate secure links', {
            description: error instanceof Error ? error.message : 'An error occurred',
          });
        }
      };

      generateSecureLinksBatch();
    }
  }, [partnerId, activeTab]);

  // Only show SecureLinks in the table
  const combinedRows = secureLinks.map((link: any) => ({
    type: 'SecureLink',
    id: link.linkId,
    customerName: link.metadata?.customerEmail || '',
    assignedDate: link.createdAt,
    status: link.isUsed ? 'Used' : (link.metadata?.sold ? 'Sold' : 'Not Used'),
    redeemed: link.isUsed,
    scanned: false,
    sold: link.metadata?.sold || false,
  }));

  const handlePurchase = (packageName: string | null, count: number, price: number) => {
    console.log(`Purchased: ${packageName || 'Custom'} - ${count} QR codes for $${price}`);
  };

  const generateSecureLink = async () => {
    if (!partnerId) {
      toast.error('Partner ID not available');
      return;
    }
    
    setIsGeneratingLink(true);
    try {
      const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/generate-secure-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId,
          chatId,
          expiryHours: 24,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate secure link');
      }

      await navigator.clipboard.writeText(data.secureUrl);
      
      toast.success("Secure link generated!", {
        description: "The secure link has been copied to your clipboard.",
      });
      
    } catch (error) {
      console.error('Error generating secure link:', error);
      toast.error("Failed to generate secure link", {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Helper to get secure link URL
  const getSecureLinkUrl = (row: any) => {
    if (row.type === 'SecureLink') {
      return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/secure/chat/${row.id}`;
    }
    return '';
  };

  // Download QR code as image
  const handleDownloadQRCode = (row: any) => {
    try {
      const canvas = document.getElementById(`qr-canvas-${row.id}`) as HTMLCanvasElement;
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${row.id}.png`;
        a.click();
      } else {
        toast.error('Could not download QR code', {
          description: 'The QR code image could not be generated.',
        });
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Could not download QR code', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the QR codes dashboard.</p>
          <a 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!partnerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner ID Not Found</h1>
          <p className="text-gray-600 mb-4">Unable to retrieve partner information from session.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Card className="flex-1 min-w-[180px]">
          <CardContent className="py-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{statistics.total}</span>
            <span className="text-muted-foreground text-xs">Total QR Codes</span>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[180px]">
          <CardContent className="py-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{statistics.used}</span>
            <span className="text-muted-foreground text-xs">Used QR Codes</span>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[180px]">
          <CardContent className="py-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{statistics.unused}</span>
            <span className="text-muted-foreground text-xs">Unused QR Codes</span>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[180px]">
          <CardContent className="py-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{statistics.sold}</span>
            <span className="text-muted-foreground text-xs">Sold QR Codes</span>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[180px]">
          <CardContent className="py-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{statistics.unsold}</span>
            <span className="text-muted-foreground text-xs">Unsold QR Codes</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            onClick={() => handleTabChange(tab.key)}
            className="rounded-full px-4"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mb-4 gap-2">
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => {
            fetchSecureLinks(1, activeTab, true);
            toast.success('Dashboard refreshed');
          }}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading QR codes...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QR Code ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedRows.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-sm">{row.id}</TableCell>
                      <TableCell>{row.customerName || 'Not assigned'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={row.status === 'Used' ? 'destructive' : row.status === 'Sold' ? 'default' : 'secondary'}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.assignedDate ? new Date(row.assignedDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(getSecureLinkUrl(row))}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadQRCode(row)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download QR
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      <QRPurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />

      {/* History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase History</DialogTitle>
            <DialogDescription>
              View all your QR code purchase transactions
            </DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading purchase history...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No purchase history found
                </p>
              ) : (
                paymentHistory.map((payment: any) => (
                  <Card key={payment.transactionId}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{payment.planName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {payment.customerEmail} • {payment.quantity} QR codes
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.transactionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${payment.totalAmount}</p>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
} 