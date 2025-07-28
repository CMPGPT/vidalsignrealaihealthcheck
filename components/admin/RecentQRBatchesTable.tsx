"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const columns = [
  { key: "packageName", label: "Package Name", align: "left" },
  { key: "count", label: "Count", align: "center" },
  { key: "amount", label: "Amount", align: "center" },
  { key: "status", label: "Status", align: "center" },
  { key: "currency", label: "Currency", align: "center" },
  { key: "paymentMethod", label: "Payment Method", align: "center" },
  { key: "paymentDate", label: "Payment Date", align: "center" },
];

const statusColor = (status: string) => {
  if (status === "completed") return "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]";
  if (status === "pending") return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
  if (status === "failed") return "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]";
  return "bg-[hsl(var(--border))] text-[hsl(var(--foreground))]";
};

export default function RecentQRBatchesTable({ data = [] }: { data?: any[] }) {
  return (
    <div className="w-full rounded-xl border text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border-[hsl(var(--border))]" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 text-[hsl(var(--foreground))]">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`font-semibold text-sm py-3 px-4 border-b border-[hsl(var(--border))] ${col.align === "center" ? "text-center" : "text-left"}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6">No data available</TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={idx} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/60 transition-colors">
                  <TableCell className="py-3 px-4 text-left align-middle">{row.packageName}</TableCell>
                  <TableCell className="py-3 px-4 text-center align-middle">{row.count}</TableCell>
                  <TableCell className="py-3 px-4 text-center align-middle">{row.amount}</TableCell>
                  <TableCell className="py-3 px-4 text-center align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${statusColor(row.status)}`}>{row.status}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center align-middle">{row.currency?.toUpperCase()}</TableCell>
                  <TableCell className="py-3 px-4 text-center align-middle">{row.paymentMethod}</TableCell>
                  <TableCell className="py-3 px-4 text-center align-middle">
                    {new Date(row.paymentDate).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    }).toUpperCase()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 