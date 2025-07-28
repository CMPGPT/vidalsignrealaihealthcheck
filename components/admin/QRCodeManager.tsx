'use client';

import React, { useState, FC, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Download, Eye, CheckCircle, Clock } from "lucide-react";
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
      if (res.ok) {
        setViewLinks(json.links);
      } else {
        setViewError(json.error || 'Failed to load secure links');
        setViewLinks([]);
      }
    } catch (e) {
      setViewError('Failed to load secure links');
      setViewLinks([]);
    }
    setViewLoading(false);
  };

  const handleBatchSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBatchSize(value);
  };

  const handleDownloadAll = () => {
    // In a real app, this would generate a CSV or Excel file with all QR codes
    alert("Downloading all QR code data...");
  };

  const { data, error } = useSWR('/api/admin/payment-history', fetcher);

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
    if (!filteredLinks.length) return;
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
  };

  // Export filtered main table as CSV
  const handleExportMainCSV = () => {
    if (!filteredBatches.length) return;
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
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>QR Code Batches</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search batches..." 
                value={mainSearchTerm}
                onChange={e => setMainSearchTerm(e.target.value)}
                className="pl-9 py-2 pr-4 bg-background border border-input rounded-md text-sm w-full h-10 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative flex items-center">
              <button
                className="flex items-center justify-center h-10 w-10 rounded-md border border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))]/60 shadow-sm transition-all duration-150 focus:outline-none"
                onClick={() => setFilterOpen(v => !v)}
                aria-label="Filter"
                type="button"
              >
                <Filter className="h-4 w-4" />
              </button>
              {/* Filter popover */}
              <div
                ref={filterRef}
                className={`absolute right-0 top-12 z-20 min-w-[200px] bg-white border border-[hsl(var(--border))] rounded-xl shadow-lg p-4 flex flex-col gap-2 transition-all duration-200 ${filterOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              >
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${mainStatusFilter === 'all' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] scale-105' : 'bg-white border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/60'}`}
                  onClick={() => { setMainStatusFilter('all'); setFilterOpen(false); }}
                >All</button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${mainStatusFilter === 'completed' ? 'bg-green-600 text-white border-green-600 scale-105' : 'bg-white border-[hsl(var(--border))] text-green-700 hover:bg-green-50'}`}
                  onClick={() => { setMainStatusFilter('completed'); setFilterOpen(false); }}
                >Completed</button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${mainStatusFilter === 'pending' ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white border-[hsl(var(--border))] text-blue-700 hover:bg-blue-50'}`}
                  onClick={() => { setMainStatusFilter('pending'); setFilterOpen(false); }}
                >Pending</button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${mainStatusFilter === 'failed' ? 'bg-red-600 text-white border-red-600 scale-105' : 'bg-white border-[hsl(var(--border))] text-red-700 hover:bg-red-50'}`}
                  onClick={() => { setMainStatusFilter('failed'); setFilterOpen(false); }}
                >Failed</button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleExportMainCSV}
                className="flex items-center gap-2 mr-2 h-10"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export ALL</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="overflow-x-auto">
              <ResponsiveTable>
                <ResponsiveTableHeader>
                  <ResponsiveTableRow>
                    <ResponsiveTableHead>Package Name</ResponsiveTableHead>
                    <ResponsiveTableHead>Count</ResponsiveTableHead>
                    <ResponsiveTableHead>Amount</ResponsiveTableHead>
                    <ResponsiveTableHead>Status</ResponsiveTableHead>
                    <ResponsiveTableHead>Currency</ResponsiveTableHead>
                    <ResponsiveTableHead>Payment Method</ResponsiveTableHead>
                    <ResponsiveTableHead>Payment Date</ResponsiveTableHead>
                    <ResponsiveTableHead className="text-right">Actions</ResponsiveTableHead>
                  </ResponsiveTableRow>
                </ResponsiveTableHeader>
                <ResponsiveTableBody>
                  {error && (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell colSpan={8} className="text-center text-red-500">Failed to load batches.</ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )}
                  {!data && !error && (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell colSpan={8} className="text-center">Loading...</ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )}
                  {data && filteredBatches.length === 0 && (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell colSpan={8} className="text-center">No batches found.</ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )}
                  {data && filteredBatches.map((row: any, idx: number) => (
                    <ResponsiveTableRow key={row.transactionId || idx}>
                      <ResponsiveTableCell className="font-medium">{row.packageName}</ResponsiveTableCell>
                      <ResponsiveTableCell>{row.count}</ResponsiveTableCell>
                      <ResponsiveTableCell>{row.amount}</ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          row.status === 'completed' ? 'bg-green-100 text-green-800' :
                          row.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          row.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {row.status}
                        </span>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>{row.currency?.toUpperCase()}</ResponsiveTableCell>
                      <ResponsiveTableCell>{row.paymentMethod}</ResponsiveTableCell>
                      <ResponsiveTableCell>{row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : '-'}</ResponsiveTableCell>
                      <ResponsiveTableCell className="text-right" data-th="Actions">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewBatch(row)}
                            className="h-8"
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
        <DialogContent className="sm:max-w-[700px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');`}</style>
          <DialogHeader>
            <DialogTitle>View Secure Links for Batch</DialogTitle>
            <DialogDescription>
              Buyer: {selectedBatch?.partnerId || '-'}<br />
              Payment Date: {selectedBatch && (selectedBatch as any).paymentDate ? new Date((selectedBatch as any).paymentDate).toLocaleString() : '-'}
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[hsl(var(--muted))]/40 rounded-xl px-4 py-3 shadow-sm border border-[hsl(var(--border))]">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-base font-semibold text-[hsl(var(--foreground))]">Total: <span className="font-bold text-lg">{viewLinks.length}</span></span>
                <span className="flex items-center gap-1 text-base font-semibold text-green-700"><CheckCircle className="w-4 h-4 text-green-600" /> Used: <span className="font-bold text-lg">{usedCount}</span></span>
                <span className="flex items-center gap-1 text-base font-semibold text-blue-700"><Clock className="w-4 h-4 text-blue-600" /> Unused: <span className="font-bold text-lg">{unusedCount}</span></span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by Link ID or Date..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-full border border-[hsl(var(--border))] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                  />
                </div>
                <div className="flex gap-2 mt-2 md:mt-0 border-t md:border-t-0 md:border-l border-[hsl(var(--border))] md:pl-4 pt-2 md:pt-0">
                  <button
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all duration-150 focus:outline-none ${viewFilter === 'all' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] scale-105' : 'bg-white border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/60'}`}
                    onClick={() => setViewFilter('all')}
                  >All</button>
                  <button
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all duration-150 focus:outline-none flex items-center gap-1 ${viewFilter === 'used' ? 'bg-green-600 text-white border-green-600 scale-105' : 'bg-white border-[hsl(var(--border))] text-green-700 hover:bg-green-50'}`}
                    onClick={() => setViewFilter('used')}
                  ><CheckCircle className="w-4 h-4" />Used</button>
                  <button
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all duration-150 focus:outline-none flex items-center gap-1 ${viewFilter === 'unused' ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white border-[hsl(var(--border))] text-blue-700 hover:bg-blue-50'}`}
                    onClick={() => setViewFilter('unused')}
                  ><Clock className="w-4 h-4" />Unused</button>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all duration-150 focus:outline-none bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] hover:scale-105 ml-0 md:ml-2"
                  onClick={handleExportCSV}
                  title="Export all as CSV"
                >
                  <Download className="w-4 h-4" /> Export All
                </button>
              </div>
            </div>
          </div>
          <div className="border rounded-xl mt-4 bg-[hsl(var(--card))]">
            <div className="overflow-x-auto max-h-[400px]">
              {viewLoading && <div className="p-4 text-center">Loading...</div>}
              {viewError && <div className="p-4 text-center text-red-500">{viewError}</div>}
              {!viewLoading && !viewError && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                      <TableHead className="font-semibold text-sm py-3 px-4 border-b border-[hsl(var(--border))]">#</TableHead>
                      <TableHead className="font-semibold text-sm py-3 px-4 border-b border-[hsl(var(--border))]">Link ID</TableHead>
                      <TableHead className="font-semibold text-sm py-3 px-4 border-b border-[hsl(var(--border))]">Used</TableHead>
                      <TableHead className="font-semibold text-sm py-3 px-4 border-b border-[hsl(var(--border))]">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLinks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6">No secure links found.</TableCell>
                      </TableRow>
                    )}
                    {filteredLinks.map((link: any, idx: number) => (
                      <TableRow key={link.linkId} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/60 transition-colors">
                        <TableCell className="py-3 px-4">{idx + 1}</TableCell>
                        <TableCell className="py-3 px-4">{link.linkId}</TableCell>
                        <TableCell className="py-3 px-4">
                          {link.isUsed ? (
                            <span className="px-3 py-1 rounded-full bg-[hsl(var(--primary))] text-xs font-medium text-[hsl(var(--primary-foreground))] border border-[hsl(var(--primary))]">Yes</span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-[hsl(var(--muted))] text-xs font-medium text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">No</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4">{link.createdAt ? new Date(link.createdAt).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRCodeManager; 