import * as React from "react";

import { Link } from "@tanstack/react-router";
import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import { BarChart3, Check, Cog, Download, GripVertical, Plus, Search } from "lucide-react";

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
  const [columnOrder, setColumnOrder] = React.useState<string[]>([
    "withdrawlId",
    "name",
    "withdrawlMethod",
    "date",
    "amount",
    "status",
    "processedBy",
    "actions",
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
    columns: withdrawlsColumns,
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
      if (customizeRef.current && !customizeRef.current.contains(event.target as Node)) {
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
              <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-lg bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
                <div className="border-b px-2 pb-2">
                  <p className="text-sm font-medium">Customize columns</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Show, hide, and drag columns to change their order.</p>
                </div>
                <div className="mt-2 max-h-80 overflow-y-auto">
                  {table.getAllLeafColumns()
                    .filter((column) => column.id !== "search")
                    .map((column) => {
                      const visible = column.getIsVisible();
                      const canHide = column.getCanHide();
                      const labelMap: Record<string, string> = {
                        withdrawlId: "Withdrawls ID",
                        name: "Player",
                        withdrawlMethod: "Withdrawl Method",
                        date: "date",
                        amount: "Amount",
                        status: "Status",
                        processedBy: "Processed By",
                        actions: "Actions",
                      };
                      return (
                        <div
                          key={column.id}
                          draggable={column.id !== "actions"}
                          onDragStart={() => {
                            if (column.id !== "actions") customizeRef.current?.setAttribute("data-dragging-column", column.id);
                          }}
                          onDragEnd={() => customizeRef.current?.removeAttribute("data-dragging-column")}
                          onDragOver={(event) => {
                            if (column.id !== "actions") event.preventDefault();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const sourceId = customizeRef.current?.getAttribute("data-dragging-column");
                            if (sourceId) reorderColumns(sourceId, column.id);
                          }}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                        >
                          <GripVertical className={column.id === "actions" ? "size-3.5 text-muted-foreground/35" : "size-3.5 cursor-grab text-muted-foreground"} />
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
                            <span className={visible ? "flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground" : "flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-background"}>
                              {visible ? <Check className="size-3" /> : null}
                            </span>
                            <span className="truncate">{labelMap[column.id] ?? column.id}</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">Actions stays visible and cannot be hidden.</div>
              </div>
            ) : null}
          </div>
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
