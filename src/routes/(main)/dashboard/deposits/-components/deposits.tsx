import * as React from "react";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import { Cog, Download, Plus, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { TransactionImportDialog } from "@/components/transactions/import-transactions-dialog";
import { dataTableFeatures } from "@/lib/data-table-features";

import type { DepositRow, DepositStatus, PaymentMethod, VerificationStatus } from "./data";
import { depositsColumns } from "./deposits-columns";
import { DepositsTable } from "./deposits-table";
import {
  HEADER_ALIASES,
  importedDate,
  importedNumber,
  pickImportedField,
  type ImportedRecord,
} from "@/lib/transaction-import";



const depositStatuses: DepositStatus[] = [
  "Pending",
  "Processing",
  "Completed",
  "Canceled",
];

const verificationStatuses: VerificationStatus[] = [
  "Pending",
  "Processing",
  "Approved",
  "Canceled",
  "Waiting Correction",
  "In Process",
];

const paymentMethods: PaymentMethod[] = [
  "Flouci",
  "D17",
  "Kashy",
  "Tunisie Telecom",
  "Orange",
  "Ooredoo",
];

function importValue(value: string, fallback: string) {
  return value.trim() || fallback;
}

function buildImportedDeposit(
  record: ImportedRecord,
  index: number,
  existingRows: DepositRow[],
): DepositRow {
  const paymentMethod = paymentMethods.includes(
    pickImportedField(record, HEADER_ALIASES.method) as PaymentMethod,
  )
    ? (pickImportedField(record, HEADER_ALIASES.method) as PaymentMethod)
    : "Flouci";
  const amount = importedNumber(
    pickImportedField(record, HEADER_ALIASES.amount),
  );
  const feePercent = importedNumber(
    pickImportedField(record, HEADER_ALIASES.feePercent),
  );
  const explicitFee = importedNumber(
    pickImportedField(record, HEADER_ALIASES.feeAmount),
  );
  const feeAmount =
    explicitFee > 0 ? explicitFee : Number(((amount * feePercent) / 100).toFixed(2));
  const verificationRaw = pickImportedField(
    record,
    HEADER_ALIASES.verificationStatus,
  );
  const statusRaw =
    pickImportedField(record, HEADER_ALIASES.depositStatus) || "Pending";
  const verificationStatus = verificationStatuses.includes(
    verificationRaw as VerificationStatus,
  )
    ? (verificationRaw as VerificationStatus)
    : "Pending";
  const depositStatus = depositStatuses.includes(statusRaw as DepositStatus)
    ? (statusRaw as DepositStatus)
    : "Pending";
  const processor = importValue(
    pickImportedField(record, HEADER_ALIASES.processor),
    "Unassigned",
  );
  const id =
    pickImportedField(record, HEADER_ALIASES.id) ||
    `IMP-DEP-${Date.now().toString(36).toUpperCase()}-${index + 1}`;
  const matchingImage = existingRows.find(
    (row) => row.paymentMethod === paymentMethod,
  )?.paymentMethodImage;

  return {
    id,
    name: importValue(
      pickImportedField(record, HEADER_ALIASES.name),
      "Imported player",
    ),
    email: importValue(
      pickImportedField(record, HEADER_ALIASES.email),
      "—",
    ),
    date: importValue(
      importedDate(pickImportedField(record, HEADER_ALIASES.date)),
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
    ),
    paymentMethod,
    paymentMethodImage: matchingImage ?? "",
    verificationStatus,
    amount,
    feePercent,
    feeAmount,
    depositStatus,
    processedBy: {
      name: processor,
      image: "",
    },
    indicatorStatus: depositStatus,
  };
}

export function Deposits({ deposits }: { deposits: DepositRow[] }) {
  const [rows, setRows] = React.useState(deposits);
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
  // Keep imported rows visible immediately; the import dialog deduplicates against this state.
    columns: depositsColumns,
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
          <h1 className="text-xl font-semibold tracking-tight">Deposits</h1>
          <p className="text-muted-foreground text-sm">Manage player deposit transactions and payment processing.</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <InputGroup className="h-8 w-64">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-8"
              placeholder="Search deposits..."
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

          <Button variant="outline" size="sm">
            <SlidersHorizontal /> Hide
          </Button>
          <Button variant="outline" size="sm">
            <Cog /> Customize
          </Button>
          <TransactionImportDialog
            kind="deposit"
            title="Deposits"
            existingRows={rows as Array<Record<string, unknown>>}
            buildRow={(record, index) => buildImportedDeposit(record, index, rows)}
            onImport={(importedRows) => {
              setRows((current) => [...importedRows, ...current]);
              table.setPageIndex(0);
            }}
          />
          <Button variant="outline" size="sm">
            <Download /> Export
          </Button>
          <Button size="sm">
            <Plus /> Add Deposit
          </Button>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <DepositsTable table={table} />
      </div>
    </section>
  );
}
