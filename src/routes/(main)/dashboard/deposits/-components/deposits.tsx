import * as React from "react";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import { Check, Cog, Download, GripVertical, Plus, Search } from "lucide-react";

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

const depositColumnOrder = [
  "depositId",
  "name",
  "paymentMethod",
  "date",
  "verificationStatus",
  "amount",
  "fees",
  "depositStatus",
  "processedBy",
  "actions",
] as const;

const depositColumnLabels: Record<(typeof depositColumnOrder)[number], string> = {
  depositId: "Deposit ID",
  name: "Player",
  paymentMethod: "Payment Method",
  date: "Date",
  verificationStatus: "Verification Status",
  amount: "Amount",
  fees: "Fees",
  depositStatus: "Deposit status",
  processedBy: "Processed By",
  actions: "Actions",
};

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
  const [columnOrder, setColumnOrder] = React.useState<string[]>([
    ...depositColumnOrder,
  ]);
  const [customizeOpen, setCustomizeOpen] = React.useState(false);
  const customizeRef = React.useRef<HTMLDivElement>(null);
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
      columnOrder,
      pagination,
    },
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
  });

  React.useEffect(() => {
    if (!customizeOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        customizeRef.current &&
        !customizeRef.current.contains(event.target as Node)
      ) {
        setCustomizeOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [customizeOpen]);

  const reorderColumns = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setColumnOrder((current) => {
      const next = [...current];
      const sourceIndex = next.indexOf(sourceId);
      const targetIndex = next.indexOf(targetId);

      if (sourceIndex === -1 || targetIndex === -1) return current;

      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const searchableColumn = table.getColumn("search");
  const searchQuery = (searchableColumn?.getFilterValue() as string | undefined) ?? "";

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

          <div className="relative" ref={customizeRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={customizeOpen}
              aria-haspopup="menu"
              onClick={() => setCustomizeOpen((open) => !open)}
            >
              <Cog /> Customize
            </Button>

            {customizeOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-lg bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/10"
              >
                <div className="border-b px-2 pb-2">
                  <p className="text-sm font-medium">Customize columns</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Show, hide, and drag columns to change their order.
                  </p>
                </div>

                <div className="mt-2 max-h-80 overflow-y-auto">
                  {columnOrder
                    .filter((columnId) => columnId !== "search")
                    .map((columnId) => {
                      const column = table.getColumn(columnId);
                      if (!column) return null;

                      const canHide = column.getCanHide();
                      const visible = column.getIsVisible();
                      const label =
                        depositColumnLabels[columnId as keyof typeof depositColumnLabels] ??
                        columnId;

                      return (
                        <div
                          key={columnId}
                          draggable={columnId !== "actions"}
                          onDragStart={() => {
                            if (columnId !== "actions") {
                              customizeRef.current?.setAttribute(
                                "data-dragging-column",
                                columnId,
                              );
                            }
                          }}
                          onDragEnd={() => {
                            customizeRef.current?.removeAttribute(
                              "data-dragging-column",
                            );
                          }}
                          onDragOver={(event) => {
                            if (columnId !== "actions") {
                              event.preventDefault();
                            }
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const sourceId =
                              customizeRef.current?.getAttribute(
                                "data-dragging-column",
                              );
                            if (sourceId) reorderColumns(sourceId, columnId);
                          }}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                        >
                          <GripVertical
                            className={
                              columnId === "actions"
                                ? "size-3.5 text-muted-foreground/35"
                                : "size-3.5 cursor-grab text-muted-foreground"
                            }
                          />
                          <button
                            type="button"
                            disabled={!canHide}
                            role="menuitemcheckbox"
                            aria-checked={visible}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => {
                              if (canHide) column.toggleVisibility(!visible);
                            }}
                          >
                            <span
                              className={
                                visible
                                  ? "flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground"
                                  : "flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-background"
                              }
                            >
                              {visible ? <Check className="size-3" /> : null}
                            </span>
                            <span className="truncate">{label}</span>
                          </button>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">
                  Actions stays visible and cannot be hidden.
                </div>
              </div>
            ) : null}
          </div>
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
