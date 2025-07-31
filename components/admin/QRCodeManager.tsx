'use client';

import React, { useState, FC, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Download, Eye, CheckCircle, Clock, Loader2 } from "lucide-react";
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableHead,
  ResponsiveTableRow,
  ResponsiveTableCell
} from "@/components/ui/responsive-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

// Import types and mock data
import { QRCodeBatch, QRCode, BATCH_STATUS_OPTIONS } from "@/data/schemas/qrCodeSchema";
import { partnersForQRCode, qrCodeBatches, qrCodesData } from "@/data/mock/qrcodes";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const QRCodeManager: FC = () => {
  const [newBatchDialogOpen, setNewBatchDialogOpen] = useState(false);
  const [editBatchDialogOpen, setEditBatchDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<QRCodeBatch | null>(null);
  const [batchQRCodes, setBatchQRCodes] = useState<QRCode[]>([]);
  const [batchSize, setBatchSize] = useState(100);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [viewLinks, setViewLinks] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mainSearchTerm, setMainSearchTerm] = useState('');
  const [mainStatusFilter, setMainStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter popover when clicking outside
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterOpen]);
  
  const handleNewBatch = (batch: QRCodeBatch | null = null) => {
    if (batch) {
      setSelectedBatch(batch);
      setBatchSize(batch.total ?? 100);
      setEditBatchDialogOpen(true);
    } else {
      setSelectedBatch(null);
      setBatchSize(100);
      setSelectedPartner("");
      setNewBatchDialogOpen(true);
    }
  };

  const handleViewBatch = async (row: any) => {
    setViewLoading(true);
    setViewError(null);
    setSelectedBatch(row);
    setViewDialogOpen(true);
    
    try {
      const res = await fetch(`/api/admin/payment-securelinks?partnerId=${encodeURIComponent(row.partnerId)}&paymentDate=${encodeURIComponent(row.paymentDate)}`);
      const json = await res.json();
      
      if (res.ok && json.success) {
        setViewLinks(json.links || []);
        toast.success(`Loaded ${json.links?.length || 0} secure links`);
      } else {
        setViewError(json.error || 'Failed to load secure links');
        setViewLinks([]);
        toast.error(json.error || 'Failed to load secure links');
      }
    } catch (e) {
      setViewError('Failed to load secure links');
      setViewLinks([]);
      toast.error('Failed to load secure links');
    }
    setViewLoading(false);
  };

  const handleBatchSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBatchSize(value);
  };

  const handleDownloadAll = () => {
    toast.info("Downloading all QR code data...");
  };

  const { data, error, isLoading } = useSWR('/api/admin/payment-history', fetcher);

  // Filter main table data
  const filteredBatches = data && data.payments
    ? data.payments.filter((row: any) => {
        const term = mainSearchTerm.toLowerCase();
        const matchesStatus = mainStatusFilter === 'all' ? true : row.status === mainStatusFilter;
        return (
          matchesStatus && (
            row.packageName?.toLowerCase().includes(term) ||
            row.paymentMethod?.toLowerCase().includes(term) ||
            row.status?.toLowerCase().includes(term) ||
            row.currency?.toLowerCase().includes(term) ||
            (row.paymentDate && new Date(row.paymentDate).toLocaleString().toLowerCase().includes(term))
          )
        );
      })
    : [];

  // Filter secure links in dialog
  const filteredLinks = viewLinks.filter((link: any) => {
    const matchesFilter = viewFilter === 'all' ? true : viewFilter === 'used' ? link.isUsed : !link.isUsed;
    const matchesSearch =
      link.linkId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.createdAt && new Date(link.createdAt).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && (!searchTerm || matchesSearch);
  });
  const usedCount = viewLinks.filter(link => link.isUsed).length;
  const unusedCount = viewLinks.length - usedCount;

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredLinks.length) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Link ID', 'Used', 'Created At'];
    const rows = filteredLinks.map(link => [
      link.linkId,
      link.isUsed ? 'Yes' : 'No',
      link.createdAt ? new Date(link.createdAt).toLocaleString() : '-'
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secure-links.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  // Export filtered main table as CSV
  const handleExportMainCSV = () => {
    if (!filteredBatches.length) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Package Name', 'Count', 'Amount', 'Status', 'Currency', 'Payment Method', 'Payment Date'];
    const rows = filteredBatches.map((row: any) => [
      row.packageName,
      row.count,
      row.amount,
      row.status,
      row.currency?.toUpperCase(),
      row.paymentMethod,
      row.paymentDate ? new Date(row.paymentDate).toLocaleString() : '-'
    ]);
    const csvContent = [headers, ...rows].map((r: any[]) => r.map((field: any) => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code-batches.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-2xl font-bold text-gray-800">QR Code Batches</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search batches..." 
                value={mainSearchTerm}
                onChange={e => setMainSearchTerm(e.target.value)}
                className="pl-9 py-2 pr-4 bg-white border border-gray-300 rounded-lg text-sm w-full h-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <div className="relative flex items-center">
              <button
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
                onClick={() => setFilterOpen(v => !v)}
                aria-label="Filter"
                type="button"
              >
                <Filter className="h-4 w-4" />
              </button>
              {/* Filter popover */}
              <div
                ref={filterRef}
                className={`absolute right-0 top-12 z-20 min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex flex-col gap-2 transition-all duration-200 ${filterOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              >
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${mainStatusFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => { setMainStatusFilter('all'); setFilterOpen(false); }}
                >All</button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${mainStatusFilter === 'completed' ? 'bg-green-600 text-white border-green-600 scale-105' : 'bg-white border-gray-300 text-green-700 hover:bg-green-50'}`}
                  onClick={() => { setMainStatusFilter('completed'); setFilterOpen(false); }}
                >Completed</button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${mainStatusFilter === 'pending' ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white border-gray-300 text-blue-700 hover:bg-blue-50'}`}
                  onClick={() => { setMainStatusFilter('pending'); setFilterOpen(false); }}
                >Pending</button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${mainStatusFilter === 'failed' ? 'bg-red-600 text-white border-red-600 scale-105' : 'bg-white border-gray-300 text-red-700 hover:bg-red-50'}`}
                  onClick={() => { setMainStatusFilter('failed'); setFilterOpen(false); }}
                >Failed</button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleExportMainCSV}
                className="flex items-center gap-2 mr-2 h-10 bg-white hover:bg-gray-50 border-gray-300"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export ALL</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-0">
            <div className="overflow-x-auto">
              <ResponsiveTable>
                <ResponsiveTableHeader>
                  <ResponsiveTableRow className="bg-gray-50 border-b border-gray-200">
                    <ResponsiveTableHead className="font-semibold text-gray-700">Package Name</ResponsiveTableHead>
                    <ResponsiveTableHead className="font-semibold text-gray-700">Count</ResponsiveTableHead>
                    <ResponsiveTableHead className="font-semibold text-gray-700">Amount</ResponsiveTableHead>
                    <ResponsiveTableHead className="font-semibold text-gray-700">Status</ResponsiveTableHead>
                    <ResponsiveTableHead className="font-semibold text-gray-700">Currency</ResponsiveTableHead>
                    <ResponsiveTableHead className="font-semibold text-gray-700">Payment Method</ResponsiveTableHead>
                    <ResponsiveTableHead className="font-semibold text-gray-700">Payment Date</ResponsiveTableHead>
                    <ResponsiveTableHead className="text-right font-semibold text-gray-700">Actions</ResponsiveTableHead>
                  </ResponsiveTableRow>
                </ResponsiveTableHeader>
                <ResponsiveTableBody>
                  {isLoading && (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading batches...</span>
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )}
                  {error && (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell colSpan={8} className="text-center text-red-500 py-8">
                        <div className="flex items-center justify-center gap-2">
                          <span>Failed to load batches. Please try again.</span>
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )}
                  {!isLoading && !error && filteredBatches.length === 0 && (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No batches found.
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )}
                  {!isLoading && !error && filteredBatches.map((row: any, idx: number) => (
                    <ResponsiveTableRow key={row.transactionId || idx} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                      <ResponsiveTableCell className="font-medium text-gray-900">{row.packageName || 'N/A'}</ResponsiveTableCell>
                      <ResponsiveTableCell className="text-gray-700">{row.count || 0}</ResponsiveTableCell>
                      <ResponsiveTableCell className="text-gray-700">{row.amount || '0'}</ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          row.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                          row.status === 'pending' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          row.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {row.status || 'unknown'}
                        </span>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="text-gray-700 font-medium">{row.currency?.toUpperCase() || 'USD'}</ResponsiveTableCell>
                      <ResponsiveTableCell className="text-gray-700">{row.paymentMethod || 'N/A'}</ResponsiveTableCell>
                      <ResponsiveTableCell className="text-gray-700">{row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : '-'}</ResponsiveTableCell>
                      <ResponsiveTableCell className="text-right" data-th="Actions">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewBatch(row)}
                            className="h-8 bg-white hover:bg-gray-50 border-gray-300"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ))}
                </ResponsiveTableBody>
              </ResponsiveTable>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* New Batch Dialog */}
      <Dialog open={newBatchDialogOpen} onOpenChange={setNewBatchDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate New QR Code Batch</DialogTitle>
            <DialogDescription>
              Create a new batch of QR codes for a partner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="partner" className="text-right text-sm font-medium">Partner</label>
              <div className="col-span-3">
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnersForQRCode.map(partner => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="batch-size" className="text-right text-sm font-medium">Batch Size</label>
              <div className="col-span-3">
                <input
                  id="batch-size"
                  type="number"
                  value={batchSize}
                  onChange={handleBatchSizeChange}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Generate Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Batch Dialog */}
      <Dialog open={editBatchDialogOpen} onOpenChange={setEditBatchDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit QR Code Batch</DialogTitle>
            <DialogDescription>
              Update the batch details or status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-batch-id" className="text-right text-sm font-medium">Batch ID</label>
              <div className="col-span-3">
                <input
                  id="edit-batch-id"
                  value={selectedBatch?.id || ''}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-partner" className="text-right text-sm font-medium">Partner</label>
              <div className="col-span-3">
                <input
                  id="edit-partner"
                  value={selectedBatch?.partnerName || ''}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-batch-status" className="text-right text-sm font-medium">Status</label>
              <div className="col-span-3">
                <Select defaultValue={selectedBatch?.status || 'active'}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCH_STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-batch-size" className="text-right text-sm font-medium">Total QR Codes</label>
              <div className="col-span-3">
                <input
                  id="edit-batch-size"
                  type="number"
                  value={batchSize}
                  onChange={handleBatchSizeChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Only increase possible. Current used codes: {selectedBatch?.used || 0}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Update Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Batch Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900">View Secure Links for Batch</DialogTitle>
            <DialogDescription className="text-gray-600">
              <div className="flex flex-col gap-1 mt-2">
                <span><strong>Buyer:</strong> {selectedBatch?.partnerId || '-'}</span>
                <span><strong>Payment Date:</strong> {selectedBatch && (selectedBatch as any).paymentDate ? new Date((selectedBatch as any).paymentDate).toLocaleString() : '-'}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4 mt-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 shadow-sm border border-blue-200">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-base font-semibold text-gray-800">Total: <span className="font-bold text-lg text-blue-600">{viewLinks.length}</span></span>
                <span className="flex items-center gap-1 text-base font-semibold text-green-700">
                  <CheckCircle className="w-4 h-4 text-green-600" /> 
                  Used: <span className="font-bold text-lg">{usedCount}</span>
                </span>
                <span className="flex items-center gap-1 text-base font-semibold text-blue-700">
                  <Clock className="w-4 h-4 text-blue-600" /> 
                  Unused: <span className="font-bold text-lg">{unusedCount}</span>
                </span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 w-full lg:w-auto">
                <div className="relative w-full lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Link ID or Date..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div className="flex gap-2 mt-2 lg:mt-0 border-t lg:border-t-0 lg:border-l border-gray-300 lg:pl-4 pt-2 lg:pt-0">
                  <button
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${viewFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setViewFilter('all')}
                  >All</button>
                  <button
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all duration-150 focus:outline-none flex items-center gap-1 ${viewFilter === 'used' ? 'bg-green-600 text-white border-green-600 scale-105' : 'bg-white border-gray-300 text-green-700 hover:bg-green-50'}`}
                    onClick={() => setViewFilter('used')}
                  ><CheckCircle className="w-4 h-4" />Used</button>
                  <button
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all duration-150 focus:outline-none flex items-center gap-1 ${viewFilter === 'unused' ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white border-gray-300 text-blue-700 hover:bg-blue-50'}`}
                    onClick={() => setViewFilter('unused')}
                  ><Clock className="w-4 h-4" />Unused</button>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all duration-150 focus:outline-none bg-blue-600 text-white border-blue-600 hover:scale-105 ml-0 lg:ml-2"
                  onClick={handleExportCSV}
                  title="Export all as CSV"
                >
                  <Download className="w-4 h-4" /> Export All
                </button>
              </div>
            </div>
          </div>
          
          <div className="border rounded-xl bg-white overflow-hidden flex-1">
            <div className="overflow-x-auto max-h-[400px]">
              {viewLoading && (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading secure links...</span>
                  </div>
                </div>
              )}
              {viewError && (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <span className="font-medium">{viewError}</span>
                  </div>
                </div>
              )}
              {!viewLoading && !viewError && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700 py-3 px-4">#</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-3 px-4">Link ID</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-3 px-4">Used</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-3 px-4">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLinks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No secure links found.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredLinks.map((link: any, idx: number) => (
                      <TableRow key={link.linkId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <TableCell className="py-3 px-4 text-gray-700">{idx + 1}</TableCell>
                        <TableCell className="py-3 px-4 font-mono text-sm">{link.linkId}</TableCell>
                        <TableCell className="py-3 px-4">
                          {link.isUsed ? (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium border border-green-200">Yes</span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">No</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">{link.createdAt ? new Date(link.createdAt).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-4 border-t border-gray-200 pt-4">
            <DialogClose asChild>
              <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-300">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRCodeManager; 