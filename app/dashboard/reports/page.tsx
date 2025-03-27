'use client';

import { useState } from "react";
import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, MailOpen, Clock, Ban } from "lucide-react";
import { 
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell
} from "@/components/ui/responsive-table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dummy data for reports
const reports = [
  {
    id: "REP123456",
    patientName: "John Smith",
    email: "john.smith@example.com",
    sentDate: "2023-05-15T10:30:00",
    status: "opened",
    type: "Blood Test"
  },
  {
    id: "REP123457",
    patientName: "Emma Johnson",
    email: "emma.j@example.com",
    sentDate: "2023-05-15T09:15:00",
    status: "sent",
    type: "Cholesterol Panel"
  },
  {
    id: "REP123458",
    patientName: "Michael Brown",
    email: "michael.b@example.com",
    sentDate: "2023-05-14T15:45:00",
    status: "expired",
    type: "Complete Blood Count"
  },
  {
    id: "REP123459",
    patientName: "Sarah Wilson",
    email: "sarah.w@example.com",
    sentDate: "2023-05-14T11:20:00",
    status: "opened",
    type: "Liver Function"
  },
  {
    id: "REP123460",
    patientName: "David Lee",
    email: "david.lee@example.com",
    sentDate: "2023-05-13T14:10:00",
    status: "sent",
    type: "Thyroid Panel"
  },
  {
    id: "REP123461",
    patientName: "Jennifer Miller",
    email: "jen.miller@example.com",
    sentDate: "2023-05-12T16:30:00",
    status: "expired",
    type: "Metabolic Panel"
  }
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = !filterStatus || report.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "opened":
        return <MailOpen className="h-4 w-4 text-green-500" />;
      case "sent":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "expired":
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "opened":
        return "Opened";
      case "sent":
        return "Sent";
      case "expired":
        return "Expired";
      default:
        return "Unknown";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold py-1 sm:py-0">Track Reports</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm w-full sm:w-[320px] focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              {filterStatus ? getStatusText(filterStatus) : "All Statuses"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterStatus(null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("sent")}>
              <Clock className="h-4 w-4 text-amber-500 mr-2" />
              Sent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("opened")}>
              <MailOpen className="h-4 w-4 text-green-500 mr-2" />
              Opened
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("expired")}>
              <Ban className="h-4 w-4 text-red-500 mr-2" />
              Expired
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <GlassCard className="p-0 overflow-hidden border-0 shadow-none">
        <ResponsiveTable>
          <ResponsiveTableHeader>
            <ResponsiveTableRow>
              <ResponsiveTableHead>Report ID</ResponsiveTableHead>
              <ResponsiveTableHead>Patient</ResponsiveTableHead>
              <ResponsiveTableHead>Type</ResponsiveTableHead>
              <ResponsiveTableHead>Sent Date</ResponsiveTableHead>
              <ResponsiveTableHead>Status</ResponsiveTableHead>
              <ResponsiveTableHead className="text-right">Actions</ResponsiveTableHead>
            </ResponsiveTableRow>
          </ResponsiveTableHeader>
          <ResponsiveTableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ResponsiveTableRow key={report.id}>
                  <ResponsiveTableCell className="font-medium">{report.id}</ResponsiveTableCell>
                  <ResponsiveTableCell>
                    <div>
                      <div className="font-medium">{report.patientName}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[150px] md:max-w-[200px] md:break-all">{report.email}</div>
                    </div>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell>{report.type}</ResponsiveTableCell>
                  <ResponsiveTableCell>{formatDate(report.sentDate)}</ResponsiveTableCell>
                  <ResponsiveTableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span>{getStatusText(report.status)}</span>
                    </div>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell className="text-right" data-th="Actions">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          console.log(`Viewing report ${report.id}`);
                          // TODO: Implement view report functionality
                        }}
                      >
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          console.log(`Resending report ${report.id}`);
                          // TODO: Implement resend report functionality
                        }}
                      >
                        Resend
                      </Button>
                    </div>
                  </ResponsiveTableCell>
                </ResponsiveTableRow>
              ))
            ) : (
              <ResponsiveTableRow>
                <ResponsiveTableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No reports found matching your filters
                </ResponsiveTableCell>
              </ResponsiveTableRow>
            )}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </GlassCard>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredReports.length} of {reports.length} reports
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