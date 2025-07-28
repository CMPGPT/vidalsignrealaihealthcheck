"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const columns = [
  { key: "header", label: "Header" },
  { key: "sectionType", label: "Section Type" },
  { key: "status", label: "Status" },
  { key: "target", label: "Target" },
  { key: "limit", label: "Limit" },
  { key: "reviewer", label: "Reviewer" },
];

const reviewers = ["Eddie Lake", "Jamik Tashpulatov", "Emily Whalen"];

const dataInit = [
  { header: "Table of contents", sectionType: "Table of contents", status: "Done", target: 29, limit: 24, reviewer: "Eddie Lake" },
  { header: "Cover page", sectionType: "Cover page", status: "In Process", target: 18, limit: 5, reviewer: "Eddie Lake" },
  { header: "Executive summary", sectionType: "Narrative", status: "Done", target: 10, limit: 13, reviewer: "Eddie Lake" },
  { header: "Technical approach", sectionType: "Narrative", status: "Done", target: 27, limit: 23, reviewer: "Jamik Tashpulatov" },
  { header: "Design", sectionType: "Narrative", status: "In Process", target: 2, limit: 16, reviewer: "Jamik Tashpulatov" },
  { header: "Capabilities", sectionType: "Narrative", status: "In Process", target: 20, limit: 8, reviewer: "Jamik Tashpulatov" },
  { header: "Integration with existing systems", sectionType: "Narrative", status: "In Process", target: 19, limit: 21, reviewer: "Jamik Tashpulatov" },
  { header: "Innovation and Advantages", sectionType: "Narrative", status: "Done", target: 25, limit: 26, reviewer: "Assign reviewer" },
  { header: "Overview of EMR's Innovative Solutions", sectionType: "Technical content", status: "Done", target: 7, limit: 23, reviewer: "Assign reviewer" },
  { header: "Advanced Algorithms and Machine Learning", sectionType: "Narrative", status: "Done", target: 30, limit: 28, reviewer: "Assign reviewer" },
];

const statusColor = (status: string) => {
  if (status === "Done") return "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]";
  if (status === "In Process") return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
  return "bg-[hsl(var(--border))] text-[hsl(var(--foreground))]";
};

export default function TestTablePage() {
  const [data, setData] = useState(dataInit);

  const handleReviewerChange = (idx: number, value: string) => {
    setData((prev) => prev.map((row, i) => i === idx ? { ...row, reviewer: value } : row));
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 rounded-xl shadow border text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border-[hsl(var(--border))]" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
      `}</style>
      <h2 className="text-xl font-bold mb-4">Section Table</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
              {columns.map((col) => (
                <TableHead key={col.key} className="font-semibold text-sm py-3 px-4 border-b border-[hsl(var(--border))]">{col.label}</TableHead>
      ))}
    </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/60 transition-colors">
                <TableCell className="py-3 px-4">{row.header}</TableCell>
                <TableCell className="py-3 px-4">
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--muted))] text-xs font-medium border border-[hsl(var(--border))]">
                    {row.sectionType}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(row.status)}`}>
                    {row.status}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 text-right">{row.target}</TableCell>
                <TableCell className="py-3 px-4 text-right">{row.limit}</TableCell>
                <TableCell className="py-3 px-4">
                  {row.reviewer === "Assign reviewer" ? (
                    <select
                      className="bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded px-2 py-1 text-xs text-[hsl(var(--foreground))] focus:outline-none"
                      value={row.reviewer}
                      onChange={e => handleReviewerChange(idx, e.target.value)}
                    >
                      <option value="Assign reviewer">Assign reviewer</option>
                      {reviewers.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-3 py-1 rounded bg-[hsl(var(--muted))] text-xs font-medium border border-[hsl(var(--border))]">{row.reviewer}</span>
                  )}
                    </TableCell>
                  </TableRow>
            ))}
              </TableBody>
            </Table>
            </div>
          </div>
  );
}