'use client';

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell
} from "@/components/ui/responsive-table";
import { 
  Search, 
  Plus, 
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

// Dummy data for patients
const patients = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    address: "123 Main St, Anytown, CA 12345",
    reportsCount: 5,
    lastReport: "2023-05-10"
  },
  {
    id: 2,
    name: "Robert Smith",
    email: "robert.smith@example.com",
    address: "456 Oak Ave, Somewhere, CA 54321",
    reportsCount: 3,
    lastReport: "2023-05-01"
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    email: "elena.r@example.com",
    address: "789 Pine Rd, Elsewhere, CA 67890",
    reportsCount: 2,
    lastReport: "2023-04-22"
  },
  {
    id: 4,
    name: "Michael Wong",
    email: "michael.w@example.com",
    address: "321 Cedar Blvd, Nowhere, CA 45678",
    reportsCount: 7,
    lastReport: "2023-05-15"
  },
  {
    id: 5,
    name: "Sarah Miller",
    email: "sarah.m@example.com",
    address: "654 Birch St, Anywhere, CA 98765",
    reportsCount: 1,
    lastReport: "2023-04-30"
  },
  {
    id: 6,
    name: "David Chen",
    email: "david.c@example.com",
    address: "987 Maple Dr, Someplace, CA 13579",
    reportsCount: 4,
    lastReport: "2023-05-05"
  }
];

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patients);
  
  // Update filtered patients when search query changes
  React.useEffect(() => {
    const filtered = patients.filter(patient => 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchQuery]);
  
  const viewPatient = React.useCallback((patientId: number) => {
    // TODO: Implement patient view functionality
    console.log(`Viewing patient ${patientId}`);
  }, []);

  const sendReport = React.useCallback((patientId: number) => {
    // TODO: Implement report sending functionality
    console.log(`Sending report to patient ${patientId}`);
  }, []);

  const formatDate = React.useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold py-4 sm:py-3">Patients</h1>
        
        <Button className="hover:bg-primary/90 active:bg-accent active:text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hover:border-primary/30 hover:text-primary active:bg-accent active:text-accent-foreground">
              Sort by
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
            <DropdownMenuItem>Most Reports</DropdownMenuItem>
            <DropdownMenuItem>Recent Reports</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <GlassCard className="p-0 overflow-hidden border-0 shadow-none">
        <ResponsiveTable>
          <ResponsiveTableHeader>
            <ResponsiveTableRow>
              <ResponsiveTableHead>Name</ResponsiveTableHead>
              <ResponsiveTableHead>Email</ResponsiveTableHead>
              <ResponsiveTableHead className="hidden md:table-cell">Address</ResponsiveTableHead>
              <ResponsiveTableHead>Reports</ResponsiveTableHead>
              <ResponsiveTableHead>Last Report</ResponsiveTableHead>
              <ResponsiveTableHead className="text-right">Actions</ResponsiveTableHead>
            </ResponsiveTableRow>
          </ResponsiveTableHeader>
          <ResponsiveTableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <ResponsiveTableRow key={patient.id}>
                  <ResponsiveTableCell className="font-medium">{patient.name}</ResponsiveTableCell>
                  <ResponsiveTableCell className="max-w-[200px] truncate md:break-all">{patient.email}</ResponsiveTableCell>
                  <ResponsiveTableCell className="hidden md:table-cell max-w-[200px] truncate md:break-all">{patient.address}</ResponsiveTableCell>
                  <ResponsiveTableCell>{patient.reportsCount}</ResponsiveTableCell>
                  <ResponsiveTableCell>{formatDate(patient.lastReport)}</ResponsiveTableCell>
                  <ResponsiveTableCell className="text-right" data-th="Actions">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => viewPatient(patient.id)}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => sendReport(patient.id)}>
                        Send Report
                      </Button>
                    </div>
                  </ResponsiveTableCell>
                </ResponsiveTableRow>
              ))
            ) : (
              <ResponsiveTableRow>
                <ResponsiveTableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No patients found matching your search
                </ResponsiveTableCell>
              </ResponsiveTableRow>
            )}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </GlassCard>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPatients.length} of {patients.length} patients
        </p>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-primary/5 border-primary">
            1
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 