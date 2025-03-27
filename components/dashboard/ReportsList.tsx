'use client';

import { Eye, RotateCcw, MailOpen, Clock, Ban, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import centralized data
import { recentReports } from "@/data/mock/reports";

const ReportsList = () => {
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
        {recentReports.map((report) => (
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
            <ResponsiveTableCell className="text-right">
              <div className="flex sm:justify-end gap-2">
                <Button variant="ghost" size="icon" title="View Report">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Resend Report">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Download PDF</DropdownMenuItem>
                    <DropdownMenuItem>Send to Another Patient</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ResponsiveTableCell>
          </ResponsiveTableRow>
        ))}
      </ResponsiveTableBody>
    </ResponsiveTable>
  );
};

export default ReportsList;
