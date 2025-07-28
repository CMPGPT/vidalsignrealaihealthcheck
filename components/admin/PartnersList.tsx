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
import { PARTNER_TYPES } from "@/data/schemas/partnerSchema";
import mockPartners from "@/data/mock/partners";
import useSWR from 'swr';
import { doubleDecrypt } from '@/lib/encryption';

// Update PartnerWithMongoId type to include totalQRCodes and redeemed
type PartnerWithMongoId = {
  mongo_id?: string;
  id: string;
  name: string;
  email: string;
  totalQRCodes: number;
  redeemed: number;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  tier: 'basic' | 'premium' | 'enterprise';
};

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
const TableRow = memo(({ partner, onEdit }: { partner: PartnerWithMongoId; onEdit: (partner: PartnerWithMongoId) => void }) => (
  <ResponsiveTableRow>
    <ResponsiveTableCell className="font-mono text-xs">
      <span className="inline-block rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-3 py-1 text-xs font-mono font-semibold">
        {partner.mongo_id}
      </span>
    </ResponsiveTableCell>
    <ResponsiveTableCell className="font-medium">{partner.id}</ResponsiveTableCell>
    <ResponsiveTableCell>{partner.name}</ResponsiveTableCell>
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

const fetcher = (url: string) => fetch(url).then(res => res.json());

const PartnersList: FC = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addPartnerDialogOpen, setAddPartnerDialogOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    id: '',
    name: '',
    email: '',
  });

  // Fetch real partner users
  const { data, error } = useSWR('/api/admin/partner-users', fetcher);
  const users = data?.users || [];

  console.log(users);

  const handleEditPartner = useCallback((partner: PartnerWithMongoId) => {
    setPartnerForm({
      id: partner.id,
      name: partner.name,
      email: partner.email,
    });
    setEditDialogOpen(true);
  }, []);

  const handleAddPartner = () => {
    setPartnerForm({
      id: `P-${String(mockPartners.length + 1).padStart(3, '0')}`,
      name: "",
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
    });
  };

  const handleDownloadAll = () => {
    // In a real app, this would generate a CSV or Excel file with all partners
    alert("Downloading all partners data...");
  };

  // Memoize the table headers
  const tableHeaders = useMemo(() => (
    <TableHeader>
      <ResponsiveTableHead>ID</ResponsiveTableHead>
      <ResponsiveTableHead>Partner ID</ResponsiveTableHead>
      <ResponsiveTableHead>Name</ResponsiveTableHead>
      <ResponsiveTableHead>Email</ResponsiveTableHead>
      <ResponsiveTableHead>Total QR Codes</ResponsiveTableHead>
      <ResponsiveTableHead>Redeemed</ResponsiveTableHead>
      <ResponsiveTableHead className="text-center">Actions</ResponsiveTableHead>
    </TableHeader>
  ), []);

  // Memoize the table rows
  const tableRows = useMemo(() => (
    users.map((partner: any, idx: number) => {
      let orgName = partner.organization_name;
      let email = partner.email;
      let firstName = partner.first_Name;
      let lastName = partner.last_Name;
      let state = partner.state;
      let city = partner.city;
      let website = partner.website_link;
      let phone = partner.phone;
      let address = partner.business_address;
      let zip = partner.zip;
      try { orgName = doubleDecrypt(orgName); } catch {}
      try { email = doubleDecrypt(email); } catch {}
      try { firstName = doubleDecrypt(firstName); } catch {}
      try { lastName = doubleDecrypt(lastName); } catch {}
      try { state = doubleDecrypt(state); } catch {}
      try { city = doubleDecrypt(city); } catch {}
      try { website = doubleDecrypt(website); } catch {}
      try { phone = doubleDecrypt(phone); } catch {}
      try { address = doubleDecrypt(address); } catch {}
      try { zip = doubleDecrypt(zip); } catch {}
      return (
        <TableRow 
          key={partner.mongo_id || partner._id || partner.unique_id} 
          partner={{
            mongo_id: partner.mongo_id,
            id: `Partner - AP${String(idx + 1).padStart(2, '0')}`,
            name: orgName || (firstName + ' ' + lastName),
            email: email,
            totalQRCodes: partner.totalQRCodes,
            redeemed: partner.redeemed,
            status: 'active',
            joinDate: partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : '-',
            tier: 'basic',
          }} 
          onEdit={handleEditPartner}
        />
      );
    })
  ), [users, handleEditPartner]);

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
                {error && (
                  <ResponsiveTableRow>
                    <ResponsiveTableCell colSpan={7} className="text-center text-red-500">Failed to load partner users.</ResponsiveTableCell>
                  </ResponsiveTableRow>
                )}
                {!data && !error && (
                  <ResponsiveTableRow>
                    <ResponsiveTableCell colSpan={7} className="text-center">Loading...</ResponsiveTableCell>
                  </ResponsiveTableRow>
                )}
                {users.length === 0 && data && (
                  <ResponsiveTableRow>
                    <ResponsiveTableCell colSpan={7} className="text-center">No partner users found.</ResponsiveTableCell>
                  </ResponsiveTableRow>
                )}
                {tableRows}
              </ResponsiveTableBody>
            </ResponsiveTable>
          </div>
        </div>
        {/* Add/Edit dialogs remain as placeholders for now */}
      </CardContent>
    </Card>
  );
};

export default PartnersList; 