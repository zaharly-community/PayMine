import * as React from "react";

import { Link } from "@tanstack/react-router";
import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import { BarChart3, Cog, Download, Plus, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TransactionImportDialog } from "@/components/transactions/import-transactions-dialog";
import {
  HEADER_ALIASES,
  importedDate,
  importedNumber,
  pickImportedField,
  type ImportedRecord,
} from "@/lib/transaction-import";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { dataTableFeatures } from "@/lib/data-table-features";

import type { WithdrawlMethod, WithdrawlRow, WithdrawlStatus } from "./data";
import { withdrawlsColumns } from "./withdrawls-columns";
import { WithdrawlsTable } from "./withdrawls-table";

const withdrawlMethods: WithdrawlMethod[] = ["Flouci", "D17", "Kashy", "Bank Transfer"];

function buildImportedWithdrawl(
  record: ImportedRecord,
  index: number,
  existingRows: WithdrawlRow[],
): WithdrawlRow {
  const rawMethod = pickImportedField(record, HEADER_ALIASES.method) as WithdrawlMethod;
  const withdrawlMethod = withdrawlMethods.includes(rawMethod) ? rawMethod : "Flouci";
  const amount = importedNumber(pickImportedField(record, HEADER_ALIASES.amount));
  const commissionPercent = importedNumber(pickImportedField(record, HEADER_ALIASES.feePercent));
  const explicitCommission = importedNumber(pickImportedField(record, HEADER_ALIASES.feeAmount));
  const commissionAmount = explicitCommission > 0
    ? explicitCommission
    : Number(((amount * commissionPercent) / 100).toFixed(2));
  const statusRaw = pickImportedField(record, HEADER_ALIASES.withdrawlStatus) || "Pending";
  const status: WithdrawlStatus =
    statusRaw === "Completed" || statusRaw === "Waiting Correction"
      ? statusRaw
      : "Pending";
  const processor = pickImportedField(record, HEADER_ALIASES.processor) || "Unassigned";
  const id =
    pickImportedField(record, HEADER_ALIASES.id) ||
    `IMP-WDL-${Date.now().toString(36).toUpperCase()}-${index + 1}`;
  const matchingImage = existingRows.find(
    (row) => row.withdrawlMethod === withdrawlMethod,
  )?.withdrawlMethodImage;

  return {
    id,
    name: pickImportedField(record, HEADER_ALIASES.name) || "Imported player",
    email: pickImportedField(record, HEADER_ALIASES.email) || "—",
    date:
      importedDate(pickImportedField(record, HEADER_ALIASES.date)) ||
      new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
        .format(new Date())
        .replace(",", ""),
    withdrawlMethod,
    withdrawlMethodImage: matchingImage ?? "",
    amount,
    commissionPercent,
    commissionAmount,
    status,
    processedBy: {
      name: processor,
      image: "",
    },
  };
}

export function Withdrawls({ withdrawls }: { withdrawls: WithdrawlRow[] }) {
  const [rows, setRows] = React.useState(withdrawls);
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "date", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({
    search: false,
  });
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const table = useTable({
    features: dataTableFeatures,
    data: rows,
    columns: withdrawlsColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string | undefined) ?? "";

  return (
    <section data-content-padding="false" className="flex min-h-full flex-col bg-background">
      <div className="flex items-start justify-between gap-4 border-b px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Withdrawls</h1>
          <p className="text-muted-foreground text-sm">Manage player withdrawal transactions and payout processing.</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <InputGroup className="h-8 w-64">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-8"
              placeholder="Search withdrawls..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
            <InputGroupAddon align="inline-end">
              <Kbd className="h-4 text-[10px]">⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>

          <Button variant="outline" size="sm" render={<Link to="/dashboard/analytics" />}>
            <BarChart3 /> Analytics
          </Button>

          <Button variant="outline" size="sm">
            <SlidersHorizontal /> Hide
          </Button>
          <Button variant="outline" size="sm">
            <Cog /> Customize
          </Button>
          <TransactionImportDialog
            kind="withdrawl"
            title="Withdrawls"
            existingRows={rows as Array<Record<string, unknown>>}
            buildRow={(record, index) => buildImportedWithdrawl(record, index, rows)}
            onImport={(importedRows) => {
              setRows((current) => [...importedRows, ...current]);
              table.setPageIndex(0);
            }}
          />
          <Button variant="outline" size="sm">
            <Download /> Export
          </Button>
          <Button size="sm">
            <Plus /> Add Withdrawl
          </Button>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <WithdrawlsTable table={table} />
      </div>
    </section>
  );
}
