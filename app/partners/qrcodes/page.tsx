'use client';

import React, { useState, useEffect } from "react";
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
import { MoreHorizontal, Download, Eye, Trash2, Plus, History, Link, Copy, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
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
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [qrCodes, setQrCodes] = useState([]);
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
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Default partner ID - in a real app this would come from auth context
  const partnerId = "686aa71d7848ed9baed37c7f";

  // Function to fetch secure links with pagination
  const fetchSecureLinks = async (page: number = 1, status: string = 'all', showLoading: boolean = true) => {
    if (showLoading) setLoading(true);
    setError(null);
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
      setError((err as Error).message || 'Failed to fetch secure links');
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  
  // Function to fetch payment history
  const fetchPaymentHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`/api/payment-history?partnerId=${partnerId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch payment history');
      setPaymentHistory(data.payments || []);
    } catch (err) {
      setHistoryError((err as Error).message || 'Failed to fetch payment history');
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

  // Check for success URL parameters
  useEffect(() => {
    const url = new URL(window.location.href);
    const qrSuccess = url.searchParams.get('qrsuccess');
    const count = url.searchParams.get('count');
    const packageName = url.searchParams.get('package');
    const transactionId = url.searchParams.get('transaction') || Date.now().toString();
    const amount = url.searchParams.get('amount');
    
    // Immediately remove query parameters to prevent duplicate generation on refresh
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

  useEffect(() => {
    fetchSecureLinks(1, activeTab, true);
    fetchPaymentHistory();
  }, [partnerId]);

  // Auto-refresh every 30 seconds to get real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSecureLinks(1, activeTab, false); // Don't show loading for auto-refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

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
    // Here you would implement the actual purchase logic
    console.log(`Purchased: ${packageName || 'Custom'} - ${count} QR codes for $${price}`);
    // Add API call or other logic as needed
  };

  const generateSecureLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Generate a unique chat ID for this session
      const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/generate-secure-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          chatId,
          expiryHours: 24, // 24 hours expiry
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate secure link');
      }

      // Copy the link to clipboard
      await navigator.clipboard.writeText(data.secureUrl);
      
      toast.success("Secure link generated!", {
        description: "The secure link has been copied to your clipboard.",
      });

      console.log("Generated secure link:", data.secureUrl);
      
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
        console.error('QR canvas element not found:', `qr-canvas-${row.id}`);
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
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading QR codes...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>QR Code ID / Link ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No QR codes or secure links found for this tab.
                        </TableCell>
                      </TableRow>
                    ) : (
                      combinedRows.map((row: any) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.type}</TableCell>
                          <TableCell className="font-medium">{row.id}</TableCell>
                          <TableCell>{row.customerName}</TableCell>
                          <TableCell>{row.assignedDate ? new Date(row.assignedDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                row.redeemed ? "secondary" : 
                                row.scanned ? "default" : 
                                "outline"
                              }
                              className={
                                row.redeemed ? "bg-gray-200 text-gray-700" : 
                                !row.scanned ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""
                              }
                            >
                              {row.status}
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
                                <DropdownMenuItem className="flex items-center gap-2" onClick={() => { setSelectedRow(row); setDetailsOpen(true); }}>
                                  <Eye className="h-4 w-4" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleDownloadQRCode(row)}>
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
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
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
                        Previous
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                          if (pageNum > pagination.totalPages) return null;
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === pagination.currentPage ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      <QRPurchaseModal 
        isOpen={isPurchaseOpen} 
        onClose={() => setIsPurchaseOpen(false)}
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
          {historyLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payment history...</div>
          ) : historyError ? (
            <div className="text-center py-8 text-destructive">{historyError}</div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No purchase history available.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>QR Codes</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment: any) => (
                    <TableRow key={payment.transactionId}>
                      <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.packageName}</TableCell>
                      <TableCell>{payment.count}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={payment.status === 'completed' ? 'default' : 'outline'}
                          className={
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            payment.status === 'refunded' ? 'bg-red-100 text-red-800' : ''
                          }
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-6">
              <table className="w-full border-separate border-spacing-0 bg-white rounded-lg shadow-sm overflow-hidden">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="font-semibold py-3 pr-4 text-right w-1/3 border-b border-gray-200 align-top">Type:</td>
                    <td className="py-3 pl-4 border-b border-gray-200 align-top">{selectedRow.type}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-3 pr-4 text-right border-b border-gray-200 align-top">ID:</td>
                    <td className="py-3 pl-4 border-b border-gray-200 align-top">{selectedRow.id}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="font-semibold py-3 pr-4 text-right border-b border-gray-200 align-top">Customer:</td>
                    <td className="py-3 pl-4 border-b border-gray-200 align-top">{selectedRow.customerName || '-'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-3 pr-4 text-right border-b border-gray-200 align-top">Assigned Date:</td>
                    <td className="py-3 pl-4 border-b border-gray-200 align-top">{selectedRow.assignedDate ? new Date(selectedRow.assignedDate).toLocaleString() : '-'}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="font-semibold py-3 pr-4 text-right border-b border-gray-200 align-top">Status:</td>
                    <td className="py-3 pl-4 border-b border-gray-200 align-top">{selectedRow.status}</td>
                  </tr>
                  {selectedRow.type === 'SecureLink' && (
                    <tr>
                      <td className="font-semibold py-3 pr-4 text-right align-top">Secure Link:</td>
                      <td className="py-3 pl-4 break-all">
                        <a href={getSecureLinkUrl(selectedRow)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{getSecureLinkUrl(selectedRow)}</a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {selectedRow.type === 'SecureLink' && (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <QRCodeCanvas
                      id={`qr-canvas-${selectedRow.id}`}
                      value={getSecureLinkUrl(selectedRow)}
                      size={180}
                      includeMargin={true}
                      level="H"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleDownloadQRCode(selectedRow)} size="sm">Download QR Code</Button>
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(getSecureLinkUrl(selectedRow));
                        toast.success('Link copied to clipboard');
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy Link
                    </Button>
                  </div>
                </div>
              )}
              {selectedRow.type === 'QRCode' && (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <QRCodeCanvas
                      id={`qr-canvas-${selectedRow.id}`}
                      value={selectedRow.id}
                      size={180}
                      includeMargin={true}
                      level="H"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                  <Button onClick={() => handleDownloadQRCode(selectedRow)} size="sm">Download QR Code</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
} 