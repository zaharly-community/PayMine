import type { MouseEvent } from "react";


import type { ReactTable } from "@tanstack/react-table";
import { ArrowDownRight, LockKeyhole } from "lucide-react";

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

import { formatCurrency } from "@/lib/utils";

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
      <div className="hidden md:block">
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

      <div className="divide-y md:hidden">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const deposit = row.original;
            const statusCell = row.getAllCells().find((cell) => cell.column.id === "depositStatus");
            const verificationCell = row.getAllCells().find((cell) => cell.column.id === "verificationStatus");
            const actionsCell = row.getAllCells().find((cell) => cell.column.id === "actions");
            const isLocked = processingLockedRows.has(deposit.id);

            return (
              <div
                key={row.id}
                data-mobile-deposit-row-id={deposit.id}
                data-state={table.state.rowSelection[row.id] && "selected"}
                className={`relative min-w-0 px-3 py-3 transition-colors hover:bg-muted/30 ${getDepositRowIndicator(deposit.depositStatus)}`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
                    <ArrowDownRight className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">{deposit.name}</span>
                      <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(deposit.amount)}
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">Deposit · {deposit.paymentMethod}</span>
                      <span className="shrink-0">{statusCell ? <table.FlexRender cell={statusCell} /> : null}</span>
                    </div>
                    <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] leading-4 text-muted-foreground">
                      <span className="shrink-0 font-mono">{deposit.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="min-w-0 truncate">{deposit.date}</span>
                    </div>
                    <div className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {verificationCell ? <table.FlexRender cell={verificationCell} /> : null}
                        <span className="text-[10px] text-muted-foreground">
                          Fee: {deposit.feePercent > 0 ? `${deposit.feePercent}% · ${formatCurrency(deposit.feeAmount)}` : "Not concerned"}
                        </span>
                        <span className="max-w-full truncate text-[10px] text-muted-foreground">By {deposit.processedBy.name}</span>
                      </div>
                      {actionsCell ? <div className="ml-auto shrink-0"><table.FlexRender cell={actionsCell} /></div> : null}
                    </div>
                  </div>
                </div>
                {isLocked ? (
                  <div
                    className="absolute inset-0 z-20 flex cursor-not-allowed items-center justify-center bg-background/65 px-3 backdrop-blur-[3px]"
                    onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
                    onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <LockKeyhole className="size-4 shrink-0" />
                      Processing by {deposit.processedBy.name}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">No results.</div>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-3 px-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground text-xs sm:gap-4 sm:text-sm">
          <div className="flex items-center gap-2">
            <span><span className="sm:hidden">Rows</span><span className="hidden sm:inline">Rows per page</span></span>
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

        <Pagination className="mx-0 w-auto justify-start sm:justify-end">
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
