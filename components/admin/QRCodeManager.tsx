'use client';

import React, { useState, FC } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Download, Eye } from "lucide-react";
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

// Import types and mock data
import { QRCodeBatch, QRCode, BATCH_STATUS_OPTIONS } from "@/data/schemas/qrCodeSchema";
import { partnersForQRCode, qrCodeBatches, qrCodesData } from "@/data/mock/qrcodes";

const QRCodeManager: FC = () => {
  const [newBatchDialogOpen, setNewBatchDialogOpen] = useState(false);
  const [editBatchDialogOpen, setEditBatchDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<QRCodeBatch | null>(null);
  const [batchQRCodes, setBatchQRCodes] = useState<QRCode[]>([]);
  const [batchSize, setBatchSize] = useState(100);
  const [selectedPartner, setSelectedPartner] = useState("");
  
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

  const handleViewBatch = (batch: QRCodeBatch) => {
    setSelectedBatch(batch);
    // Load QR codes for the selected batch
    const qrCodes = qrCodesData[batch.id] || [];
    setBatchQRCodes(qrCodes);
    setViewDialogOpen(true);
  };

  const handleBatchSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBatchSize(value);
  };

  const handleDownloadAll = () => {
    // In a real app, this would generate a CSV or Excel file with all QR codes
    alert("Downloading all QR code data...");
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>QR Code Batches</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search batches..." 
                className="pl-9 py-2 pr-4 bg-background border border-input rounded-md text-sm w-full h-10 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleDownloadAll}
                className="flex items-center gap-2 mr-2 h-10"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export ALL</span>
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                onClick={() => handleNewBatch()}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>New Batch</span>
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
                    <ResponsiveTableHead className="w-[120px]">Batch ID</ResponsiveTableHead>
                    <ResponsiveTableHead>Partner</ResponsiveTableHead>
                    <ResponsiveTableHead>Created</ResponsiveTableHead>
                    <ResponsiveTableHead>Total</ResponsiveTableHead>
                    <ResponsiveTableHead>Used</ResponsiveTableHead>
                    <ResponsiveTableHead>Status</ResponsiveTableHead>
                    <ResponsiveTableHead className="text-right">Actions</ResponsiveTableHead>
                  </ResponsiveTableRow>
                </ResponsiveTableHeader>
                <ResponsiveTableBody>
                  {qrCodeBatches.map((batch) => (
                    <ResponsiveTableRow key={batch.id}>
                      <ResponsiveTableCell className="font-medium">{batch.id}</ResponsiveTableCell>
                      <ResponsiveTableCell>{batch.partnerName}</ResponsiveTableCell>
                      <ResponsiveTableCell>{batch.created}</ResponsiveTableCell>
                      <ResponsiveTableCell>{batch.total}</ResponsiveTableCell>
                      <ResponsiveTableCell>{batch.used}</ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          batch.status === 'active' ? 'bg-green-100 text-green-800' :
                          batch.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          batch.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {batch.status}
                        </span>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="text-right" data-th="Actions">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleNewBatch(batch)}
                            className="h-8"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewBatch(batch)}
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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>View QR Codes in Batch {selectedBatch?.id}</DialogTitle>
            <DialogDescription>
              {selectedBatch?.partnerName} - {selectedBatch?.created}
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md mt-4">
            <div className="overflow-x-auto max-h-[400px]">
              <ResponsiveTable>
                <ResponsiveTableHeader>
                  <ResponsiveTableRow>
                    <ResponsiveTableHead>QR Code ID</ResponsiveTableHead>
                    <ResponsiveTableHead>Generated</ResponsiveTableHead>
                    <ResponsiveTableHead>Status</ResponsiveTableHead>
                    <ResponsiveTableHead>Used Date</ResponsiveTableHead>
                    <ResponsiveTableHead>Used By</ResponsiveTableHead>
                  </ResponsiveTableRow>
                </ResponsiveTableHeader>
                <ResponsiveTableBody>
                  {batchQRCodes.map((qrCode) => (
                    <ResponsiveTableRow key={qrCode.id}>
                      <ResponsiveTableCell className="font-medium">{qrCode.id}</ResponsiveTableCell>
                      <ResponsiveTableCell>{qrCode.generated}</ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          qrCode.used ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {qrCode.used ? 'Used' : 'Available'}
                        </span>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>{qrCode.usedDate || '-'}</ResponsiveTableCell>
                      <ResponsiveTableCell>{qrCode.usedBy || '-'}</ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ))}
                  {batchQRCodes.length === 0 && (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell colSpan={5} className="h-24 text-center">
                        No QR code details available for this batch
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )}
                </ResponsiveTableBody>
              </ResponsiveTable>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="mr-auto">
              <Download className="h-4 w-4 mr-2" />
              Export QR Codes
            </Button>
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