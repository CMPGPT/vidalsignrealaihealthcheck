'use client';

import React, { memo } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { cn } from '@/lib/utils';

type ResponsiveTableProps = React.ComponentProps<typeof Table>;
type ResponsiveTableHeaderProps = React.ComponentProps<typeof Thead>;
type ResponsiveTableBodyProps = React.ComponentProps<typeof Tbody>;
type ResponsiveTableRowProps = React.ComponentProps<typeof Tr>;
type ResponsiveTableHeadProps = React.ComponentProps<typeof Th>;
type ResponsiveTableCellProps = React.ComponentProps<typeof Td>;

// Memoized table components for better performance
export const ResponsiveTable = memo(({ 
  className, 
  ...props 
}: ResponsiveTableProps) => (
  <div className="w-full">
    <Table
      className={cn("w-full responsiveTable caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
ResponsiveTable.displayName = "ResponsiveTable";

export const ResponsiveTableHeader = memo(({
  className,
  ...props
}: ResponsiveTableHeaderProps) => (
  <Thead
    className={cn(className)}
    {...props}
  />
));
ResponsiveTableHeader.displayName = "ResponsiveTableHeader";

export const ResponsiveTableBody = memo(({
  className,
  ...props
}: ResponsiveTableBodyProps) => (
  <Tbody
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
ResponsiveTableBody.displayName = "ResponsiveTableBody";

export const ResponsiveTableRow = memo(({
  className,
  ...props
}: ResponsiveTableRowProps) => (
  <Tr
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
ResponsiveTableRow.displayName = "ResponsiveTableRow";

export const ResponsiveTableHead = memo(({
  className,
  ...props
}: ResponsiveTableHeadProps) => (
  <Th
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      "responsive-th",
      className
    )}
    {...props}
  />
));
ResponsiveTableHead.displayName = "ResponsiveTableHead";

export const ResponsiveTableCell = memo(({
  className,
  ...props
}: ResponsiveTableCellProps) => (
  <Td
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      "responsive-td whitespace-normal break-words overflow-hidden max-w-[200px] text-ellipsis",
      className
    )}
    {...props}
  />
));
ResponsiveTableCell.displayName = "ResponsiveTableCell";

// Custom styles to be added to the global CSS
// These styles should be added to your global.css
/*
.responsiveTable td .tdBefore {
  font-weight: 500;
  padding-right: 0.5rem;
  color: hsl(var(--muted-foreground));
}

@media screen and (max-width: 640px) {
  .responsiveTable td {
    border-bottom: 1px solid hsl(var(--border));
    padding: 0.5rem;
  }
  
  .responsiveTable tr {
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .responsiveTable tbody tr:last-child td:last-child {
    border-bottom: none;
  }
}
*/ 