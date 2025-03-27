'use client';

// PartnersList component for admin dashboard
import React, { useState, useMemo, memo, FC, useCallback } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Download } from "lucide-react";
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
import { Partner, PARTNER_TYPES } from "@/data/schemas/partnerSchema";
import mockPartners from "@/data/mock/partners";

// Memoize the table header component
const TableHeader = memo(({ children }: { children: React.ReactNode }) => (
  <ResponsiveTableHeader>
    <ResponsiveTableRow>
      {children}
    </ResponsiveTableRow>
  </ResponsiveTableHeader>
));
TableHeader.displayName = "TableHeader";

// Memoize the table row component
const TableRow = memo(({ partner, onEdit }: { partner: Partner; onEdit: (partner: Partner) => void }) => (
  <ResponsiveTableRow>
    <ResponsiveTableCell className="font-medium">{partner.id}</ResponsiveTableCell>
    <ResponsiveTableCell>{partner.name}</ResponsiveTableCell>
    <ResponsiveTableCell>{partner.type}</ResponsiveTableCell>
    <ResponsiveTableCell className="max-w-[200px] truncate md:break-all">{partner.email}</ResponsiveTableCell>
    <ResponsiveTableCell>{partner.totalQRCodes}</ResponsiveTableCell>
    <ResponsiveTableCell>{partner.redeemed}</ResponsiveTableCell>
    <ResponsiveTableCell className="text-right" data-th="Actions">
      <div className="flex justify-end gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(partner)}
          className="flex items-center justify-center min-w-[80px]"
        >
          Edit
        </Button>
      </div>
    </ResponsiveTableCell>
  </ResponsiveTableRow>
));
TableRow.displayName = "TableRow";

const PartnersList: FC = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addPartnerDialogOpen, setAddPartnerDialogOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    id: "",
    name: "",
    type: "",
    email: "",
  });

  const handleEditPartner = useCallback((partner: Partner) => {
    setPartnerForm({
      id: partner.id,
      name: partner.name,
      type: partner.type || "",
      email: partner.email,
    });
    setEditDialogOpen(true);
  }, []);

  const handleAddPartner = () => {
    setPartnerForm({
      id: `P-${String(mockPartners.length + 1).padStart(3, '0')}`,
      name: "",
      type: "",
      email: "",
    });
    setAddPartnerDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartnerForm({
      ...partnerForm,
      [name]: value,
    });
  };

  const handleTypeChange = (value: string) => {
    setPartnerForm({
      ...partnerForm,
      type: value,
    });
  };

  const handleDownloadAll = () => {
    // In a real app, this would generate a CSV or Excel file with all partners
    alert("Downloading all partners data...");
  };

  // Memoize the table headers
  const tableHeaders = useMemo(() => (
    <TableHeader>
      <ResponsiveTableHead>Partner ID</ResponsiveTableHead>
      <ResponsiveTableHead>Name</ResponsiveTableHead>
      <ResponsiveTableHead>Type</ResponsiveTableHead>
      <ResponsiveTableHead>Email</ResponsiveTableHead>
      <ResponsiveTableHead>Total QR Codes</ResponsiveTableHead>
      <ResponsiveTableHead>Redeemed</ResponsiveTableHead>
      <ResponsiveTableHead className="text-center">Actions</ResponsiveTableHead>
    </TableHeader>
  ), []);

  // Memoize the table rows
  const tableRows = useMemo(() => (
    mockPartners.map((partner) => (
      <TableRow 
        key={partner.id} 
        partner={partner} 
        onEdit={handleEditPartner}
      />
    ))
  ), [handleEditPartner]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Partner Management</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search partners..." 
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
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-10"
              onClick={handleAddPartner}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Partner</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <div className="overflow-x-auto">
            <ResponsiveTable>
              {tableHeaders}
              <ResponsiveTableBody>
                {tableRows}
              </ResponsiveTableBody>
            </ResponsiveTable>
          </div>
        </div>
        
        {/* Add Partner Dialog */}
        <Dialog open={addPartnerDialogOpen} onOpenChange={setAddPartnerDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
              <DialogDescription>
                Enter the details for the new partner. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="id" className="text-right text-sm font-medium">ID</label>
                <div className="col-span-3">
                  <input
                    id="id"
                    name="id"
                    value={partnerForm.id}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
                <div className="col-span-3">
                  <input
                    id="name"
                    name="name"
                    value={partnerForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="type" className="text-right text-sm font-medium">Type</label>
                <div className="col-span-3">
                  <Select onValueChange={handleTypeChange} value={partnerForm.type}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select partner type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNER_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right text-sm font-medium">Email</label>
                <div className="col-span-3">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={partnerForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Partner</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Partner Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Partner</DialogTitle>
              <DialogDescription>
                Update the partner details. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-id" className="text-right text-sm font-medium">ID</label>
                <div className="col-span-3">
                  <input
                    id="edit-id"
                    name="id"
                    value={partnerForm.id}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-name" className="text-right text-sm font-medium">Name</label>
                <div className="col-span-3">
                  <input
                    id="edit-name"
                    name="name"
                    value={partnerForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-type" className="text-right text-sm font-medium">Type</label>
                <div className="col-span-3">
                  <Select onValueChange={handleTypeChange} value={partnerForm.type}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select partner type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNER_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-email" className="text-right text-sm font-medium">Email</label>
                <div className="col-span-3">
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={partnerForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PartnersList; 