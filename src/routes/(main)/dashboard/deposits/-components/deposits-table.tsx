import type { MouseEvent } from "react";


import type { ReactTable } from "@tanstack/react-table";
import { LockKeyhole } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DataTableFeatures } from "@/lib/data-table-features";

import type { DepositRow } from "./data";
import { processingLockedRows } from "./deposits-columns";

function preventPaginationNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

function getDepositRowIndicator(status: DepositRow["depositStatus"]) {
  switch (status) {
    case "Completed":
      return "shadow-[inset_5px_0_0_var(--color-emerald-500)]";
    case "Pending":
    case "Processing":
      return "shadow-[inset_5px_0_0_var(--color-amber-400)]";
    case "Canceled":
    default:
      return "shadow-[inset_5px_0_0_var(--color-red-500)]";
  }
}

function ProcessingLockOverlay({ name, colSpan }: { name: string; colSpan: number }) {
  return (
    <TableCell
      colSpan={colSpan}
      className="absolute inset-0 z-30 h-full w-full border-0! bg-background/35 p-0! backdrop-blur-[4px]"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className="flex h-full w-full cursor-not-allowed items-center justify-center">
        <span className="flex items-center justify-center gap-2 text-sm font-medium leading-none text-muted-foreground">
          <LockKeyhole className="size-4 shrink-0" />
          <span>Processing by {name}</span>
        </span>
      </div>
    </TableCell>
  );
}

function getPageNumbers(currentPage: number, pageCount: number) {
  if (pageCount <= 3) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 2) return [1, 2, 3];
  if (currentPage >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];

  return [currentPage - 1, currentPage, currentPage + 1];
}

export function DepositsTable({ table }: { table: ReactTable<DataTableFeatures, DepositRow> }) {
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = Math.min(table.state.pagination.pageIndex + 1, pageCount);
  const pageNumbers = getPageNumbers(currentPage, pageCount);
  const rowsPerPage = `${table.state.pagination.pageSize}`;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <Table className="w-full border-collapse **:data-[slot='table-cell']:border-b **:data-[slot='table-cell']:border-border/70 **:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:border-b **:data-[slot='table-head']:border-border/70 **:data-[slot='table-head']:px-4">
          <TableHeader className="[&_tr]:border-t">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 py-2.5 font-medium text-muted-foreground text-xs">
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-deposit-row-id={row.original.id}
                  className={`relative h-7 border-border/60 transition-colors hover:bg-muted/35 ${getDepositRowIndicator(row.original.depositStatus)}`}
                  data-state={table.state.rowSelection[row.id] && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-0 align-middle leading-none">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                  {processingLockedRows.has(row.original.id) ? (
                    <ProcessingLockOverlay
                      name={row.original.processedBy.name}
                      colSpan={row.getVisibleCells().length}
                    />
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={`${table.state.pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="deposits-rows-per-page">
                <SelectValue placeholder={rowsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[25, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <span>
            Page {currentPage} of {pageCount}
          </span>
        </div>

        <Pagination className="mx-0 w-auto justify-start md:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text=""
                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  preventPaginationNavigation(event);
                  table.previousPage();
                }}
              />
            </PaginationItem>
            {pageNumbers[0] > 1 ? (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            ) : null}
            {pageNumbers.map((pageNumber) => (
              <PaginationItem key={`page-${pageNumber}`}>
                <PaginationLink
                  href="#"
                  isActive={table.state.pagination.pageIndex === pageNumber - 1}
                  onClick={(event) => {
                    preventPaginationNavigation(event);
                    table.setPageIndex(pageNumber - 1);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            {pageNumbers[pageNumbers.length - 1] < pageCount ? (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <PaginationNext
                href="#"
                text=""
                className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  preventPaginationNavigation(event);
                  table.nextPage();
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
