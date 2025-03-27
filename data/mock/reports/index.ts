// Define report types
export interface Report {
  id: string;
  patientName: string;
  email: string;
  sentDate: string;
  status: 'opened' | 'sent' | 'expired' | 'failed';
  type: string;
}

// Recent reports mock data
export const recentReports: Report[] = [
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
  }
];

export default {
  recentReports
}; 